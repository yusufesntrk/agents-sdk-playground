"""
QA Agent - Final Quality Check vor Ship.

Führt einen umfassenden Quality Check durch:
- Console Errors prüfen
- Runtime Errors erkennen
- Performance-Basics checken
- User Experience validieren
"""

import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any
from enum import Enum

from claude_code_sdk import query, ClaudeCodeOptions

from .reviewer import Finding, ReviewStatus


class QAStatus(Enum):
    """QA Check Status."""
    PASSED = "passed"
    FAILED = "failed"
    PARTIAL = "partial"


@dataclass
class QAResult:
    """Ergebnis des QA Agents."""
    status: QAStatus = QAStatus.PASSED
    fix_required: bool = False
    console_errors: list[str] = field(default_factory=list)
    runtime_errors: list[str] = field(default_factory=list)
    performance_issues: list[str] = field(default_factory=list)
    ux_issues: list[str] = field(default_factory=list)
    findings: list[Finding] = field(default_factory=list)
    summary: str = ""
    success: bool = True
    error: str | None = None

    def to_dict(self) -> dict:
        """Konvertiert zu Dict für JSON."""
        return {
            "status": self.status.value,
            "fix_required": self.fix_required,
            "console_errors": self.console_errors,
            "runtime_errors": self.runtime_errors,
            "performance_issues": self.performance_issues,
            "ux_issues": self.ux_issues,
            "findings": [
                {
                    "id": f.id,
                    "severity": f.severity,
                    "location": f.location,
                    "problem": f.problem,
                    "fix_instruction": f.fix_instruction,
                    "fix_agent": f.fix_agent
                }
                for f in self.findings
            ],
            "summary": self.summary,
            "success": self.success,
            "error": self.error
        }


class QAAgent:
    """
    QA Agent - Final Quality Assurance.

    Der QA Agent prüft:
    1. Console auf Errors/Warnings
    2. Runtime-Verhalten
    3. Performance-Basics
    4. User Experience
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt aus der .md Datei."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "qa.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Grep", "Bash", "Glob", "mcp__playwright__*"],
            cwd=self.working_dir,
        )

    async def check(
        self,
        feature_name: str,
        files_created: list[str],
        files_modified: list[str],
        on_message: callable = None
    ) -> QAResult:
        """
        Führt QA Check durch.

        Args:
            feature_name: Name des Features
            files_created: Erstellte Files
            files_modified: Geänderte Files
            on_message: Callback

        Returns:
            QAResult mit Status und ggf. Findings
        """
        files_list = "\n".join([
            f"- {f} (created)" for f in files_created
        ] + [
            f"- {f} (modified)" for f in files_modified
        ])

        prompt = f"""
Perform final QA check for feature: {feature_name}

## Files to Check
{files_list}

## Instructions
1. Check for TypeScript errors: npx tsc --noEmit
2. Check build: npm run build (if available)
3. Look for common issues in the code:
   - Console.log statements that should be removed
   - TODO comments
   - Hardcoded values
   - Missing error handling
4. Verify loading and error states exist

Output your findings in the required format with FIX_REQUIRED flag.
"""

        response_content = []
        console_errors = []
        runtime_errors = []
        performance_issues = []
        ux_issues = []
        findings = []

        try:
            async for message in query(prompt=prompt, options=self._get_options()):
                if on_message:
                    on_message(message)

                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'text'):
                            response_content.append(block.text)

            full_response = "".join(response_content)

            # Parse status
            fix_required = "FIX_REQUIRED: TRUE" in full_response.upper()

            if "QA_STATUS: PASSED" in full_response.upper():
                status = QAStatus.PASSED
            elif "QA_STATUS: PARTIAL" in full_response.upper():
                status = QAStatus.PARTIAL
            else:
                status = QAStatus.FAILED if fix_required else QAStatus.PASSED

            # Parse different issue types
            console_errors = self._parse_section(full_response, "CONSOLE_ERRORS")
            runtime_errors = self._parse_section(full_response, "RUNTIME_ERRORS")
            performance_issues = self._parse_section(full_response, "PERFORMANCE_ISSUES")
            ux_issues = self._parse_section(full_response, "UX_ISSUES")

            # Parse findings
            if fix_required:
                findings = self._parse_findings(full_response)

            return QAResult(
                status=status,
                fix_required=fix_required,
                console_errors=console_errors,
                runtime_errors=runtime_errors,
                performance_issues=performance_issues,
                ux_issues=ux_issues,
                findings=findings,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return QAResult(
                success=False,
                error=str(e)
            )

    def _parse_section(self, response: str, section_name: str) -> list[str]:
        """Parst eine Section aus der Response."""
        issues = []
        in_section = False

        for line in response.split('\n'):
            line_stripped = line.strip()
            if section_name.upper() in line_stripped.upper():
                in_section = True
                continue
            if in_section and line_stripped.startswith('#'):
                in_section = False
            if in_section and line_stripped.startswith('- '):
                issues.append(line_stripped[2:])

        return issues

    def _parse_findings(self, response: str) -> list[Finding]:
        """Parst Findings aus der Response."""
        findings = []
        current_finding = {}
        finding_count = 0

        lines = response.split('\n')
        in_findings = False

        for line in lines:
            line_stripped = line.strip()

            if 'FINDINGS' in line_stripped.upper():
                in_findings = True
                continue

            if in_findings and line_stripped.startswith('#') and 'FINDING' not in line_stripped.upper():
                in_findings = False

            if not in_findings:
                continue

            if line_stripped.startswith('- id:') or line_stripped.startswith('id:'):
                if current_finding:
                    findings.append(self._create_finding(current_finding, finding_count))
                    finding_count += 1
                current_finding = {'id': line_stripped.split(':', 1)[1].strip()}
            elif line_stripped.startswith('- severity:') or line_stripped.startswith('severity:'):
                current_finding['severity'] = line_stripped.split(':', 1)[1].strip()
            elif line_stripped.startswith('- location:') or line_stripped.startswith('location:'):
                current_finding['location'] = line_stripped.split(':', 1)[1].strip()
            elif line_stripped.startswith('- problem:') or line_stripped.startswith('problem:'):
                current_finding['problem'] = line_stripped.split(':', 1)[1].strip()
            elif line_stripped.startswith('- fix_instruction:') or line_stripped.startswith('fix_instruction:'):
                current_finding['fix_instruction'] = line_stripped.split(':', 1)[1].strip()
            elif line_stripped.startswith('- fix_agent:') or line_stripped.startswith('fix_agent:'):
                current_finding['fix_agent'] = line_stripped.split(':', 1)[1].strip()

        if current_finding:
            findings.append(self._create_finding(current_finding, finding_count))

        return findings

    def _create_finding(self, data: dict, index: int) -> Finding:
        """Erstellt ein Finding."""
        return Finding(
            id=data.get('id', f'qa-issue-{index:03d}'),
            severity=data.get('severity', 'major'),
            location=data.get('location', 'unknown'),
            problem=data.get('problem', 'Unknown QA issue'),
            fix_instruction=data.get('fix_instruction', 'Review and fix'),
            fix_code=data.get('fix_code', ''),
            fix_agent=data.get('fix_agent', 'builder')
        )

    async def validate_fix(
        self,
        previous_findings: list[Finding],
        files_modified: list[str],
        fix_loop_count: int,
        on_message: callable = None
    ) -> QAResult:
        """
        Re-validiert nach einem Fix.

        Args:
            previous_findings: Die Findings die gefixt werden sollten
            files_modified: Die geänderten Files
            fix_loop_count: Aktueller Loop Count
            on_message: Callback

        Returns:
            QAResult mit aktuellem Status
        """
        findings_summary = "\n".join([
            f"- {f.id}: {f.problem} at {f.location}"
            for f in previous_findings
        ])

        files_list = "\n".join([f"- {f}" for f in files_modified])

        prompt = f"""
Re-validate QA after fix attempt #{fix_loop_count}.

## Previous QA Findings (should be fixed now)
{findings_summary}

## Files Modified
{files_list}

## Instructions
1. Verify the previous issues are fixed
2. Run the same checks again
3. Look for any new issues

### FIX_REQUIRED: true or false

### VALIDATION_RESULT
For each previous finding:
- qa-issue-001: FIXED | STILL_PRESENT

### NEW_ISSUES (if any)
Use the standard Finding format.

### QA_STATUS: PASSED | FAILED | PARTIAL
"""

        response_content = []

        try:
            async for message in query(prompt=prompt, options=self._get_options()):
                if on_message:
                    on_message(message)
                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'text'):
                            response_content.append(block.text)

            full_response = "".join(response_content)

            fix_required = "FIX_REQUIRED: TRUE" in full_response.upper()

            if "QA_STATUS: PASSED" in full_response.upper():
                status = QAStatus.PASSED
            elif "QA_STATUS: PARTIAL" in full_response.upper():
                status = QAStatus.PARTIAL
            else:
                status = QAStatus.FAILED if fix_required else QAStatus.PASSED

            findings = []
            if fix_required:
                findings = self._parse_findings(full_response)

            return QAResult(
                status=status,
                fix_required=fix_required,
                findings=findings,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return QAResult(
                success=False,
                error=str(e)
            )
