"""
Reviewer Agent - Prüft Code-Qualität.

Reviewed die Änderungen vom Builder und gibt Feedback.
"""

import asyncio
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
class ReviewResult:
    """Ergebnis des Reviewer Agents."""
    status: ReviewStatus = ReviewStatus.PENDING
    summary: str = ""
    issues: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    success: bool = True
    error: str | None = None


class ReviewerAgent:
    """
    Reviewer Agent - Prüft Code-Qualität.

    Der Reviewer analysiert die Änderungen vom Builder
    und gibt ein Review mit Status und Feedback.
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "reviewer.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Grep", "Bash"],
            cwd=self.working_dir,
        )

    async def review(
        self,
        spec: str,
        files_modified: list[str],
        files_created: list[str],
        on_message: callable = None
    ) -> ReviewResult:
        """
        Reviewed die Änderungen.

        Args:
            spec: Original Specification
            files_modified: Liste der geänderten Files
            files_created: Liste der neuen Files
            on_message: Callback für Streaming Messages

        Returns:
            ReviewResult mit Status und Feedback
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

## Instructions
1. Read each modified/created file
2. Verify the implementation matches the spec
3. Check for bugs, issues, and code quality
4. Run tests if available (use read-only bash commands)

## Output Format
Respond with:
- STATUS: APPROVED or NEEDS_CHANGES
- SUMMARY: Brief overall assessment
- ISSUES: List any problems found
- SUGGESTIONS: Optional improvements
"""

        response_content = []
        issues = []
        suggestions = []
        status = ReviewStatus.PENDING

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
            if "STATUS: APPROVED" in full_response.upper():
                status = ReviewStatus.APPROVED
            elif "NEEDS_CHANGES" in full_response.upper():
                status = ReviewStatus.NEEDS_CHANGES

            # Issues parsen (simple)
            in_issues = False
            in_suggestions = False
            for line in full_response.split('\n'):
                line = line.strip()
                if 'ISSUES' in line.upper():
                    in_issues = True
                    in_suggestions = False
                elif 'SUGGESTIONS' in line.upper():
                    in_issues = False
                    in_suggestions = True
                elif line.startswith('- '):
                    if in_issues:
                        issues.append(line[2:])
                    elif in_suggestions:
                        suggestions.append(line[2:])

            return ReviewResult(
                status=status,
                summary=full_response,
                issues=issues,
                suggestions=suggestions,
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

Review the code and provide STATUS: APPROVED or NEEDS_CHANGES.
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
