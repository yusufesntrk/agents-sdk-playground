---
name: skill-development
description: This skill should be used when the user wants to "create a skill", "add a skill to plugin", "write a new skill", "improve skill description", "organize skill content", or needs guidance on skill structure, progressive disclosure, or skill development best practices for Claude Code plugins.
version: 0.1.0
---

# Skill Development

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized workflows, tool integrations, domain expertise, and bundled resources.

## About Skills

Skills enable Claude to:
- Execute multi-step procedures with consistency
- Integrate with specific file formats or APIs
- Leverage domain expertise and company-specific knowledge
- Bundle reusable resources (scripts, references, assets)

Skills use progressive disclosure—metadata is always available, SKILL.md body loads on trigger, and bundled resources load as needed. This keeps Claude's context efficient while providing deep expertise when activated.

## Anatomy of a Skill

**Required:**
- `SKILL.md` - Contains YAML frontmatter (name, description) and Markdown instructions

**Optional Bundled Resources:**
- `scripts/` - Executable code (Python/Bash) for deterministic tasks
- `references/` - Documentation loaded as needed into context
- `assets/` - Files used in output (templates, icons, fonts)

## Skill Creation Process

### Step 1: Understanding with Concrete Examples

Gather real usage examples from users and identify:
- Core functionality patterns
- Use cases that should trigger the skill
- Common workflows or procedures

### Step 2: Planning Reusable Contents

Analyze examples to create lists of:
- Scripts to include (utilities, validators, generators)
- References/documentation needed (patterns, APIs, guides)
- Assets to bundle (templates, icons, configuration)

### Step 3: Create Skill Structure

```
plugin-name/skills/skill-name/
├── SKILL.md
├── references/
│   ├── patterns.md
│   └── advanced.md
├── examples/
│   └── example.md
└── scripts/
    └── validate.py
```

### Step 4: Implement Resources First

Before writing SKILL.md, create:
- Scripts that work correctly and are executable
- Reference documentation for detailed content
- Examples users can copy and adapt

Then update SKILL.md to reference all bundled resources.

### Step 5: Write SKILL.md

**Style Requirements:**
- Use **imperative/infinitive form** (verb-first): "To create a hook, define the event type. Configure the MCP server."
- **NOT** second person: "You should..." or "You need to..."
- Use **third-person in description**: "This skill should be used when the user asks to..."

**Content Guidelines:**
- Include essential procedures and workflow guidance
- Reference all bundled resources explicitly
- Move detailed content to references/
- Target 1,500-2,000 words (max 3,000 words)

**Good Description Example:**
```yaml
description: This skill should be used when the user asks to "create a hook", "add a PreToolUse hook", "validate tool use", or mentions hook events (PreToolUse, PostToolUse, Stop).
```

**Bad Description Examples:**
- "Use this skill when working with hooks" (wrong person, vague)
- "Load when user needs hook help" (not third person)
- "Provides hook guidance" (no trigger phrases)

### Step 6: Validate Against Checklist

- ✓ Skill in correct directory: `skills/skill-name/`
- ✓ SKILL.md has complete frontmatter (name, description)
- ✓ Description uses third person with specific trigger phrases
- ✓ Body uses imperative/infinitive form, not second person
- ✓ SKILL.md body is 1,500-2,000 words (max 3,000)
- ✓ Detailed content moved to references/
- ✓ All referenced files exist and are correct
- ✓ Examples are complete and runnable
- ✓ Scripts are executable and tested
- ✓ No duplication between SKILL.md and resources

### Step 7: Test on Real Tasks

Use the skill on actual problems:
- Notice inefficiencies or gaps
- Identify missing examples or documentation
- Update SKILL.md or bundled resources
- Test improvements with real usage

## Progressive Disclosure in Practice

### What Goes in SKILL.md (Always Loaded When Triggered)

- Core concepts and overview
- Essential procedures and workflows
- Quick reference tables
- Pointers to references/examples/scripts
- Most common use cases

**Target: 1,500-2,000 words (max 3,000)**

### What Goes in references/ (Loaded As Needed)

- Detailed patterns and advanced techniques
- Comprehensive API documentation
- Migration guides and edge cases
- Troubleshooting and complex scenarios
- Extensive examples and walkthroughs

**Each file can be 2,000-5,000+ words**

### What Goes in examples/ (Working Code)

- Complete, runnable scripts and configurations
- Template files users can copy and adapt
- Real-world usage patterns
- Step-by-step walkthroughs

### What Goes in scripts/ (Utility Scripts)

- Validation tools and testing helpers
- Parsing utilities and automation
- Should be executable and documented
- Can be invoked by Claude as needed

## Writing Style

### Imperative/Infinitive Form

**Correct:** "To create a hook, define the event type. Configure the MCP server. Validate settings."

**Incorrect:** "You should create a hook... You need to configure... You must validate..."

### Third-Person Descriptions

**Correct:** `This skill should be used when the user asks to "create X", "configure Y"...`

**Incorrect:**
- "Use this skill when you want to..."
- "Load this skill when user asks..."

### Objective, Instructional Language

Write suitable for AI consumption—direct, actionable, objective language without conversational tone.

## Common Mistakes to Avoid

### Mistake 1: Weak Trigger Descriptions

Include specific phrases users would actually say that should trigger the skill. Generic descriptions like "use when working with hooks" won't reliably trigger.

**Better:** Include exact user queries like "create a hook", "add a PreToolUse hook", "validate tool use".

### Mistake 2: Too Much in SKILL.md

SKILL.md should cover core procedures. Move patterns, APIs, advanced techniques, and edge cases to references/. This keeps the skill lean and loads details only when needed.

### Mistake 3: Second Person Writing

Don't use "you"—use imperative form (verb-first instructions) instead. Claude is executing the procedure, not reading advice.

### Mistake 4: Missing Resource References

Always explicitly reference bundled scripts, references, and examples in SKILL.md body. Include file paths so Claude knows what's available.

## Skill Structure Recommendations

### Minimal Skill
For simple, focused capabilities:
```
skill-name/
└── SKILL.md
```

### Standard Skill (Recommended)
For most use cases:
```
skill-name/
├── SKILL.md
├── references/
│   └── patterns.md
└── examples/
    └── example.md
```

### Complete Skill
For comprehensive capabilities:
```
skill-name/
├── SKILL.md
├── references/
│   ├── patterns.md
│   ├── advanced.md
│   └── api.md
├── examples/
│   ├── example1.md
│   └── example2.md
└── scripts/
    ├── validate.py
    └── test.sh
```

## Best Practices Summary

1. **Strong Triggers** - Include exact phrases users would say
2. **Lean SKILL.md** - Keep under 2,000 words, max 3,000
3. **Progressive Disclosure** - Move detailed content to references/
4. **Imperative Writing** - Use verb-first instructions, not "you"
5. **Third-Person Descriptions** - "This skill should be used when..."
6. **Bundled Resources** - Include reusable scripts, references, examples
7. **No Duplication** - Each fact lives in one place only
8. **Test Thoroughly** - Use skill on real tasks before finalizing
9. **Explicit References** - Point to bundled files in SKILL.md
10. **Iterate Based on Usage** - Update based on real-world feedback
