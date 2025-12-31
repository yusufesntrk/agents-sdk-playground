"""
Tester Agent - E2E Tests generieren und ausführen.

Erstellt Playwright E2E Tests und führt sie aus.
Gibt strukturierte Findings bei Test-Failures zurück.
"""

import asyncio
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any
from enum import Enum

from claude_code_sdk import query, ClaudeCodeOptions

from .reviewer import Finding


class TestStatus(Enum):
    """Test Execution Status."""
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"


@dataclass
class TestCase:
    """Ein einzelner Test Case."""
    name: str
    status: TestStatus
    duration_ms: int = 0
    error_message: str = ""
    file_path: str = ""


@dataclass
class TesterResult:
    """Ergebnis des Tester Agents."""
    fix_required: bool = False
    tests_run: int = 0
    tests_passed: int = 0
    tests_failed: int = 0
    tests_skipped: int = 0
    test_cases: list[TestCase] = field(default_factory=list)
    findings: list[Finding] = field(default_factory=list)
    test_files_created: list[str] = field(default_factory=list)
    summary: str = ""
    success: bool = True
    error: str | None = None

    def to_dict(self) -> dict:
        """Konvertiert zu Dict für JSON."""
        return {
            "fix_required": self.fix_required,
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "tests_failed": self.tests_failed,
            "tests_skipped": self.tests_skipped,
            "test_cases": [
                {
                    "name": tc.name,
                    "status": tc.status.value,
                    "duration_ms": tc.duration_ms,
                    "error_message": tc.error_message,
                    "file_path": tc.file_path
                }
                for tc in self.test_cases
            ],
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
            "test_files_created": self.test_files_created,
            "summary": self.summary,
            "success": self.success,
            "error": self.error
        }


class TesterAgent:
    """
    Tester Agent - Erstellt und führt E2E Tests aus.

    Der Tester:
    1. Erstellt Playwright E2E Tests basierend auf dem Feature
    2. Führt die Tests aus
    3. Gibt strukturierte Findings bei Failures zurück
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt aus der .md Datei."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "tester.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Write", "Edit", "Bash", "Grep", "Glob", "mcp__playwright__*"],
            cwd=self.working_dir,
        )

    async def create_and_run_tests(
        self,
        feature_name: str,
        spec: str,
        files_created: list[str],
        on_message: callable = None
    ) -> TesterResult:
        """
        Erstellt und führt E2E Tests aus.

        Args:
            feature_name: Name des Features
            spec: Original Specification
            files_created: Vom Builder erstellte Files
            on_message: Callback

        Returns:
            TesterResult mit Test-Ergebnissen und ggf. Findings
        """
        files_list = "\n".join([f"- {f}" for f in files_created])

        prompt = f"""
Create and run E2E tests for this feature:

## Feature: {feature_name}

## Specification
{spec}

## Files Implemented
{files_list}

## Instructions
1. Read the implementation to understand what to test
2. Create a Playwright test file in tests/{feature_name.lower().replace(' ', '_')}.spec.ts
3. Write tests for:
   - Happy path
   - Edge cases
   - Error states
4. Run the tests with: npx playwright test tests/{feature_name.lower().replace(' ', '_')}.spec.ts --reporter=list
5. Analyze results and create Findings for failures

Output in the required format with FIX_REQUIRED flag if tests fail.
"""

        response_content = []
        test_files_created = []
        findings = []

        try:
            async for message in query(prompt=prompt, options=self._get_options()):
                if on_message:
                    on_message(message)

                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'name'):
                            # Track test file creation
                            if block.name == 'Write':
                                file_path = block.input.get('file_path', '')
                                if file_path and 'test' in file_path.lower():
                                    test_files_created.append(file_path)
                        elif hasattr(block, 'text'):
                            response_content.append(block.text)

            full_response = "".join(response_content)

            # Parse results
            fix_required = "FIX_REQUIRED: TRUE" in full_response.upper()
            tests_run, tests_passed, tests_failed = self._parse_test_counts(full_response)

            # Parse findings if tests failed
            if fix_required:
                findings = self._parse_findings(full_response)

            return TesterResult(
                fix_required=fix_required,
                tests_run=tests_run,
                tests_passed=tests_passed,
                tests_failed=tests_failed,
                findings=findings,
                test_files_created=test_files_created,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return TesterResult(
                success=False,
                error=str(e)
            )

    def _parse_test_counts(self, response: str) -> tuple[int, int, int]:
        """Parst Test-Counts aus der Response."""
        tests_run = 0
        tests_passed = 0
        tests_failed = 0

        # Try to find test result patterns
        total_match = re.search(r'Total:\s*(\d+)', response, re.IGNORECASE)
        passed_match = re.search(r'Passed:\s*(\d+)', response, re.IGNORECASE)
        failed_match = re.search(r'Failed:\s*(\d+)', response, re.IGNORECASE)

        if total_match:
            tests_run = int(total_match.group(1))
        if passed_match:
            tests_passed = int(passed_match.group(1))
        if failed_match:
            tests_failed = int(failed_match.group(1))

        # If no total but passed/failed, calculate
        if tests_run == 0 and (tests_passed > 0 or tests_failed > 0):
            tests_run = tests_passed + tests_failed

        return tests_run, tests_passed, tests_failed

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
        """Erstellt ein Finding."""
        return Finding(
            id=data.get('id', f'test-fail-{index:03d}'),
            severity=data.get('severity', 'critical'),
            location=data.get('location', 'unknown'),
            problem=data.get('problem', 'Test failed'),
            fix_instruction=data.get('fix_instruction', 'Fix the failing test'),
            fix_code=data.get('fix_code', ''),
            fix_agent=data.get('fix_agent', 'builder')
        )

    async def run_tests(
        self,
        test_files: list[str],
        on_message: callable = None
    ) -> TesterResult:
        """
        Führt nur existierende Tests aus (ohne neue zu erstellen).

        Args:
            test_files: Liste der Test-Files
            on_message: Callback

        Returns:
            TesterResult
        """
        files_list = " ".join(test_files)

        prompt = f"""
Run the following tests and analyze the results:

## Test Files
{files_list}

## Instructions
1. Run: npx playwright test {files_list} --reporter=list
2. Analyze the output
3. For any failures, create Findings with fix instructions

Output in the required format with FIX_REQUIRED flag.
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
            tests_run, tests_passed, tests_failed = self._parse_test_counts(full_response)

            findings = []
            if fix_required:
                findings = self._parse_findings(full_response)

            return TesterResult(
                fix_required=fix_required,
                tests_run=tests_run,
                tests_passed=tests_passed,
                tests_failed=tests_failed,
                findings=findings,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return TesterResult(
                success=False,
                error=str(e)
            )

    async def validate_fix(
        self,
        previous_findings: list[Finding],
        test_files: list[str],
        fix_loop_count: int,
        on_message: callable = None
    ) -> TesterResult:
        """
        Re-runs Tests nach einem Fix.

        Args:
            previous_findings: Die Test-Failures die gefixt werden sollten
            test_files: Die Test-Files
            fix_loop_count: Aktueller Loop Count
            on_message: Callback

        Returns:
            TesterResult mit aktuellem Status
        """
        findings_summary = "\n".join([
            f"- {f.id}: {f.problem}"
            for f in previous_findings
        ])

        files_list = " ".join(test_files)

        prompt = f"""
Re-run tests after fix attempt #{fix_loop_count}.

## Previous Test Failures (should be fixed now)
{findings_summary}

## Test Files
{files_list}

## Instructions
1. Run: npx playwright test {files_list} --reporter=list
2. Check if previous failures are now passing
3. Report any new failures

### FIX_REQUIRED: true or false

### VALIDATION_RESULT
For each previous failure:
- test-fail-001: FIXED | STILL_FAILING

### NEW_FAILURES (if any)
Use the standard Finding format.

### TEST_RESULTS
- Total: X
- Passed: X
- Failed: X
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
            tests_run, tests_passed, tests_failed = self._parse_test_counts(full_response)

            findings = []
            if fix_required:
                findings = self._parse_findings(full_response)

            return TesterResult(
                fix_required=fix_required,
                tests_run=tests_run,
                tests_passed=tests_passed,
                tests_failed=tests_failed,
                findings=findings,
                summary=full_response,
                success=True
            )

        except Exception as e:
            return TesterResult(
                success=False,
                error=str(e)
            )
