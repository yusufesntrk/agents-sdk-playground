"""
Custom Tools für den Echo Agent.

Zeigt wie man eigene Tools mit dem @tool Decorator erstellt.
"""

from typing import Any
from claude_code_sdk import tool


@tool(
    name="echo",
    description="Echo text back with optional transformations. Can reverse, uppercase, and repeat text. Parameters: text (required), reverse (bool), uppercase (bool), repeat (int 1-10).",
    input_schema={"text": str, "reverse": bool, "uppercase": bool, "repeat": int}
)
async def echo_tool(args: dict[str, Any]) -> dict[str, Any]:
    """
    Echo Tool - Transformiert und gibt Text zurück.

    Args:
        args: Dict mit text, reverse, uppercase, repeat

    Returns:
        Tool Response mit transformiertem Text
    """
    text = args.get("text", "")
    reverse = args.get("reverse", False)
    uppercase = args.get("uppercase", False)
    repeat = args.get("repeat", 1)

    # Transformationen anwenden
    result = text

    if reverse:
        result = result[::-1]

    if uppercase:
        result = result.upper()

    if repeat > 1:
        result = (result + " ") * repeat
        result = result.strip()

    # Transformations-Log erstellen
    transforms = []
    if reverse:
        transforms.append("reversed")
    if uppercase:
        transforms.append("uppercased")
    if repeat > 1:
        transforms.append(f"repeated {repeat}x")

    transform_info = ", ".join(transforms) if transforms else "none"

    return {
        "content": [{
            "type": "text",
            "text": f"Echo Result (transforms: {transform_info}):\n{result}"
        }]
    }
