---
name: agent-development
description: This skill should be used when the user asks to "create an agent", "build an agent", "develop an agent", "write agent instructions", "design a subagent", or needs guidance on agent architecture, system prompts, triggering conditions, or agent best practices for Claude Code.
version: 0.1.0
---

# Agent Development

Agents are autonomous subprocesses that handle complex, multi-step tasks independently. This skill covers designing and implementing high-quality agents for Claude Code with proper triggering, system prompts, and operational guidance.

## Agent Fundamentals

Agents differ from commands and skills:
- **Agents**: Autonomous subprocesses invoked via Task tool when needed
- **Commands**: User-triggered slash commands for specific workflows
- **Skills**: Auto-triggered capabilities based on context and description

Agents excel at:
- Complex multi-step analysis (code review, architecture design)
- Specialized domain expertise (security, testing, performance)
- Autonomous problem-solving without user interaction
- Coordinated parallel work with other agents

## Agent File Structure

### Complete Format

```yaml
---
name: agent-identifier
description: Use this agent when [triggering conditions]. Examples:

<example>
Context: [Situation description]
user: "[User request]"
assistant: "[How assistant should respond and use this agent]"
<commentary>
[Why this agent should be triggered]
</commentary>
</example>

model: inherit
color: blue
tools: ["Read", "Write", "Grep"]
---

You are [agent role description]...

**Your Core Responsibilities:**
1. [Responsibility 1]
2. [Responsibility 2]

**Analysis Process:**
[Step-by-step workflow]

**Output Format:**
[What to return]
```

## Frontmatter Fields

### name (required)
- **Format**: lowercase, numbers, hyphens only
- **Length**: 3-50 characters
- **Pattern**: Must start and end with alphanumeric

Examples:
- ✅ `code-reviewer`, `test-generator`, `api-analyzer`
- ❌ `helper` (too generic), `-agent-` (starts with hyphen), `ag` (too short)

### description (required)

Defines when Claude should trigger this agent. **Most critical field.**

**Must include:**
1. Triggering conditions ("Use this agent when...")
2. Multiple `<example>` blocks showing usage
3. Context, user request, and assistant response
4. `<commentary>` explaining why agent triggers

**Best practices:**
- Include 2-4 concrete examples
- Show both proactive and reactive triggering
- Cover different phrasings of same intent
- Be specific about when NOT to use agent

Example:
```
Use this agent when the user asks to "review code", "check code quality", "analyze code", or requests a detailed code review. Show both explicit and proactive triggering.

<example>
Context: User submitted code and wants review
user: "Review this code for quality issues"
assistant: "I'll use the code-reviewer agent to analyze the code"
<commentary>
User explicitly requests code review, trigger agent.
</commentary>
</example>
```

### model (required)

**Options:**
- `inherit` - Use same model as parent (recommended)
- `sonnet` - Claude Sonnet (balanced capability)
- `opus` - Claude Opus (most capable, expensive)
- `haiku` - Claude Haiku (fast, cheap)

**Recommendation**: Use `inherit` unless agent needs specific model capabilities (e.g., opus for complex reasoning, haiku for simple validation).

### color (required)

Visual identifier for agent in UI.

**Options**: `blue`, `cyan`, `green`, `yellow`, `magenta`, `red`

**Guidelines:**
- Choose distinct colors for different agents in same plugin
- blue/cyan: Analysis, review agents
- green: Success-oriented, creation tasks
- yellow: Caution, validation tasks
- red: Critical, security agents
- magenta: Creative, generation tasks

### tools (optional)

Restrict agent to specific tools (principle of least privilege).

**Format**: Array of tool names
```yaml
tools: ["Read", "Write", "Grep", "Bash"]
```

**Default**: If omitted, agent has access to all tools

**Common tool sets:**
- Read-only analysis: `["Read", "Grep", "Glob"]`
- Code generation: `["Read", "Write", "Grep"]`
- Testing/execution: `["Read", "Bash", "Grep"]`
- Full access: Omit field

## System Prompt Design

### Standard Structure

```
You are [role] specializing in [domain].

**Your Core Responsibilities:**
1. [Primary responsibility]
2. [Secondary responsibility]
3. [Additional responsibilities...]

**Analysis Process:**
1. [Step one]
2. [Step two]
3. [Step three]
[...]

**Quality Standards:**
- [Standard 1]
- [Standard 2]

**Output Format:**
Provide results in this format:
- [What to include]
- [How to structure]

**Edge Cases:**
Handle these situations:
- [Edge case 1]: [How to handle]
- [Edge case 2]: [How to handle]
```

### Writing Style

✅ **DO:**
- Write in second person ("You are...", "You will...")
- Be specific about responsibilities
- Provide step-by-step process
- Define output format clearly
- Include quality standards
- Address edge cases
- Keep under 10,000 characters

❌ **DON'T:**
- Write in first person ("I am...", "I will...")
- Be vague or generic
- Omit process steps
- Leave output format undefined
- Skip quality guidance
- Ignore error cases

## Triggering Examples

### Example Format

Each example should show:
```
<example>
Context: [What's happening that should trigger agent]
user: "[Actual user message]"
assistant: "[How assistant prepares to use agent]"
<commentary>
[Why agent triggers here - be specific]
</commentary>
assistant: "I'll use the [agent-name] agent to [what it does]."
</example>
```

### Proactive Triggering

Agents trigger not just when explicitly requested, but also when context suggests they're needed:

```
<example>
Context: User described a complex problem that needs analysis
user: "Our API has memory leaks in production"
assistant: "Let me investigate this with a performance analysis agent"
<commentary>
User described a performance issue that needs expert analysis.
Agent should proactively offer to help.
</commentary>
assistant: "I'll use the performance-analyzer agent to diagnose the memory leaks"
</example>
```

### Multiple Phrasings

Show different ways users might request the same thing:

```
<example>
Context: User wants code review
user: "Check this code for bugs"
...
</example>

<example>
Context: Different phrasing of same need
user: "Does this code have any issues?"
...
</example>
```

## Validation Rules

### Identifier Validation

- 3-50 characters
- Lowercase letters, numbers, hyphens only
- Must start and end with alphanumeric
- No underscores, spaces, or special characters

✅ Valid: `code-reviewer`, `test-gen`, `api-analyzer-v2`
❌ Invalid: `ag` (too short), `-start` (starts with hyphen), `my_agent` (underscore)

### Description Validation

- **Length**: 10-5,000 characters
- **Must include**: Triggering conditions and examples
- **Best**: 200-1,000 characters with 2-4 examples
- **Structure**: "Use this agent when..." pattern with `<example>` blocks

### System Prompt Validation

- **Length**: 20-10,000 characters
- **Best**: 500-3,000 characters
- **Structure**: Clear role, responsibilities, process, output format, edge cases
- **Quality**: Specific, actionable instructions

## Agent Creation Workflow

### Step 1: Define Purpose

Identify:
- Core responsibility (what problem does it solve?)
- Primary use cases (when should it trigger?)
- Success criteria (how do we know it succeeded?)
- Triggering conditions (what phrases indicate need?)

### Step 2: Design System Prompt

Create comprehensive instructions:
- Role and domain expertise
- Core responsibilities (numbered list)
- Step-by-step analysis process
- Quality standards
- Output format expectations
- Edge case handling

### Step 3: Write Triggering Examples

Include 2-4 `<example>` blocks:
- Different phrasings of same intent
- Proactive and reactive triggering
- Context showing why agent needed
- Commentary explaining trigger reason

### Step 4: Choose Configuration

- **model**: Use `inherit` unless specific need
- **color**: Match agent type (blue for review, green for creation, etc.)
- **tools**: Restrict to minimum needed (principle of least privilege)

### Step 5: Validate and Test

- Check identifier follows naming rules
- Verify description has strong trigger phrases
- Test system prompt with real scenarios
- Verify edge cases handled correctly
- Confirm output format is as expected

## Best Practices

### Clear Triggering

Include specific phrases users would say:
- ✅ "Use this agent when the user asks to 'create X', 'build Y', 'design Z'"
- ❌ "Use when working with systems design"

Include 2-4 concrete examples with explanations.

### Comprehensive System Prompt

- Be specific about responsibilities
- Provide step-by-step processes
- Define output format clearly
- Handle common edge cases
- Include quality standards

### Appropriate Scope

- Agents handle complex, multi-step work
- Keep focus narrow (one primary responsibility)
- Delegate specific tasks to specialized agents
- Document coordination between agents

### Tool Minimization

- Use least privilege principle
- Only include necessary tools
- Document why each tool is needed
- Consider implications of each tool

### Quality Verification

- Test agent on representative tasks
- Check output matches specified format
- Verify edge cases handled correctly
- Measure quality against standards

## Common Agent Types

### MCP-Fähige Agents (NEU!)
- Responsibility: Autonome Browser-Interaktion
- Tools: `["Read", "Grep", "Glob", "mcp__playwright__*"]`
- Output: Screenshots, Analyse, Findings
- Example: qa-agent, ui-review-agent, test-agent, debug-agent
- **Voraussetzung:** `.mcp.json` im Projektverzeichnis!

### Analysis Agents
- Responsibility: Analyze code/architecture/problems
- Tools: `["Read", "Grep", "Glob"]` (read-only)
- Output: Detailed findings and recommendations
- Example: code-reviewer, security-analyzer

### Generation Agents
- Responsibility: Create code/docs/tests
- Tools: `["Read", "Write", "Grep"]`
- Output: Generated content (files or text)
- Example: test-generator, doc-writer

### Transformation Agents
- Responsibility: Refactor/migrate/optimize
- Tools: `["Read", "Write", "Edit", "Grep"]`
- Output: Modified code/content
- Example: code-refactorer, schema-migrator

### Coordination Agents
- Responsibility: Orchestrate other agents
- Tools: Depends on coordination needs
- Output: Structured results from agents
- Example: full-review-coordinator

---

## Agent Chains (NEU!)

### Warum Agent Chains?
Mit MCP-fähigen Agents können wir autonome Ketten bauen, wo jeder Agent selbstständig arbeitet und Ergebnisse weitergibt.

### Voraussetzungen für Agent Chains:
1. `.mcp.json` im Projektverzeichnis mit Playwright konfiguriert
2. Agents haben `mcp__playwright__*` in ihrer tools-Liste
3. Dev-Server läuft (z.B. `npm run dev`)

### Chain Pattern 1: QA-Chain (Qualitätssicherung)

```
┌─────────────────────────────────────────────────────┐
│ HAUPTAGENT (Orchestrator)                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Task spawnen: qa-agent                          │
│     → Agent navigiert selbst zu localhost           │
│     → Agent macht Screenshots (Desktop/Mobile)      │
│     → Agent prüft Console Errors                    │
│     → Agent gibt Findings zurück                    │
│                                                     │
│  2. Bei Findings → Task spawnen: general-purpose    │
│     prompt: "Du bist Frontend-Agent. Fixe: [...]"   │
│     → Agent wendet Fixes an                         │
│                                                     │
│  3. Task resumen: qa-agent (gleiche ID)             │
│     → Agent macht neue Screenshots                  │
│     → Agent validiert Fixes                         │
│     → Repeat bis ✅ PASS                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Chain Pattern 2: Feature-Chain (Feature Development)

```
┌─────────────────────────────────────────────────────┐
│ HAUPTAGENT (Orchestrator)                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Task spawnen: general-purpose                   │
│     prompt: "Du bist Frontend-Agent. Erstelle..."   │
│     → Agent erstellt Komponente                     │
│                                                     │
│  2. Task spawnen: ui-review-agent                   │
│     → Agent navigiert selbst                        │
│     → Agent macht responsive Screenshots            │
│     → Agent prüft Patterns (hover, scroll, etc.)    │
│     → Agent gibt Findings zurück                    │
│                                                     │
│  3. Bei Findings → Task spawnen: general-purpose    │
│     prompt: "Fixe UI-Issues: [Findings]"            │
│                                                     │
│  4. Task spawnen: test-agent                        │
│     → Agent navigiert und testet interaktiv         │
│     → Agent prüft Funktionalität                    │
│     → Agent gibt Test-Report zurück                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Chain Pattern 3: Debug-Chain (Bug Fixing)

```
┌─────────────────────────────────────────────────────┐
│ HAUPTAGENT (Orchestrator)                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Task spawnen: debug-agent                       │
│     prompt: "Problem: [Bug-Beschreibung]"           │
│     → Agent navigiert zu URL                        │
│     → Agent prüft Console Logs                      │
│     → Agent macht Screenshot                        │
│     → Agent analysiert Code                         │
│     → Agent gibt Root Cause + Fix zurück            │
│                                                     │
│  2. Task spawnen: general-purpose                   │
│     prompt: "Wende Fix an: [Debug-Agent Findings]"  │
│                                                     │
│  3. Task resumen: debug-agent                       │
│     → Agent validiert Fix                           │
│     → ✅ PASS oder weitere Findings                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Chain Pattern 4: Full Review Chain

```
Parallel ausführen:
├── qa-agent (Console Errors, Performance)
├── ui-review-agent (Patterns, Responsiveness)
└── test-agent (Interaktive Tests)

Dann: Findings aggregieren → Fixes anwenden → Re-validate
```

### Agent Chain Best Practices

1. **MCP-Agents für Browser-Arbeit spawnen**
   - `qa-agent`, `ui-review-agent`, `test-agent`, `debug-agent`
   - Diese können selbstständig Screenshots machen

2. **general-purpose für Code-Änderungen**
   - Für Write/Edit Zugriff
   - Prompt beschreibt die Rolle (Frontend-Agent, Backend-Agent)

3. **Resume-Pattern für Iterationen**
   - Agent-ID speichern
   - Bei Re-Validierung mit `resume: [agent-id]` aufrufen
   - Agent behält Kontext und kann vergleichen

4. **Parallele Ausführung wo möglich**
   - Unabhängige Agents parallel spawnen
   - Findings am Ende aggregieren

### Beispiel: Vollständige QA-Chain Implementation

```typescript
// Orchestrator spawnt QA-Agent
const qaResult = await Task({
  subagent_type: "qa-agent",
  prompt: `QA Check für http://localhost:5173
           Prüfe: Console Errors, Mobile, Desktop`
});

// Bei Findings: Frontend-Agent für Fixes
if (qaResult.includes("❌")) {
  await Task({
    subagent_type: "general-purpose",
    prompt: `Du bist Frontend-Agent.
             Fixe diese Issues:
             ${qaResult.findings}`
  });

  // Re-validate mit Resume
  await Task({
    subagent_type: "qa-agent",
    resume: qaResult.agentId,
    prompt: "Validiere die Fixes"
  });
}
```

## Integration with Project

For ShortSelect project agents:
- Follow established patterns in `.claude/agents/`
- Respect CLAUDE.md conventions
- Use domain knowledge (ATS, recruiting context)
- Integrate with existing Skills and Hooks
- Document in `.claude/agents/README.md`

Reference project context:
- Multi-tenant Supabase backend
- React + TypeScript frontend
- Playwright E2E testing
- RLS security model
- Established UI patterns

## Quick Reference

### Minimal Agent

```yaml
---
name: simple-agent
description: Use this agent when... Examples: <example>...</example>
model: inherit
color: blue
---

You are an agent that [does X].

**Responsibilities:**
1. [Responsibility 1]
2. [Responsibility 2]

**Process:**
1. [Step 1]
2. [Step 2]

**Output:**
[Format to provide]
```

### Validation Checklist

- [ ] Identifier follows naming rules (3-50 chars, lowercase, hyphens)
- [ ] Description uses "Use this agent when..." pattern
- [ ] Description includes 2-4 concrete examples
- [ ] Examples show context, user message, commentary
- [ ] System prompt has clear role and responsibilities
- [ ] System prompt includes step-by-step process
- [ ] System prompt defines output format
- [ ] System prompt addresses edge cases
- [ ] Model choice appropriate (default: inherit)
- [ ] Color choice matches agent type
- [ ] Tools restricted to minimum needed
- [ ] Prompt length reasonable (500-3000 chars ideal)

## Additional Resources

For complete system prompt patterns and advanced techniques:
- See `references/system-prompt-design.md` for detailed patterns
- See `references/triggering-examples.md` for trigger phrase examples
- See `references/agent-creation-system-prompt.md` for Claude Code's official agent creation prompt
