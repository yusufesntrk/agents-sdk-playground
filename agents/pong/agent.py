"""
Pong Agent - Demonstriert die Macht des System Prompts.

Egal was du fragst, die Antwort ist immer "pong".
Zeigt wie ein Custom System Prompt das Agent-Verhalten komplett überschreibt.

Usage:
    uv run python -m agents.pong.agent
    uv run python -m agents.pong.agent "Deine Frage hier"
"""

import asyncio
import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from claude_code_sdk import query, ClaudeCodeOptions

console = Console()


def load_system_prompt() -> str:
    """Lädt den System Prompt aus der Markdown-Datei."""
    prompt_path = Path(__file__).parent / "prompts" / "system.md"
    return prompt_path.read_text()


async def run_pong_agent(user_prompt: str) -> None:
    """Führt den Pong Agent mit dem gegebenen Prompt aus."""

    console.print(Panel(
        "[bold cyan]PONG AGENT[/bold cyan]\n"
        "[dim]Demonstriert System Prompt Override[/dim]",
        border_style="cyan"
    ))

    # User Prompt anzeigen
    console.print(f"\n[bold yellow]User Prompt:[/bold yellow] {user_prompt}\n")

    # Agent Options mit Custom System Prompt
    options = ClaudeCodeOptions(
        system_prompt=load_system_prompt(),
        allowed_tools=[],  # Keine Tools erlaubt
    )

    # Session Stats
    total_tokens = 0
    response_text = ""

    console.print("[bold green]Agent Response:[/bold green]")

    # Agent ausführen
    async for message in query(
        prompt=user_prompt,
        options=options
    ):
        # Text-Blöcke verarbeiten
        if hasattr(message, 'content'):
            for block in message.content:
                if hasattr(block, 'text'):
                    response_text += block.text
                    console.print(f"  {block.text}")

        # Result Message für Stats
        if hasattr(message, 'total_cost_usd'):
            # Stats Tabelle
            stats_table = Table(title="Session Stats", border_style="dim")
            stats_table.add_column("Metric", style="cyan")
            stats_table.add_column("Value", style="green")

            if hasattr(message, 'duration_ms'):
                stats_table.add_row("Duration", f"{message.duration_ms}ms")
            if hasattr(message, 'num_turns'):
                stats_table.add_row("Turns", str(message.num_turns))
            if hasattr(message, 'total_cost_usd'):
                stats_table.add_row("Cost", f"${message.total_cost_usd:.6f}")

            console.print()
            console.print(stats_table)


def main():
    """Entry Point für den Pong Agent."""
    # User Prompt aus Args oder Default
    if len(sys.argv) > 1:
        user_prompt = " ".join(sys.argv[1:])
    else:
        user_prompt = "Hello, how are you?"

    asyncio.run(run_pong_agent(user_prompt))


if __name__ == "__main__":
    main()
