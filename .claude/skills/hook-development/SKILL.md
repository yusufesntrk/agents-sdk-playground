---
name: hook-development
description: This skill should be used when the user asks to "create a hook", "add a hook", "implement hooks", "validate tool use", "enforce policies", "add a PreToolUse hook", "add a PostToolUse hook", or mentions hook events (PreToolUse, PostToolUse, Stop, SessionStart) or needs guidance on hook architecture, prompt-based vs command-based hooks, or hook best practices for Claude Code plugins.
version: 0.1.0
---

# Hook Development

Hooks are event-driven automation scripts that execute in response to Claude Code events. This skill covers implementing hooks for validation, enforcement, context loading, and workflow automation.

## Hook Fundamentals

Hooks enable:
- **Validation**: Approve/deny tool calls before execution
- **Feedback**: React to tool results after execution
- **Enforcement**: Validate task completion before stopping
- **Context**: Load project context at session start
- **Automation**: Execute workflows across development lifecycle

Hooks run in response to events and can modify behavior, block operations, or provide feedback.

## Hook Types

### Prompt-Based Hooks (Recommended)

Use LLM-driven decision making for context-aware validation:

```json
{
  "type": "prompt",
  "prompt": "Evaluate if this tool use is appropriate: $TOOL_INPUT",
  "timeout": 30
}
```

**Supported events**: Stop, SubagentStop, UserPromptSubmit, PreToolUse

**Benefits:**
- Context-aware decisions based on natural language reasoning
- Flexible evaluation logic without bash scripting
- Better edge case handling
- Easier to maintain and extend

### Command Hooks

Execute bash commands for deterministic checks:

```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 60
}
```

**Use for:**
- Fast deterministic validations
- File system operations
- External tool integrations
- Performance-critical checks

## Hook Events

### PreToolUse

Execute before any tool runs. Approve, deny, or modify tool calls.

**Use cases:**
- Validate file writes (security, path safety)
- Check bash commands (prevent destructive ops)
- Enforce coding standards before writes
- Validate API calls

**Example (prompt-based):**
```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Validate file write safety. Check: system paths, credentials, path traversal, sensitive content. Return 'approve' or 'deny'."
        }
      ]
    }
  ]
}
```

### PostToolUse

Execute after tool completes. React to results, provide feedback, or log.

**Use cases:**
- Analyze test results
- Check build output
- Validate edits for syntax errors
- Provide feedback on changes

**Example:**
```json
{
  "PostToolUse": [
    {
      "matcher": "Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Analyze edit result: syntax errors, security issues, breaking changes. Provide feedback."
        }
      ]
    }
  ]
}
```

### Stop

Execute when main agent considers stopping. Validate task completeness.

**Use cases:**
- Ensure tests passed
- Verify build succeeded
- Check all tasks completed
- Block stopping if work incomplete

**Example:**
```json
{
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Verify task completion: tests run, build succeeded, all questions answered. Return 'approve' to stop or 'block' to continue."
        }
      ]
    }
  ]
}
```

### SubagentStop

Execute when subagent considers stopping. Ensure subagent completed its task.

Similar to Stop hook, but for subagents.

### UserPromptSubmit

Execute when user submits a prompt. Add context, validate, or block prompts.

**Use cases:**
- Add security guidance for sensitive topics
- Provide context-specific help
- Validate user input format
- Block dangerous commands

### SessionStart

Execute when session begins. Load context and set environment.

**Use cases:**
- Load project configuration
- Set environment variables
- Initialize database connections
- Load project-specific knowledge

**Example:**
```json
{
  "SessionStart": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/load-context.sh"
        }
      ]
    }
  ]
}
```

### SessionEnd

Execute when session ends. Cleanup, logging, state preservation.

## Hook Configuration

### Plugin hooks.json Format

For plugin hooks in `hooks/hooks.json`, use wrapper format:

```json
{
  "description": "Brief explanation (optional)",
  "hooks": {
    "PreToolUse": [...],
    "Stop": [...],
    "SessionStart": [...]
  }
}
```

**Key points:**
- `description` field is optional
- `hooks` field wraps actual hook events
- This is **plugin-specific format**

### Settings Format (Direct)

For user settings in `.claude/settings.json`, use direct format:

```json
{
  "PreToolUse": [...],
  "Stop": [...],
  "SessionStart": [...]
}
```

**Key points:**
- No wrapper
- No description field
- **Settings format** (not plugin)

## Matchers

Tools that hooks apply to.

**Exact match:**
```json
"matcher": "Write"
```

**Multiple tools:**
```json
"matcher": "Read|Write|Edit"
```

**Wildcard (all tools):**
```json
"matcher": "*"
```

**Regex patterns:**
```json
"matcher": "mcp__.*__delete.*"  // All MCP delete tools
```

**Common patterns:**
```json
// All MCP tools
"matcher": "mcp__.*"

// All file operations
"matcher": "Read|Write|Edit"

// Bash commands only
"matcher": "Bash"
```

## Hook Output Format

### Standard Output

```json
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "Message for Claude"
}
```

- `continue`: If false, halt processing (default true)
- `suppressOutput`: Hide from transcript (default false)
- `systemMessage`: Message shown to Claude

### Exit Codes

- `0` - Success (stdout shown in transcript)
- `2` - Blocking error (stderr fed back to Claude)
- Other - Non-blocking error

## Hook Input Format

All hooks receive JSON via stdin with event-specific fields:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.txt",
  "cwd": "/current/working/dir",
  "permission_mode": "ask|allow",
  "hook_event_name": "PreToolUse"
}
```

**Event-specific fields:**
- **PreToolUse/PostToolUse**: `tool_name`, `tool_input`, `tool_result`
- **UserPromptSubmit**: `user_prompt`
- **Stop/SubagentStop**: `reason`

Access fields in prompts using `$TOOL_INPUT`, `$TOOL_RESULT`, `$USER_PROMPT`.

## Environment Variables

Available in all command hooks:

- `$CLAUDE_PROJECT_DIR` - Project root path
- `$CLAUDE_PLUGIN_ROOT` - Plugin directory (use for portable paths)
- `$CLAUDE_ENV_FILE` - SessionStart only: persist env vars
- `$CLAUDE_CODE_REMOTE` - Set if running in remote context

**Always use `${CLAUDE_PLUGIN_ROOT}` in hook commands for portability:**

```json
{
  "type": "command",
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
}
```

## Prompt-Based Hook Examples

### File Write Validation

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Validate file write safety:\n\nFile path: $TOOL_INPUT.file_path\n\nCheck for:\n- System directories (/, /etc, /usr)\n- Credential files (.env, .aws)\n- Path traversal (..)\n- Sensitive files\n\nReturn JSON: {\"decision\": \"approve|deny\", \"reason\": \"...\"}"
        }
      ]
    }
  ]
}
```

### Bash Command Validation

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Validate bash command safety:\n\nCommand: $TOOL_INPUT.command\n\nBlock dangerous operations:\n- rm -rf /\n- sudo\n- chmod 777\n- System modifications\n\nReturn: {\"decision\": \"approve|deny\", \"reason\": \"...\"}"
        }
      ]
    }
  ]
}
```

### Task Completion Validation

```json
{
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Verify task is complete:\n\nHas Claude:\n1. Run tests and confirmed they pass?\n2. Built the project successfully?\n3. Addressed all user questions?\n4. Provided summary of changes?\n\nReturn: {\"decision\": \"approve|block\", \"reason\": \"...\"}"
        }
      ]
    }
  ]
}
```

## Command-Based Hook Examples

### File Safety Validation Script

```bash
#!/bin/bash
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

# Deny path traversal
if [[ "$file_path" == *".."* ]]; then
  echo '{"decision": "deny", "reason": "Path traversal detected"}' >&2
  exit 2
fi

# Deny sensitive files
if [[ "$file_path" == *".env"* ]] || [[ "$file_path" == *".credentials"* ]]; then
  echo '{"decision": "deny", "reason": "Cannot modify sensitive files"}' >&2
  exit 2
fi

# Approve
echo '{"decision": "approve", "reason": "File path is safe"}'
exit 0
```

### SessionStart Context Loading

```bash
#!/bin/bash
# Load project context at session start

# Set project type
echo "export PROJECT_TYPE=nodejs" >> "$CLAUDE_ENV_FILE"

# Load configuration
if [ -f "$CLAUDE_PROJECT_DIR/.claude/config.json" ]; then
  echo "export PROJECT_CONFIG=$CLAUDE_PROJECT_DIR/.claude/config.json" >> "$CLAUDE_ENV_FILE"
fi

# Output context
echo "Project context loaded"
exit 0
```

## Security Best Practices

### Input Validation

Always validate inputs in command hooks:

```bash
#!/bin/bash
set -euo pipefail

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')

# Validate tool name format
if [[ ! "$tool_name" =~ ^[a-zA-Z0-9_]+$ ]]; then
  echo '{"decision": "deny", "reason": "Invalid tool name"}' >&2
  exit 2
fi
```

### Path Safety

Check for path traversal and sensitive files:

```bash
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

# Deny path traversal
if [[ "$file_path" == *".."* ]]; then
  echo '{"decision": "deny", "reason": "Path traversal detected"}' >&2
  exit 2
fi

# Deny sensitive patterns
if [[ "$file_path" =~ \.(env|credentials|key|secret)$ ]]; then
  echo '{"decision": "deny", "reason": "Sensitive file"}' >&2
  exit 2
fi
```

### Quote All Variables

```bash
# GOOD: Quoted
echo "$file_path"
cd "$CLAUDE_PROJECT_DIR"

# BAD: Unquoted (injection risk)
echo $file_path
cd $CLAUDE_PROJECT_DIR
```

### Set Appropriate Timeouts

```json
{
  "type": "command",
  "command": "bash script.sh",
  "timeout": 10
}
```

**Defaults**: Command hooks (60s), Prompt hooks (30s)

## Performance Optimization

### Parallel Execution

All matching hooks run in **parallel**:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write",
      "hooks": [
        {"type": "command", "command": "check1.sh"},
        {"type": "command", "command": "check2.sh"},
        {"type": "prompt", "prompt": "Validate..."}
      ]
    }
  ]
}
```

**Design implications:**
- Hooks don't see each other's output
- Non-deterministic ordering
- Design for independence

### Optimization Tips

1. Use command hooks for quick deterministic checks
2. Use prompt hooks for complex reasoning
3. Cache validation results in temp files
4. Minimize I/O in hot paths

## Lifecycle and Limitations

### Hooks Load at Session Start

**Important**: Hooks load when Claude Code session starts. Changes require restart.

**Cannot hot-swap hooks:**
- Editing `hooks.json` won't affect current session
- Adding scripts won't be recognized
- Changing commands won't update
- **Must restart Claude Code**

**To test changes:**
1. Edit hook configuration
2. Exit Claude Code (`exit` or Ctrl+C)
3. Restart: `claude` or `cc`
4. Test with new configuration

### Validation at Startup

Hooks validated when Claude Code starts:
- Invalid JSON causes loading failure
- Missing scripts cause warnings
- Syntax errors reported in debug mode

Use `/hooks` command to review loaded hooks.

## Best Practices

### DO

✅ Use prompt-based hooks for complex logic
✅ Use `${CLAUDE_PLUGIN_ROOT}` for portability
✅ Validate all inputs in command hooks
✅ Quote all bash variables
✅ Set appropriate timeouts
✅ Return structured JSON output
✅ Test hooks thoroughly

### DON'T

❌ Use hardcoded paths
❌ Trust user input without validation
❌ Create long-running hooks
❌ Rely on hook execution order
❌ Modify global state unpredictably
❌ Log sensitive information

## Troubleshooting

**Hooks not loading:**
- Check JSON syntax in hooks.json
- Verify paths in command hooks exist
- Check hook configuration is valid
- Restart Claude Code after changes

**Hooks not triggering:**
- Verify matcher pattern is correct
- Check event name is spelled correctly
- Ensure hook is in correct event section
- Use `claude --debug` to see hook execution

**Performance issues:**
- Reduce hook timeout values
- Switch from command to prompt hooks (usually faster)
- Cache validation results
- Minimize I/O operations

## Validation Checklist

- [ ] Hook JSON syntax is valid
- [ ] Matcher pattern is correct
- [ ] Event name is correct (PreToolUse, Stop, etc.)
- [ ] Timeout values are reasonable
- [ ] Command paths use `${CLAUDE_PLUGIN_ROOT}`
- [ ] Scripts have proper exit codes
- [ ] Input validation present in command hooks
- [ ] Output JSON format is correct
- [ ] Hooks tested after changes
- [ ] Documentation updated

## ShortSelect Project Hooks

For project hooks:
- Follow security best practices
- Respect Supabase/RLS security model
- Validate database operations
- Protect sensitive credentials
- Document hook behavior clearly
