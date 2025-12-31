"""
Debugger Agent - Problem-Analyse bei Fehlern.

Analysiert Fehler und gibt strukturierte Root Cause Analysis
mit Fix-Instructions zurück.
"""

import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any
from enum import Enum

from claude_code_sdk import query, ClaudeCodeOptions

from .reviewer import Finding


class DebugStatus(Enum):
    """Debug Analysis Status."""
    ROOT_CAUSE_FOUND = "root_cause_found"
    NEEDS_MORE_INFO = "needs_more_info"
    INCONCLUSIVE = "inconclusive"


@dataclass
class DebugResult:
    """Ergebnis des Debugger Agents."""
    status: DebugStatus = DebugStatus.INCONCLUSIVE
    fix_required: bool = True
    root_cause: str = ""
    affected_files: list[str] = field(default_factory=list)
    stack_trace: str = ""
    findings: list[Finding] = field(default_factory=list)
    investigation_steps: list[str] = field(default_factory=list)
    summary: str = ""
    success: bool = True
    error: str | None = None

    def to_dict(self) -> dict:
        """Konvertiert zu Dict für JSON."""
        return {
            "status": self.status.value,
            "fix_required": self.fix_required,
            "root_cause": self.root_cause,
            "affected_files": self.affected_files,
            "stack_trace": self.stack_trace,
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
            "investigation_steps": self.investigation_steps,
            "summary": self.summary,
            "success": self.success,
            "error": self.error
        }


class DebuggerAgent:
    """
    Debugger Agent - Analysiert Probleme und findet Root Causes.

    Der Debugger:
    1. Analysiert Error Messages und Stack Traces
    2. Untersucht relevanten Code
    3. Identifiziert die Root Cause
    4. Gibt strukturierte Fix-Instructions
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt aus der .md Datei."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "debugger.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Grep", "Bash", "Glob", "mcp__playwright__*"],
            cwd=self.working_dir,
        )

    async def debug(
        self,
        error_message: str,
        context: str = "",
        affected_files: list[str] = None,
        stack_trace: str = "",
        on_message: callable = None
    ) -> DebugResult:
        """
        Debuggt einen Fehler.

        Args:
            error_message: Die Fehlermeldung
            context: Zusätzlicher Kontext (wann tritt der Fehler auf?)
            affected_files: Vermutlich betroffene Files
            stack_trace: Stack Trace falls vorhanden
            on_message: Callback

        Returns:
            DebugResult mit Root Cause und Fix-Instructions
        """
        files_section = ""
        if affected_files:
            files_section = f"""
## Potentially Affected Files
{chr(10).join([f'- {f}' for f in affected_files])}
"""

        stack_section = ""
        if stack_trace:
            stack_section = f"""
## Stack Trace
```
{stack_trace}
```
"""

        prompt = f"""
Debug this error:

## Error Message
{error_message}

## Context
{context if context else "No additional context provided."}
{files_section}
{stack_section}

## Instructions
1. Analyze the error message
2. If files are provided, read them to understand the code
3. Search for related patterns using Grep
4. Identify the root cause
5. Provide specific fix instructions

Output in the required format with FIX_REQUIRED flag.
"""

        response_content = []
        findings = []
        investigation_steps = []
        found_files = []

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
            if "ROOT_CAUSE_FOUND" in full_response.upper():
                status = DebugStatus.ROOT_CAUSE_FOUND
            elif "NEEDS_MORE_INFO" in full_response.upper():
                status = DebugStatus.NEEDS_MORE_INFO
            else:
                status = DebugStatus.INCONCLUSIVE

            # Parse fix_required
            fix_required = "FIX_REQUIRED: TRUE" in full_response.upper()

            # Parse root cause
            root_cause = self._parse_single_section(full_response, "ROOT_CAUSE")

            # Parse investigation steps
            investigation_steps = self._parse_section(full_response, "INVESTIGATION_STEPS")

            # Parse affected files
            found_files = self._parse_section(full_response, "AFFECTED_FILES")

            # Parse findings
            if fix_required:
                findings = self._parse_findings(full_response)

            return DebugResult(
                status=status,
                fix_required=fix_required,
                root_cause=root_cause,
                affected_files=found_files,
                stack_trace=stack_trace,
                findings=findings,
                investigation_steps=investigation_steps,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return DebugResult(
                success=False,
                error=str(e)
            )

    def _parse_single_section(self, response: str, section_name: str) -> str:
        """Parst eine einzelne Section als Text."""
        content = []
        in_section = False

        for line in response.split('\n'):
            line_stripped = line.strip()
            if section_name.upper() in line_stripped.upper() and '#' in line_stripped:
                in_section = True
                continue
            if in_section and line_stripped.startswith('#'):
                in_section = False
            if in_section and line_stripped:
                content.append(line_stripped)

        return " ".join(content)

    def _parse_section(self, response: str, section_name: str) -> list[str]:
        """Parst eine Section als Liste."""
        items = []
        in_section = False

        for line in response.split('\n'):
            line_stripped = line.strip()
            if section_name.upper() in line_stripped.upper():
                in_section = True
                continue
            if in_section and line_stripped.startswith('#'):
                in_section = False
            if in_section and (line_stripped.startswith('- ') or line_stripped.startswith('1.')):
                # Remove list marker
                if line_stripped.startswith('- '):
                    items.append(line_stripped[2:])
                else:
                    # Numbered list
                    parts = line_stripped.split('.', 1)
                    if len(parts) > 1:
                        items.append(parts[1].strip())

        return items

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
            elif line_stripped.startswith('- fix_code:') or line_stripped.startswith('fix_code:'):
                current_finding['fix_code'] = line_stripped.split(':', 1)[1].strip()
            elif line_stripped.startswith('- fix_agent:') or line_stripped.startswith('fix_agent:'):
                current_finding['fix_agent'] = line_stripped.split(':', 1)[1].strip()

        if current_finding:
            findings.append(self._create_finding(current_finding, finding_count))

        return findings

    def _create_finding(self, data: dict, index: int) -> Finding:
        """Erstellt ein Finding."""
        return Finding(
            id=data.get('id', f'debug-{index:03d}'),
            severity=data.get('severity', 'critical'),
            location=data.get('location', 'unknown'),
            problem=data.get('problem', 'Unknown error'),
            fix_instruction=data.get('fix_instruction', 'Investigate and fix'),
            fix_code=data.get('fix_code', ''),
            fix_agent=data.get('fix_agent', 'builder')
        )

    async def analyze_failure(
        self,
        phase: str,
        agent_result: dict,
        on_message: callable = None
    ) -> DebugResult:
        """
        Analysiert einen Agent-Failure.

        Args:
            phase: In welcher Phase der Fehler auftrat (planning, building, etc.)
            agent_result: Das Result vom fehlgeschlagenen Agent
            on_message: Callback

        Returns:
            DebugResult mit Analyse
        """
        prompt = f"""
Analyze this agent failure:

## Phase
{phase}

## Agent Result
{agent_result}

## Instructions
1. Understand what the agent was trying to do
2. Identify why it failed
3. Determine what needs to be fixed
4. Provide actionable next steps

Output in the required format.
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

            if "ROOT_CAUSE_FOUND" in full_response.upper():
                status = DebugStatus.ROOT_CAUSE_FOUND
            elif "NEEDS_MORE_INFO" in full_response.upper():
                status = DebugStatus.NEEDS_MORE_INFO
            else:
                status = DebugStatus.INCONCLUSIVE

            fix_required = "FIX_REQUIRED: TRUE" in full_response.upper()
            root_cause = self._parse_single_section(full_response, "ROOT_CAUSE")
            findings = self._parse_findings(full_response) if fix_required else []

            return DebugResult(
                status=status,
                fix_required=fix_required,
                root_cause=root_cause,
                findings=findings,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return DebugResult(
                success=False,
                error=str(e)
            )
