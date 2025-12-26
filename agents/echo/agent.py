"""
Echo Agent - Demonstriert Custom System Prompt und Tool-Beschränkung.

Nutzt das Haiku Model für schnellere/günstigere Responses.

Usage:
    uv run python -m agents.echo.agent
    uv run python -m agents.echo.agent "Custom text to echo"
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


async def run_echo_agent(user_prompt: str) -> None:
    """Führt den Echo Agent aus."""

    console.print(Panel(
        "[bold magenta]ECHO AGENT[/bold magenta]\n"
        "[dim]Custom System Prompt + Haiku Model[/dim]",
        border_style="magenta"
    ))

    console.print(f"\n[bold yellow]User Prompt:[/bold yellow] {user_prompt}\n")
    console.print("[bold green]Agent Processing:[/bold green]")

    # Agent Options mit Custom System Prompt
    options = ClaudeCodeOptions(
        system_prompt=load_system_prompt(),
        allowed_tools=[],  # Keine Standard-Tools
        model="claude-haiku-4-5-20251001",  # Schnelleres Model
    )

    response_text = []

    # Agent ausführen
    async for message in query(prompt=user_prompt, options=options):
        # Text-Blöcke verarbeiten
        if hasattr(message, 'content'):
            for block in message.content:
                if hasattr(block, 'text'):
                    response_text.append(block.text)
                    console.print(f"  {block.text}")

        # Stats am Ende
        if hasattr(message, 'total_cost_usd'):
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


def echo_transform(text: str, reverse: bool = False, uppercase: bool = False, repeat: int = 1) -> str:
    """Transformiert Text wie das Echo Tool es tun würde."""
    result = text
    if reverse:
        result = result[::-1]
    if uppercase:
        result = result.upper()
    if repeat > 1:
        result = (result + " ") * repeat
        result = result.strip()
    return result


def main():
    """Entry Point für den Echo Agent."""
    # User Prompt aus Args oder Default
    if len(sys.argv) > 1:
        user_prompt = " ".join(sys.argv[1:])
    else:
        user_prompt = 'Echo this text in reverse and uppercase: "Hello World"'

    asyncio.run(run_echo_agent(user_prompt))


if __name__ == "__main__":
    main()
