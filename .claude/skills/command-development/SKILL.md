---
name: command-development
description: This skill should be used when the user asks to "create a command", "write a slash command", "add a command", "improve command", "design a command", or needs guidance on command structure, arguments, file references, Bash integration, or command best practices for Claude Code.
version: 0.1.0
---

# Command Development

Slash commands are frequently-used prompts defined as Markdown files that Claude executes when invoked. This skill covers designing and implementing high-quality slash commands with proper arguments, file references, and Bash integration.

## Command Basics

Slash commands provide:
- **Reusability**: Define once, use repeatedly
- **Consistency**: Standardize common workflows
- **Sharing**: Distribute across team or projects
- **Efficiency**: Quick access to complex prompts

**Critical**: Commands are instructions FOR Claude, not messages TO users.

✅ **Correct** (instructions for Claude):
```
Review this code for security vulnerabilities including:
- SQL injection
- XSS attacks
- Authentication issues

Provide specific line numbers and severity ratings.
```

❌ **Incorrect** (messages to user):
```
This command will review your code for security issues.
You'll receive a report with vulnerability details.
```

## File Locations

**Project commands** (shared with team):
- Location: `.claude/commands/`
- Scope: Available in specific project
- Label: Shown as "(project)" in `/help`

**Personal commands** (available everywhere):
- Location: `~/.claude/commands/`
- Scope: Available in all projects
- Label: Shown as "(user)" in `/help`

**Plugin commands** (bundled with plugins):
- Location: `plugin-name/commands/`
- Scope: Available when plugin installed
- Label: Shown as "(plugin-name)" in `/help`

## File Format

### Basic Command

Simple command with just Markdown (no frontmatter):

```markdown
Review this code for security vulnerabilities including:
- SQL injection
- XSS attacks
- Authentication bypass
- Insecure data handling
```

File saved as: `.claude/commands/review.md` → invoked as `/review`

### Command with Frontmatter

Command with YAML configuration:

```markdown
---
description: Review code for security issues
allowed-tools: Read, Grep, Bash(git:*)
model: sonnet
argument-hint: [file-path]
---

Review @$1 for security vulnerabilities...
```

## YAML Frontmatter Fields

### description

- **Purpose**: Brief description shown in `/help`
- **Type**: String
- **Default**: First line of command prompt
- **Best practice**: Clear, actionable description (under 60 characters)

Example:
```yaml
description: Review code for security vulnerabilities
```

### allowed-tools

- **Purpose**: Specify which tools command can use
- **Type**: String or Array
- **Default**: Inherits from conversation
- **Pattern**: Specific tools, wildcards, or restrictions

**Examples:**
```yaml
# Specific tools
allowed-tools: Read, Write, Edit

# With restrictions
allowed-tools: Bash(git:*)  # Bash with git only

# All tools
allowed-tools: "*"
```

### model

- **Purpose**: Specify model for command execution
- **Type**: String (sonnet, opus, haiku)
- **Default**: Inherits from conversation

**Use cases:**
- `haiku` - Fast, simple commands
- `sonnet` - Standard workflows (default)
- `opus` - Complex analysis

### argument-hint

- **Purpose**: Document expected arguments
- **Type**: String
- **Default**: None
- **Benefit**: Helps users understand command interface

Example:
```yaml
argument-hint: [file-path] [priority]
```

### disable-model-invocation

- **Purpose**: Prevent programmatic command calls
- **Type**: Boolean
- **Default**: false
- **Use**: Commands should only be manually invoked

## Dynamic Arguments

### Using $ARGUMENTS

Capture all arguments as single string:

```markdown
---
description: Fix issue by number
argument-hint: [issue-number]
---

Fix issue #$ARGUMENTS following our coding standards.
```

**Usage:**
```
/fix-issue 123
```

**Expands to:**
```
Fix issue #123 following our coding standards.
```

### Positional Arguments ($1, $2, $3)

Capture individual arguments:

```markdown
---
description: Review PR with priority
argument-hint: [pr-number] [priority]
---

Review pull request #$1 with priority level $2.
After review, suggest improvements.
```

**Usage:**
```
/review-pr 123 high
```

**Expands to:**
```
Review pull request #123 with priority level high.
After review, suggest improvements.
```

### Combining Arguments

Mix positional and remaining arguments:

```markdown
---
argument-hint: [service] [environment] [options]
---

Deploy $1 to $2 environment with options: $3
```

**Usage:**
```
/deploy api staging --force --skip-tests
```

**Expands to:**
```
Deploy api to staging environment with options: --force --skip-tests
```

## File References

### Using @ Syntax

Include file contents in command:

```markdown
---
description: Review specific file
argument-hint: [file-path]
---

Review @$1 for:
- Code quality
- Best practices
- Potential bugs
```

**Usage:**
```
/review-file src/api/users.ts
```

**Effect**: Claude reads file before processing command

### Multiple File References

Reference multiple files:

```markdown
Compare @src/old-version.js with @src/new-version.js

Identify:
- Breaking changes
- New features
- Bug fixes
```

### Static File References

Reference known files without arguments:

```markdown
Review @package.json and @tsconfig.json for consistency

Ensure:
- TypeScript version matches
- Dependencies are aligned
```

## Bash Execution in Commands

Commands can execute bash commands inline to gather context dynamically:

```markdown
---
description: Review git changes
allowed-tools: Bash(git:*)
---

Files changed: !`git diff --name-only`

Review each file for:
1. Code quality
2. Potential bugs
3. Test coverage
```

**When to use:**
- Include dynamic context (git status, environment variables)
- Gather project/repository state
- Build context-aware workflows

**Bash inline syntax**: !`command here`

**Example patterns:**
```
Current branch: !`git rev-parse --abbrev-ref HEAD`
Changed files: !`git diff --name-only`
Test results: !`npm test 2>&1`
```

## Command Organization

### Flat Structure

Simple organization for small command sets:

```
.claude/commands/
├── build.md
├── test.md
├── deploy.md
├── review.md
└── docs.md
```

**Use when**: 5-15 commands, no clear categories

### Namespaced Structure

Organize commands in subdirectories:

```
.claude/commands/
├── ci/
│ ├── build.md      # /ci-build
│ ├── test.md       # /ci-test
│ └── lint.md       # /ci-lint
├── git/
│ ├── commit.md     # /git-commit
│ └── pr.md         # /git-pr
└── docs/
 ├── generate.md    # /docs-generate
 └── publish.md     # /docs-publish
```

**Use when**: 15+ commands, clear categories

## Best Practices

### Command Design

1. **Single responsibility**: One command, one task
2. **Clear descriptions**: Self-explanatory in `/help`
3. **Explicit dependencies**: Use `allowed-tools` when needed
4. **Document arguments**: Always provide `argument-hint`
5. **Consistent naming**: Use verb-noun pattern (review-pr, fix-issue)

### Argument Handling

1. Validate arguments in prompt
2. Provide defaults when arguments missing
3. Document expected format
4. Handle edge cases gracefully

Example:
```markdown
---
argument-hint: [pr-number]
---

$IF($1,
 Review PR #$1 for quality,
 Please provide a PR number. Usage: /review-pr [number]
)
```

### File References

1. Use explicit, clear paths
2. Handle missing files gracefully
3. Use project-relative paths
4. Consider Glob patterns for flexible matching

### Bash Integration

1. Limit scope (e.g., `Bash(git:*)` not `Bash(*)`)
2. Use safe commands only
3. Handle command failures
4. Keep fast (avoid long-running commands)

### Documentation

1. Add comments explaining complex logic
2. Provide usage examples
3. List requirements and dependencies
4. Note breaking changes

Example:
```markdown
---
description: Deploy to environment
argument-hint: [environment] [version]
---

<!--
Usage: /deploy [staging|production] [version]
Requires: AWS credentials
Example: /deploy staging v1.2.3
-->

Deploy application to $1 using version $2...
```

## Common Patterns

### Review Pattern

```markdown
---
description: Review code changes
allowed-tools: Read, Bash(git:*)
---

Files changed: !`git diff --name-only`

Review each file for:
1. Code quality and style
2. Potential bugs
3. Test coverage
4. Documentation needs
```

### Testing Pattern

```markdown
---
description: Run tests for specific area
argument-hint: [test-path]
allowed-tools: Bash(npm:*)
---

Run tests: !`npm test $1`

Analyze results and suggest fixes.
```

### Documentation Pattern

```markdown
---
description: Generate documentation
argument-hint: [source-file]
---

Generate comprehensive documentation for @$1 including:
- Function descriptions
- Parameter documentation
- Return values
- Usage examples
- Edge cases
```

### Workflow Pattern

```markdown
---
description: Complete PR workflow
argument-hint: [pr-number]
allowed-tools: Bash(gh:*), Read
---

PR #$1 Workflow:

1. Fetch PR: !`gh pr view $1`
2. Review changes
3. Run checks
4. Approve or request changes
```

## Troubleshooting

**Command not appearing:**
- Check file is in correct directory
- Verify `.md` extension present
- Ensure valid Markdown syntax
- Restart Claude Code

**Arguments not working:**
- Verify `$1`, `$2` syntax correct
- Check `argument-hint` matches usage
- Ensure no extra spaces

**Bash execution failing:**
- Check `allowed-tools` includes Bash
- Verify command syntax in backticks
- Test command in terminal first
- Check for required permissions

**File references not working:**
- Verify `@` syntax correct
- Check file path is valid
- Ensure Read tool allowed
- Use project-relative paths

## Validation Checklist

- [ ] File has `.md` extension
- [ ] Filename in kebab-case
- [ ] Description field (if using frontmatter)
- [ ] `argument-hint` provided if command takes arguments
- [ ] File references use `@` syntax correctly
- [ ] Bash execution uses backticks with `!` prefix
- [ ] `allowed-tools` restricts appropriately
- [ ] Markdown is valid and readable
- [ ] No instructions to user (only to Claude)
- [ ] Instructions are clear and specific

## ShortSelect Project Commands

For project commands in `.claude/commands/`:
- Follow established patterns in repository
- Respect CLAUDE.md naming conventions
- Use domain knowledge (ATS, recruiting)
- Integrate with existing tools and agents
- Document in project README

Common command categories:
- Database/migrations
- Testing and validation
- Code review and linting
- Deployment workflows
- Documentation generation
