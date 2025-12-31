"""
Reviewer Agent - Prüft Code-Qualität mit Fix-Loop Support.

Reviewed die Änderungen vom Builder und gibt strukturierte Findings
mit fix_required Flag und fix_instructions zurück.
"""

import asyncio
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any
from enum import Enum

from claude_code_sdk import query, ClaudeCodeOptions


class ReviewStatus(Enum):
    """Review Status."""
    APPROVED = "approved"
    NEEDS_CHANGES = "needs_changes"
    PENDING = "pending"


@dataclass
class Finding:
    """Ein einzelnes Finding aus dem Review."""
    id: str
    severity: str  # "critical", "major", "minor"
    location: str  # file:line
    problem: str
    fix_instruction: str
    fix_code: str = ""
    fix_agent: str = "builder"  # Welcher Agent soll fixen


@dataclass
class ReviewResult:
    """Ergebnis des Reviewer Agents mit Fix-Loop Support."""
    status: ReviewStatus = ReviewStatus.PENDING
    fix_required: bool = False
    summary: str = ""
    findings: list[Finding] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    success: bool = True
    error: str | None = None

    def to_dict(self) -> dict:
        """Konvertiert zu Dict für JSON."""
        return {
            "status": self.status.value,
            "fix_required": self.fix_required,
            "summary": self.summary,
            "findings": [
                {
                    "id": f.id,
                    "severity": f.severity,
                    "location": f.location,
                    "problem": f.problem,
                    "fix_instruction": f.fix_instruction,
                    "fix_code": f.fix_code,
                    "fix_agent": f.fix_agent
                }
                for f in self.findings
            ],
            "suggestions": self.suggestions,
            "success": self.success,
            "error": self.error
        }


class ReviewerAgent:
    """
    Reviewer Agent - Prüft Code-Qualität mit Fix-Loop Support.

    Der Reviewer analysiert die Änderungen vom Builder
    und gibt strukturierte Findings zurück die vom
    Orchestrator für Fix-Loops verwendet werden können.
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()
        self._review_count = 0

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "reviewer.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Grep", "Bash", "mcp__playwright__*"],
            cwd=self.working_dir,
        )

    def _parse_findings(self, response: str) -> list[Finding]:
        """Parst Findings aus der Response."""
        findings = []
        current_finding = {}
        finding_count = 0

        lines = response.split('\n')
        in_findings = False

        for line in lines:
            line_stripped = line.strip()

            # Start of findings section
            if 'FINDINGS' in line_stripped.upper() or 'ISSUES' in line_stripped.upper():
                in_findings = True
                continue

            # End of findings section
            if in_findings and line_stripped.startswith('#') and 'FINDING' not in line_stripped.upper():
                in_findings = False

            if not in_findings:
                continue

            # Parse finding fields
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
            elif line_stripped.startswith('- fix_code:') or line_stripped.startswith('fix_code:'):
                current_finding['fix_code'] = line_stripped.split(':', 1)[1].strip()
            elif line_stripped.startswith('- fix_agent:') or line_stripped.startswith('fix_agent:'):
                current_finding['fix_agent'] = line_stripped.split(':', 1)[1].strip()

        # Add last finding
        if current_finding:
            findings.append(self._create_finding(current_finding, finding_count))

        return findings

    def _create_finding(self, data: dict, index: int) -> Finding:
        """Erstellt ein Finding aus parsed data."""
        return Finding(
            id=data.get('id', f'issue-{index:03d}'),
            severity=data.get('severity', 'major'),
            location=data.get('location', 'unknown'),
            problem=data.get('problem', 'Unknown issue'),
            fix_instruction=data.get('fix_instruction', 'Review and fix manually'),
            fix_code=data.get('fix_code', ''),
            fix_agent=data.get('fix_agent', 'builder')
        )

    async def review(
        self,
        spec: str,
        files_modified: list[str],
        files_created: list[str],
        on_message: callable = None
    ) -> ReviewResult:
        """
        Reviewed die Änderungen mit strukturierten Findings.

        Args:
            spec: Original Specification
            files_modified: Liste der geänderten Files
            files_created: Liste der neuen Files
            on_message: Callback für Streaming Messages

        Returns:
            ReviewResult mit fix_required Flag und Findings
        """
        self._review_count += 1

        files_list = "\n".join(
            [f"- {f} (modified)" for f in files_modified] +
            [f"- {f} (created)" for f in files_created]
        )

        prompt = f"""
Review the following implementation:

## Original Specification
{spec}

## Files Changed
{files_list}

## Instructions
1. Read each modified/created file
2. Verify the implementation matches the spec
3. Check for bugs, issues, and code quality
4. Run tests if available (use read-only bash commands)

## CRITICAL: Output Format

You MUST output your review in this EXACT format:

### STATUS: APPROVED or NEEDS_CHANGES

### FIX_REQUIRED: true or false

### SUMMARY
[Your overall assessment]

### FINDINGS (if FIX_REQUIRED is true)
For each issue found, use this format:

#### Finding 1
- id: issue-001
- severity: critical | major | minor
- location: path/to/file.py:42
- problem: Description of the problem
- fix_instruction: How to fix this issue
- fix_code: |
    // Before:
    old_code_here
    // After:
    new_code_here
- fix_agent: builder

### SUGGESTIONS (optional improvements)
- Suggestion 1
- Suggestion 2
"""

        response_content = []
        findings = []
        suggestions = []
        status = ReviewStatus.PENDING
        fix_required = False

        try:
            async for message in query(prompt=prompt, options=self._get_options()):
                # Callback für UI Updates
                if on_message:
                    on_message(message)

                # Text sammeln
                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'text'):
                            response_content.append(block.text)

            full_response = "".join(response_content)

            # Status parsen
            if "STATUS: APPROVED" in full_response.upper() or "### STATUS: APPROVED" in full_response.upper():
                status = ReviewStatus.APPROVED
                fix_required = False
            elif "NEEDS_CHANGES" in full_response.upper():
                status = ReviewStatus.NEEDS_CHANGES

            # Fix required parsen
            if "FIX_REQUIRED: TRUE" in full_response.upper():
                fix_required = True
            elif "FIX_REQUIRED: FALSE" in full_response.upper():
                fix_required = False
            else:
                # Infer from status
                fix_required = status == ReviewStatus.NEEDS_CHANGES

            # Findings parsen
            if fix_required:
                findings = self._parse_findings(full_response)

            # Suggestions parsen
            in_suggestions = False
            for line in full_response.split('\n'):
                line = line.strip()
                if 'SUGGESTIONS' in line.upper():
                    in_suggestions = True
                    continue
                if in_suggestions and line.startswith('#'):
                    in_suggestions = False
                if in_suggestions and line.startswith('- '):
                    suggestions.append(line[2:])

            return ReviewResult(
                status=status,
                fix_required=fix_required,
                summary=full_response,
                findings=findings,
                suggestions=suggestions,
                success=True
            )

        except Exception as e:
            return ReviewResult(
                success=False,
                error=str(e)
            )

    async def validate_fix(
        self,
        previous_findings: list[Finding],
        files_modified: list[str],
        fix_loop_count: int,
        on_message: callable = None
    ) -> ReviewResult:
        """
        Re-validiert nach einem Fix.

        Args:
            previous_findings: Die Findings die gefixt werden sollten
            files_modified: Die geänderten Files
            fix_loop_count: Aktueller Loop Count
            on_message: Callback für Streaming Messages

        Returns:
            ReviewResult mit verbleibenden Issues
        """
        findings_summary = "\n".join([
            f"- {f.id}: {f.problem} at {f.location}"
            for f in previous_findings
        ])

        files_list = "\n".join([f"- {f}" for f in files_modified])

        prompt = f"""
Re-validate after fix attempt #{fix_loop_count}.

## Previous Findings (should be fixed now)
{findings_summary}

## Files Modified
{files_list}

## Instructions
1. Read the modified files
2. Check if the previous issues are ACTUALLY fixed
3. Look for any NEW issues introduced by the fix
4. Be thorough - don't just assume fixes worked

## CRITICAL: Output Format

### FIX_REQUIRED: true or false

### VALIDATION_RESULT
For each previous finding, state if it's fixed:
- issue-001: FIXED | STILL_PRESENT
- issue-002: FIXED | STILL_PRESENT

### NEW_ISSUES (if any new problems were introduced)
Use the same Finding format as before.

### SUMMARY
Overall assessment of the fix attempt.
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

            # Parse fix_required
            fix_required = "FIX_REQUIRED: TRUE" in full_response.upper()

            # Parse remaining/new findings
            findings = []
            if fix_required:
                findings = self._parse_findings(full_response)

            status = ReviewStatus.NEEDS_CHANGES if fix_required else ReviewStatus.APPROVED

            return ReviewResult(
                status=status,
                fix_required=fix_required,
                summary=full_response,
                findings=findings,
                success=True
            )

        except Exception as e:
            return ReviewResult(
                success=False,
                error=str(e)
            )

    async def stream_review(
        self,
        spec: str,
        files_modified: list[str],
        files_created: list[str]
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Streamt den Review-Prozess.

        Yields dicts mit type und data für jeden Event.
        """
        files_list = "\n".join(
            [f"- {f} (modified)" for f in files_modified] +
            [f"- {f} (created)" for f in files_created]
        )

        prompt = f"""
Review the following implementation:

## Original Specification
{spec}

## Files Changed
{files_list}

Review the code and provide:
- STATUS: APPROVED or NEEDS_CHANGES
- FIX_REQUIRED: true or false
- FINDINGS with fix_instruction if FIX_REQUIRED is true
"""

        async for message in query(prompt=prompt, options=self._get_options()):
            # Tool Calls
            if hasattr(message, 'content'):
                for block in message.content:
                    if hasattr(block, 'name'):
                        yield {
                            "type": "tool_call",
                            "tool": block.name,
                            "input": block.input
                        }
                    elif hasattr(block, 'text'):
                        yield {
                            "type": "text",
                            "content": block.text
                        }

            # Tool Results
            if hasattr(message, 'tool_use_id'):
                yield {
                    "type": "tool_result",
                    "tool_id": message.tool_use_id
                }

            # Final Stats
            if hasattr(message, 'total_cost_usd'):
                yield {
                    "type": "complete",
                    "stats": {
                        "duration_ms": getattr(message, 'duration_ms', 0),
                        "cost_usd": message.total_cost_usd
                    }
                }
