"""
Builder Agent - Implementiert Code basierend auf Specs.

Liest die Spec vom Planner und führt die Änderungen durch.
"""

import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any

from claude_code_sdk import query, ClaudeCodeOptions


@dataclass
class BuilderResult:
    """Ergebnis des Builder Agents."""
    files_modified: list[str] = field(default_factory=list)
    files_created: list[str] = field(default_factory=list)
    summary: str = ""
    success: bool = True
    error: str | None = None


class BuilderAgent:
    """
    Builder Agent - Implementiert Code.

    Der Builder liest Specs und setzt sie um,
    indem er Files erstellt und modifiziert.
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "builder.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Write", "Edit", "Bash"],
            cwd=self.working_dir,
        )

    async def build(
        self,
        spec: str,
        on_message: callable = None
    ) -> BuilderResult:
        """
        Implementiert die Spec.

        Args:
            spec: Implementation Specification vom Planner
            on_message: Callback für Streaming Messages

        Returns:
            BuilderResult mit Liste der geänderten Files
        """
        prompt = f"""
Implement the following specification:

{spec}

## Instructions
1. Read through the spec carefully
2. Implement each step in order
3. Test your changes if possible
4. Report what you did

Be precise and follow the spec exactly.
"""

        response_content = []
        files_modified = []
        files_created = []

        try:
            async for message in query(prompt=prompt, options=self._get_options()):
                # Callback für UI Updates
                if on_message:
                    on_message(message)

                # Tool Calls tracken
                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'name'):
                            tool_name = block.name
                            if tool_name in ['Write', 'Edit']:
                                file_path = block.input.get('file_path', '')
                                if file_path:
                                    if tool_name == 'Write':
                                        files_created.append(file_path)
                                    else:
                                        files_modified.append(file_path)
                        elif hasattr(block, 'text'):
                            response_content.append(block.text)

            return BuilderResult(
                files_modified=list(set(files_modified)),
                files_created=list(set(files_created)),
                summary="".join(response_content),
                success=True
            )

        except Exception as e:
            return BuilderResult(
                success=False,
                error=str(e)
            )

    async def stream_build(
        self,
        spec: str
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Streamt den Build-Prozess.

        Yields dicts mit type und data für jeden Event.
        """
        prompt = f"""
Implement the following specification:

{spec}

Be precise and follow the spec exactly. Report what you did.
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
                    "tool_id": message.tool_use_id,
                    "success": not getattr(message, 'is_error', False)
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
