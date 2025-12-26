---
name: plugin-settings
description: This skill should be used when the user asks to "store plugin settings", "add plugin configuration", "save plugin state", "create settings file", "read settings from file", "configure plugin for project", or needs guidance on plugin settings patterns, per-project configuration, YAML frontmatter parsing, or settings best practices for Claude Code plugins.
version: 0.1.0
---

# Plugin Settings

Plugins can store user-configurable settings and state in `.claude/plugin-name.local.md` files. This skill covers implementing per-project configuration and state management patterns.

## Plugin Settings Fundamentals

Settings files provide:
- **Per-project configuration**: Different settings per project
- **User-managed state**: Users control plugin behavior per project
- **Not in git**: Local configuration, not version-controlled
- **Structured format**: YAML frontmatter + markdown body

**Key characteristics:**
- File location: `.claude/plugin-name.local.md` in project root
- Structure: YAML frontmatter + markdown body
- Purpose: Per-project plugin configuration and state
- Usage: Read from hooks, commands, and agents
- Lifecycle: User-managed (not in git)

## File Structure

### Basic Template

```yaml
---
enabled: true
setting1: value1
setting2: value2
numeric_setting: 42
list_setting: ["item1", "item2"]
---

# Additional Context

This markdown body can contain:
- Task descriptions
- Additional instructions
- Prompts to feed back to Claude
- Documentation or notes
```

### Example: Plugin Configuration

**.claude/my-plugin.local.md:**

```yaml
---
enabled: true
strict_mode: false
max_retries: 3
notification_level: info
coordinator_session: team-leader
---

# Plugin Configuration

This plugin is configured for standard validation mode.
Contact @team-lead with questions.
```

## Reading Settings from Bash Scripts

### Extract Frontmatter

```bash
#!/bin/bash
set -euo pipefail

# Define state file path
STATE_FILE=".claude/my-plugin.local.md"

# Quick exit if file doesn't exist
if [[ ! -f "$STATE_FILE" ]]; then
  exit 0 # Plugin not configured, skip
fi

# Extract everything between --- markers
FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")

# Extract individual fields
ENABLED=$(echo "$FRONTMATTER" | grep '^enabled:' | sed 's/enabled: *//' | sed 's/^"\(.*\)"$/\1/')
STRICT_MODE=$(echo "$FRONTMATTER" | grep '^strict_mode:' | sed 's/strict_mode: *//')
```

### Read Individual Field Types

**String fields:**

```bash
VALUE=$(echo "$FRONTMATTER" | grep '^field_name:' | sed 's/field_name: *//' | sed 's/^"\(.*\)"$/\1/')
```

**Boolean fields:**

```bash
ENABLED=$(echo "$FRONTMATTER" | grep '^enabled:' | sed 's/enabled: *//')
if [[ "$ENABLED" == "true" ]]; then
  # Boolean is true
fi
```

**Numeric fields:**

```bash
MAX=$(echo "$FRONTMATTER" | grep '^max_value:' | sed 's/max_value: *//')
if [[ $MAX -gt 100 ]]; then
  # Numeric comparison
fi
```

### Extract Markdown Body

Extract content after second `---`:

```bash
# Get everything after closing ---
BODY=$(awk '/^---$/{i++; next} i>=2' "$FILE")
```

## Reading Settings from Commands and Agents

### From Commands

Commands can read settings to customize behavior:

```markdown
---
description: Process data with plugin settings
allowed-tools: ["Read", "Bash"]
---

Steps:
1. Check if settings exist at `.claude/my-plugin.local.md`
2. Read configuration using Read tool
3. Parse YAML frontmatter to extract settings
4. Apply settings to processing logic
5. Execute with configured behavior
```

### From Agents

Agents can reference settings in their instructions:

```markdown
---
name: configured-agent
description: Agent that adapts to project settings
---

Check for plugin settings at `.claude/my-plugin.local.md`.
If present, parse YAML frontmatter and adapt behavior according to:
- enabled: Whether plugin is active
- mode: Processing mode (strict, standard, lenient)
- Additional configuration fields

Use settings to customize your analysis and output.
```

## Common Usage Patterns

### Pattern 1: Temporarily Active Hooks

Use settings file to control hook activation without editing hooks.json:

```bash
#!/bin/bash
STATE_FILE=".claude/security-scan.local.md"

# Quick exit if not configured
if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

# Read enabled flag
FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")
ENABLED=$(echo "$FRONTMATTER" | grep '^enabled:' | sed 's/enabled: *//')

if [[ "$ENABLED" != "true" ]]; then
  exit 0 # Disabled, skip hook
fi

# Run hook logic
# ...
```

**Use case**: Enable/disable hooks without editing hooks.json (requires restart).

### Pattern 2: Agent State Management

Store agent-specific state and configuration:

**.claude/multi-agent-swarm.local.md:**

```yaml
---
agent_name: auth-agent
task_number: 3.5
pr_number: 1234
coordinator_session: team-leader
enabled: true
dependencies: ["Task 3.4"]
---

# Task Assignment

Implement JWT authentication for the API.

**Success Criteria:**
- Authentication endpoints created
- Tests passing
- PR created and CI green
```

Read from hooks to coordinate agents:

```bash
AGENT_NAME=$(echo "$FRONTMATTER" | grep '^agent_name:' | sed 's/agent_name: *//')
COORDINATOR=$(echo "$FRONTMATTER" | grep '^coordinator_session:' | sed 's/coordinator_session: *//')

# Send notification to coordinator
tmux send-keys -t "$COORDINATOR" "Agent $AGENT_NAME completed" Enter
```

### Pattern 3: Configuration-Driven Behavior

**.claude/my-plugin.local.md:**

```yaml
---
validation_level: strict
max_file_size: 1000000
allowed_extensions: [".js", ".ts", ".tsx"]
enable_logging: true
---

# Validation Configuration

Strict mode enabled for this project.
All writes validated against security policies.
```

Use in hooks or commands:

```bash
LEVEL=$(echo "$FRONTMATTER" | grep '^validation_level:' | sed 's/validation_level: *//')

case "$LEVEL" in
  strict)
    # Apply strict validation
    ;;
  standard)
    # Apply standard validation
    ;;
  lenient)
    # Apply lenient validation
    ;;
esac
```

## Creating Settings Files

### From Commands

Commands can create settings files interactively:

```markdown
# Setup Command

Steps:
1. Ask user for configuration preferences
2. Create `.claude/my-plugin.local.md` with YAML frontmatter
3. Set appropriate values based on user input
4. Inform user that settings are saved
5. Remind user to restart Claude Code for hooks to recognize changes
```

### Template Generation

Provide template in plugin README:

```markdown
## Configuration

Create `.claude/my-plugin.local.md` in your project:

\`\`\`yaml
---
enabled: true
mode: standard
max_retries: 3
---

# Plugin Configuration

Your settings are active.
\`\`\`

After creating or editing, restart Claude Code for changes to take effect.
```

## Best Practices

### File Naming

✅ **DO:**
- Use `.claude/plugin-name.local.md` format
- Match plugin name exactly
- Use `.local.md` suffix for user-local files

❌ **DON'T:**
- Use different directory (not `.claude/`)
- Use inconsistent naming
- Use `.md` without `.local` (might be committed)

### Gitignore

Always add to `.gitignore`:

```gitignore
.claude/*.local.md
.claude/*.local.json
```

Document this in plugin README.

### Defaults

Provide sensible defaults when settings file doesn't exist:

```bash
if [[ ! -f "$STATE_FILE" ]]; then
  # Use defaults
  ENABLED=true
  MODE=standard
else
  # Read from file
  # ...
fi
```

### Input Validation

Validate settings values:

```bash
MAX=$(echo "$FRONTMATTER" | grep '^max_value:' | sed 's/max_value: *//')

# Validate numeric range
if ! [[ "$MAX" =~ ^[0-9]+$ ]] || [[ $MAX -lt 1 ]] || [[ $MAX -gt 100 ]]; then
  echo "⚠️ Invalid max_value in settings (must be 1-100)" >&2
  MAX=10 # Use default
fi
```

### Restart Requirement

**Important**: Settings changes require Claude Code restart.

Document in your README:

```markdown
## Changing Settings

After editing `.claude/my-plugin.local.md`:
1. Save the file
2. Exit Claude Code
3. Restart: `claude` or `cc`
4. New settings will be loaded
```

Hooks cannot be hot-swapped within a session.

## Security Considerations

### Sanitize User Input

When writing settings files from user input:

```bash
# Escape quotes in user input
SAFE_VALUE=$(echo "$USER_INPUT" | sed 's/"/\\"/g')

# Write to file
cat > "$STATE_FILE" <<EOF
---
user_setting: "$SAFE_VALUE"
---
EOF
```

### Validate File Paths

If settings contain file paths:

```bash
FILE_PATH=$(echo "$FRONTMATTER" | grep '^data_file:' | sed 's/data_file: *//')

# Check for path traversal
if [[ "$FILE_PATH" == *".."* ]]; then
  echo "⚠️ Invalid path in settings (path traversal)" >&2
  exit 2
fi
```

### Permissions

Settings files should be:
- Readable by user only (`chmod 600`)
- Not committed to git
- Not shared between users

## Parsing Script Template

Complete hook script for reading settings:

```bash
#!/bin/bash
set -euo pipefail

STATE_FILE=".claude/my-plugin.local.md"

# Quick exit if not configured
if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

# Parse frontmatter
FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")

# Extract fields
ENABLED=$(echo "$FRONTMATTER" | grep '^enabled:' | sed 's/enabled: *//')
MODE=$(echo "$FRONTMATTER" | grep '^mode:' | sed 's/mode: *//' | sed 's/^"\(.*\)"$/\1/')

# Check enabled
if [[ "$ENABLED" != "true" ]]; then
  exit 0
fi

# Use settings in hook logic
case "$MODE" in
  strict)
    # Strict mode logic
    ;;
  *)
    # Default mode logic
    ;;
esac

# Hook output
echo '{"continue": true, "systemMessage": "Hook executed with settings"}'
exit 0
```

## Troubleshooting

**Settings not loading:**
- Check file exists at `.claude/plugin-name.local.md`
- Verify YAML syntax is valid
- Ensure frontmatter between `---` markers

**Changes not taking effect:**
- Restart Claude Code after editing settings
- Hooks load at session start
- Check file name matches plugin name

**Parsing errors:**
- Validate YAML syntax
- Quote string values with spaces
- Check field names match exactly
- Use sed commands to extract values

## Validation Checklist

- ☐ File at `.claude/plugin-name.local.md`
- ☐ YAML frontmatter between `---` markers
- ☐ Field values quoted if containing spaces
- ☐ File added to `.gitignore`
- ☐ README documents settings and format
- ☐ Template provided for users
- ☐ Defaults work when file missing
- ☐ Input validation for numeric/list fields
- ☐ Clear documentation on restart requirement
- ☐ Error handling for missing fields

## ShortSelect Project Settings

For project-specific plugin settings:
- Use for per-project configuration
- Store project-specific state
- Not for credentials (use env vars)
- Document in project README
- Provide clear templates for users

Common use cases:
- Toggle features per project
- Store project-specific tokens (from env)
- Configure validation levels
- Store task/agent state
- Project-specific instructions

## Implementation Workflow

To add settings to a plugin:

1. Design settings schema (which fields, types, defaults)
2. Create template file in plugin documentation
3. Add gitignore entry for `.claude/*.local.md`
4. Implement settings parsing in hooks/commands
5. Use quick-exit pattern (check file exists, check enabled field)
6. Document settings in plugin README with template
7. Remind users that changes require Claude Code restart

Focus on keeping settings simple and providing good defaults when settings file doesn't exist.
