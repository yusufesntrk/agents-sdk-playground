---
name: plugin-structure
description: This skill should be used when the user asks to "create a plugin", "organize a plugin", "structure a plugin", "build a plugin", "set up plugin structure", "create plugin manifest", or needs guidance on plugin directory layout, manifest configuration, component organization, file naming conventions, or plugin best practices for Claude Code.
version: 0.1.0
---

# Plugin Structure

This skill covers organizing Claude Code plugins with proper directory layout, manifest configuration, component organization, and portable file references.

## Plugin Fundamentals

Plugins are distributable packages that bundle:
- **Slash commands** - User-invoked workflows
- **Agents** - Autonomous subprocesses
- **Skills** - Auto-discovered capabilities
- **Hooks** - Event-driven automation
- **MCP Servers** - External integrations

Plugins provide:
- Reusability across projects
- Team standardization
- Community sharing
- Version management

## Directory Structure

### Standard Layout

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest (required)
├── commands/                    # Slash commands (.md files)
│   ├── command1.md
│   └── command2.md
├── agents/                      # Subagent definitions (.md files)
│   ├── agent1.md
│   └── agent2.md
├── skills/                      # Agent skills (subdirectories)
│   ├── skill-name/
│   │   ├── SKILL.md            # Skill definition (required)
│   │   ├── references/
│   │   ├── examples/
│   │   └── scripts/
│   └── skill2/
│       └── SKILL.md
├── hooks/
│   ├── hooks.json              # Hook configuration
│   └── scripts/
│       ├── validate.sh
│       └── check.sh
├── .mcp.json                    # MCP server definitions
└── scripts/                     # Helper scripts and utilities
    ├── build.sh
    └── deploy.sh
```

### Critical Rules

1. **Manifest location**: `plugin.json` MUST be in `.claude-plugin/` directory
2. **Component locations**: All directories (commands, agents, skills, hooks) at plugin root, NOT nested inside `.claude-plugin/`
3. **Optional components**: Only create directories for components the plugin uses
4. **Naming convention**: Use kebab-case for all directory and file names

## Plugin Manifest

### Required Fields

```json
{
  "name": "plugin-name"
}
```

**Name requirements:**
- Use kebab-case format (lowercase with hyphens)
- Must be unique across installed plugins
- No spaces or special characters
- Example: `code-review-assistant`, `test-runner`

### Recommended Metadata

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief explanation of plugin purpose",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://docs.example.com",
  "repository": "https://github.com/user/plugin-name",
  "license": "MIT",
  "keywords": ["testing", "automation", "ci-cd"]
}
```

**Version format**: Follow semantic versioning (MAJOR.MINOR.PATCH)
**Keywords**: Use for plugin discovery and categorization

### Component Path Configuration

```json
{
  "name": "plugin-name",
  "commands": "./custom-commands",
  "agents": ["./agents", "./specialized-agents"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

**Path rules:**
- Must be relative to plugin root
- Must start with `./`
- Cannot use absolute paths
- Support arrays for multiple locations
- Custom paths supplement defaults

## Component Organization

### Commands

- **Location**: `commands/` directory
- **Format**: Markdown files (`.md`) with optional YAML frontmatter
- **Auto-discovery**: All `.md` files in `commands/` load automatically

```
commands/
├── review.md          # /review command
├── test.md            # /test command
└── deploy.md          # /deploy command
```

**File format:**
```markdown
---
description: Command description
argument-hint: [args]
allowed-tools: Read, Write
---

Command instructions for Claude...
```

### Agents

- **Location**: `agents/` directory
- **Format**: Markdown files (`.md`) with YAML frontmatter
- **Auto-discovery**: All `.md` files in `agents/` load automatically

```
agents/
├── code-reviewer.md
├── test-generator.md
└── refactorer.md
```

**File format:**
```markdown
---
name: agent-identifier
description: Use this agent when... Examples: <example>...</example>
model: inherit
color: blue
tools: ["Read", "Write"]
---

You are an expert [role]...

**Core Responsibilities:**
...
```

### Skills

- **Location**: `skills/` directory with subdirectories per skill
- **Format**: Each skill in its own directory with `SKILL.md`
- **Auto-discovery**: All `SKILL.md` files in skill subdirectories

```
skills/
├── api-testing/
│   ├── SKILL.md
│   ├── scripts/
│   │   └── test-runner.py
│   └── references/
│       └── api-spec.md
└── database-migrations/
    ├── SKILL.md
    └── examples/
        └── migration-template.sql
```

**SKILL.md format:**
```markdown
---
name: Skill Name
description: When to use this skill
version: 1.0.0
---

Skill instructions and guidance...
```

### Hooks

- **Location**: `hooks/hooks.json` (in hooks directory)
- **Format**: JSON configuration
- **Scripts**: Related scripts in `hooks/scripts/`

```
hooks/
├── hooks.json
└── scripts/
    ├── validate.sh
    └── check-style.sh
```

**Configuration format:**
```json
{
  "PreToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "command",
      "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate.sh"
    }]
  }]
}
```

### MCP Servers

- **Location**: `.mcp.json` at plugin root
- **Format**: JSON configuration
- **Auto-start**: Servers start when plugin enables

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/servers/server.js"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

## Portable Path References

### ${CLAUDE_PLUGIN_ROOT}

Use this variable for all intra-plugin path references:

```json
{
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/run.sh"
}
```

**Why it matters**: Plugins install in different locations depending on:
- Installation method (marketplace, local, npm)
- Operating system conventions
- User preferences

**Where to use it:**
- Hook command paths
- MCP server command arguments
- Script execution references
- Resource file paths

**Never use:**
- Hardcoded absolute paths (`/Users/name/plugins/...`)
- Home directory shortcuts (`~/plugins/...`)
- Working directory relative paths

### Path Resolution

**In manifest JSON fields:**
```json
{
  "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/tool.sh"
}
```

**In component files (commands, agents, skills):**
```markdown
Reference scripts at: ${CLAUDE_PLUGIN_ROOT}/scripts/helper.py
```

**In executed scripts:**
```bash
#!/bin/bash
# ${CLAUDE_PLUGIN_ROOT} available as environment variable
source "${CLAUDE_PLUGIN_ROOT}/lib/common.sh"
```

## File Naming Conventions

### Component Files

**Commands**: kebab-case `.md` files
- `code-review.md` → `/code-review`
- `run-tests.md` → `/run-tests`

**Agents**: kebab-case `.md` files describing role
- `test-generator.md`
- `code-reviewer.md`

**Skills**: kebab-case directory names
- `api-testing/`
- `database-migrations/`

### Supporting Files

**Scripts**: descriptive kebab-case with extensions
- `validate-input.sh`
- `generate-report.py`

**Documentation**: kebab-case markdown
- `api-reference.md`
- `migration-guide.md`

**Configuration**: standard names
- `hooks.json`
- `.mcp.json`
- `plugin.json`

## Auto-Discovery Mechanism

Claude Code automatically discovers and loads:

1. **Manifest**: Reads `.claude-plugin/plugin.json` on plugin enable
2. **Commands**: Scans `commands/` for `.md` files
3. **Agents**: Scans `agents/` for `.md` files
4. **Skills**: Scans `skills/` for subdirectories with `SKILL.md`
5. **Hooks**: Loads from `hooks/hooks.json` or manifest
6. **MCP Servers**: Loads from `.mcp.json` or manifest

**Discovery timing:**
- Installation: Components register
- Plugin enable: Components become available
- No restart required: Changes take effect next session

**Override behavior**: Custom paths in `plugin.json` supplement (not replace) defaults

## Best Practices

### Organization

1. **Logical grouping**: Group related components
   - Test-related commands, agents, skills together
   - Use subdirectories in `scripts/` by purpose

2. **Minimal manifest**: Keep `plugin.json` lean
   - Only specify custom paths when necessary
   - Rely on auto-discovery for standard layouts

3. **Documentation**: Include README files
   - Plugin root: Overall purpose and usage
   - Component directories: Specific guidance
   - Script directories: Usage and requirements

### Naming

1. **Consistency**: Use consistent naming across components
   - Command `test-runner`, agent `test-runner-agent`
   - Match skill directory to purpose

2. **Clarity**: Descriptive names indicating purpose
   - ✅ Good: `api-integration-testing/`, `code-quality-checker.md`
   - ❌ Avoid: `utils/`, `misc.md`, `temp.sh`

3. **Length**: Balance brevity with clarity
   - Commands: 2-3 words (`review-pr`, `run-ci`)
   - Agents: Describe role (`code-reviewer`, `test-generator`)
   - Skills: Topic-focused (`error-handling`, `api-design`)

### Portability

1. Always use `${CLAUDE_PLUGIN_ROOT}`—never hardcode paths
2. Test on multiple systems (macOS, Linux, Windows)
3. Document dependencies and versions
4. Avoid system-specific features

### Maintenance

1. Version consistently (semantic versioning)
2. Deprecate gracefully before removal
3. Document breaking changes clearly
4. Test thoroughly after changes

## Common Patterns

### Minimal Plugin

Single command, no dependencies:
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json         # Just name field
└── commands/
    └── hello.md            # Single command
```

### Full-Featured Plugin

Complete plugin with all component types:
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/               # User-facing commands
├── agents/                 # Specialized subagents
├── skills/                 # Auto-activating skills
├── hooks/                  # Event handlers
│   ├── hooks.json
│   └── scripts/
├── .mcp.json              # External integrations
└── scripts/               # Shared utilities
```

### Skill-Focused Plugin

Provides only skills (no commands/agents):
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    ├── skill-one/
    │   └── SKILL.md
    └── skill-two/
        └── SKILL.md
```

## Manifest Structure Example

### Minimal

```json
{
  "name": "code-reviewer"
}
```

### Standard

```json
{
  "name": "code-reviewer",
  "version": "1.0.0",
  "description": "Automated code review agent for quality assurance",
  "author": {
    "name": "Your Team",
    "email": "team@example.com"
  },
  "keywords": ["code-review", "quality", "automation"]
}
```

### With Custom Paths

```json
{
  "name": "code-reviewer",
  "version": "1.0.0",
  "commands": "./cli/commands",
  "agents": ["./agents", "./reviewers"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

## Troubleshooting

**Component not loading:**
- Verify file in correct directory with correct extension
- Check YAML frontmatter syntax
- Confirm skill has `SKILL.md` (not `README.md`)
- Ensure plugin is enabled

**Path resolution errors:**
- Replace hardcoded paths with `${CLAUDE_PLUGIN_ROOT}`
- Verify paths relative and start with `./` in manifest
- Check files exist at specified paths
- Test with `echo $CLAUDE_PLUGIN_ROOT` in scripts

**Auto-discovery not working:**
- Confirm directories at plugin root (not in `.claude-plugin/`)
- Check file naming follows conventions
- Verify custom paths in manifest are correct
- Restart Claude Code to reload configuration

**Manifest validation errors:**
- Check JSON syntax (valid braces, quotes, commas)
- Verify required fields present
- Check all paths are relative and start with `./`
- Use JSON validator tool

## Validation Checklist

- [ ] Manifest in `.claude-plugin/plugin.json`
- [ ] Manifest has valid JSON syntax
- [ ] `name` field present and unique
- [ ] All components in plugin root (not in `.claude-plugin/`)
- [ ] Command files in `commands/` with `.md` extension
- [ ] Agent files in `agents/` with `.md` extension
- [ ] Skill directories in `skills/` with `SKILL.md` files
- [ ] Hook files at `hooks/hooks.json`
- [ ] All paths use `${CLAUDE_PLUGIN_ROOT}` (not hardcoded)
- [ ] All paths start with `./` in manifest
- [ ] File names use kebab-case
- [ ] No required components missing
- [ ] README documenting plugin purpose
- [ ] Plugin tested after changes

## ShortSelect Project Plugins

For project-specific plugins:
- Follow established patterns in repository
- Respect CLAUDE.md conventions
- Use domain knowledge (ATS, recruiting)
- Integrate with existing systems
- Document in project README

Consider packaging as plugin if:
- Reusable across projects
- Multiple components (commands + agents + skills)
- Sharable with team
- Needs versioning/distribution
