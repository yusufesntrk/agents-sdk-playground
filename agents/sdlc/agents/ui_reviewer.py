"""
UI Reviewer Agent - Visual/Layout Checks mit Screenshot-Analyse.

Prüft UI-Elemente auf visuelle Korrektheit, Layout-Konsistenz
und gibt strukturierte Findings zurück.
"""

import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any

from claude_code_sdk import query, ClaudeCodeOptions

from .reviewer import Finding, ReviewResult, ReviewStatus


@dataclass
class UIReviewResult(ReviewResult):
    """Erweitertes Result für UI Reviews."""
    screenshot_path: str = ""
    visual_issues: list[str] = field(default_factory=list)
    layout_issues: list[str] = field(default_factory=list)
    accessibility_issues: list[str] = field(default_factory=list)


class UIReviewerAgent:
    """
    UI Reviewer Agent - Prüft visuelle Aspekte.

    Analysiert Screenshots und Code auf:
    - Layout-Probleme
    - Visuelle Inkonsistenzen
    - Accessibility-Issues
    - Pattern-Verletzungen
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt aus der .md Datei."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "ui_reviewer.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Grep", "Glob", "Bash", "mcp__playwright__*"],
            cwd=self.working_dir,
        )

    async def review(
        self,
        component_paths: list[str],
        screenshot_path: str = "",
        on_message: callable = None
    ) -> UIReviewResult:
        """
        Führt UI Review durch.

        Args:
            component_paths: Pfade zu den Komponenten
            screenshot_path: Optional: Pfad zum Screenshot
            on_message: Callback für Streaming Messages

        Returns:
            UIReviewResult mit Findings und visuellen Issues
        """
        components_list = "\n".join([f"- {p}" for p in component_paths])

        screenshot_section = ""
        if screenshot_path:
            screenshot_section = f"""
## Screenshot
Analyze the screenshot at: {screenshot_path}
"""

        prompt = f"""
Perform a UI Review for the following components:

## Components to Review
{components_list}
{screenshot_section}

## Instructions
1. Read each component file
2. Look for UI anti-patterns
3. Check for visual/layout issues
4. Verify pattern compliance
5. Check accessibility basics

Output your findings in the required format with FIX_REQUIRED flag.
"""

        response_content = []
        visual_issues = []
        layout_issues = []
        accessibility_issues = []
        findings = []
        fix_required = False

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

            # Parse different issue types
            visual_issues = self._parse_section(full_response, "VISUAL_ISSUES")
            layout_issues = self._parse_section(full_response, "LAYOUT_ISSUES")
            accessibility_issues = self._parse_section(full_response, "ACCESSIBILITY_ISSUES")

            # Parse findings
            if fix_required:
                findings = self._parse_findings(full_response)

            status = ReviewStatus.NEEDS_CHANGES if fix_required else ReviewStatus.APPROVED

            return UIReviewResult(
                status=status,
                fix_required=fix_required,
                summary=full_response,
                findings=findings,
                visual_issues=visual_issues,
                layout_issues=layout_issues,
                accessibility_issues=accessibility_issues,
                screenshot_path=screenshot_path,
                success=True
            )

        except Exception as e:
            return UIReviewResult(
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

        if current_finding:
            findings.append(self._create_finding(current_finding, finding_count))

        return findings

    def _create_finding(self, data: dict, index: int) -> Finding:
        """Erstellt ein Finding aus parsed data."""
        return Finding(
            id=data.get('id', f'ui-issue-{index:03d}'),
            severity=data.get('severity', 'major'),
            location=data.get('location', 'unknown'),
            problem=data.get('problem', 'Unknown UI issue'),
            fix_instruction=data.get('fix_instruction', 'Review and fix manually'),
            fix_code=data.get('fix_code', ''),
            fix_agent=data.get('fix_agent', 'builder')
        )

    async def validate_fix(
        self,
        previous_findings: list[Finding],
        component_paths: list[str],
        fix_loop_count: int,
        screenshot_path: str = "",
        on_message: callable = None
    ) -> UIReviewResult:
        """
        Re-validiert UI nach einem Fix.

        Args:
            previous_findings: Die Findings die gefixt werden sollten
            component_paths: Die Komponenten-Pfade
            fix_loop_count: Aktueller Loop Count
            screenshot_path: Optional: Neuer Screenshot nach Fix
            on_message: Callback

        Returns:
            UIReviewResult mit verbleibenden Issues
        """
        findings_summary = "\n".join([
            f"- {f.id}: {f.problem} at {f.location}"
            for f in previous_findings
        ])

        components_list = "\n".join([f"- {p}" for p in component_paths])

        prompt = f"""
Re-validate UI after fix attempt #{fix_loop_count}.

## Previous UI Findings (should be fixed now)
{findings_summary}

## Components to Check
{components_list}

## Instructions
1. Read the modified components
2. Verify the previous UI issues are ACTUALLY fixed
3. Look for any NEW visual/layout issues introduced
4. Be thorough with the visual inspection

## Output Format
### FIX_REQUIRED: true or false

### VALIDATION_RESULT
For each previous finding:
- ui-issue-001: FIXED | STILL_PRESENT
- ui-issue-002: FIXED | STILL_PRESENT

### NEW_ISSUES (if any)
Use the standard Finding format.

### SUMMARY
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

            findings = []
            if fix_required:
                findings = self._parse_findings(full_response)

            status = ReviewStatus.NEEDS_CHANGES if fix_required else ReviewStatus.APPROVED

            return UIReviewResult(
                status=status,
                fix_required=fix_required,
                summary=full_response,
                findings=findings,
                screenshot_path=screenshot_path,
                success=True
            )

        except Exception as e:
            return UIReviewResult(
                success=False,
                error=str(e)
            )
