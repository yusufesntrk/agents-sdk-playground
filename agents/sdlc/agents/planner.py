"""
Planner Agent - Erstellt Specs aus Task-Beschreibungen.

Analysiert die Codebase und erstellt einen Implementation Plan.
"""

import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from typing import AsyncGenerator, Any

from claude_code_sdk import query, ClaudeCodeOptions


@dataclass
class PlannerResult:
    """Ergebnis des Planner Agents."""
    spec: str
    files_to_modify: list[str] = field(default_factory=list)
    files_to_create: list[str] = field(default_factory=list)
    success: bool = True
    error: str | None = None


class PlannerAgent:
    """
    Planner Agent - Erstellt Implementation Specs.

    Der Planner analysiert Tasks und die Codebase,
    um einen detaillierten Plan zu erstellen.
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Lädt den System Prompt."""
        prompt_path = Path(__file__).parent.parent / "prompts" / "planner.md"
        return prompt_path.read_text()

    def _get_options(self) -> ClaudeCodeOptions:
        """Erstellt die Agent Options."""
        return ClaudeCodeOptions(
            system_prompt=self.system_prompt,
            allowed_tools=["Read", "Glob", "Grep"],
            cwd=self.working_dir,
        )

    async def plan(
        self,
        task_description: str,
        on_message: callable = None
    ) -> PlannerResult:
        """
        Erstellt einen Implementation Plan für die Task.

        Args:
            task_description: Beschreibung der Task
            on_message: Callback für Streaming Messages

        Returns:
            PlannerResult mit Spec und File Lists
        """
        prompt = f"""
Analyze this task and create an implementation specification:

## Task
{task_description}

## Instructions
1. First, explore the codebase to understand the current structure
2. Identify which files need to be modified or created
3. Create a detailed implementation plan

Output your spec in markdown format with these sections:
- Summary
- Files to Modify (list paths)
- Files to Create (list paths)
- Implementation Steps
- Testing Considerations
"""

        spec_content = []
        files_to_modify = []
        files_to_create = []

        try:
            async for message in query(prompt=prompt, options=self._get_options()):
                # Callback für UI Updates
                if on_message:
                    on_message(message)

                # Text sammeln
                if hasattr(message, 'content'):
                    for block in message.content:
                        if hasattr(block, 'text'):
                            spec_content.append(block.text)

            full_spec = "".join(spec_content)

            # Files extrahieren (simple parsing)
            for line in full_spec.split('\n'):
                line = line.strip()
                if line.startswith('- ') and '/' in line:
                    path = line[2:].strip().split()[0]
                    if 'modify' in full_spec.lower()[:full_spec.find(path)].split('\n')[-5:]:
                        files_to_modify.append(path)
                    elif 'create' in full_spec.lower()[:full_spec.find(path)].split('\n')[-5:]:
                        files_to_create.append(path)

            return PlannerResult(
                spec=full_spec,
                files_to_modify=files_to_modify,
                files_to_create=files_to_create,
                success=True
            )

        except Exception as e:
            return PlannerResult(
                spec="",
                success=False,
                error=str(e)
            )

    async def stream_plan(
        self,
        task_description: str
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Streamt den Planning-Prozess.

        Yields dicts mit type und data für jeden Event.
        """
        prompt = f"""
Analyze this task and create an implementation specification:

## Task
{task_description}

## Instructions
1. First, explore the codebase to understand the current structure
2. Identify which files need to be modified or created
3. Create a detailed implementation plan
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
                    "content": str(message.content)[:500]
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
