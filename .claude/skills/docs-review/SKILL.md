---
name: docs-review
description: Review documentation changes for compliance with writing style guidelines. Use when reviewing pull requests, files, or diffs containing documentation markdown files.
version: 1.0.0
allowed-tools: Read, Grep, Bash, Glob
---

# Documentation Review Skill

## Writing Style Guide

### Core Principles

Write like you're talking to a colleague. Be conversational, not formal. Get people what they need quickly. Know your audience and match the complexity.

### Tone and Voice

**Do:**
- Use contractions ("can't" not "cannot")
- Say "people" or "companies" instead of "users"
- Be friendly but not peppy
- Acknowledge limitations honestly
- Jokes and Easter eggs are okay

**Don't:**
- Use exclamation points excessively
- Rely on tired tropes about nerdiness
- Use corporate jargon ("utilize", "offerings", "actionable insights")
- Tell people something is cool (show them instead)

### Structure and Clarity

**Lead with the important stuff:**
- Most important information first
- Lead with the ask, then provide context
- Cut text that adds little value
- Each paragraph should have one clear purpose

**Make headings do the work:**
- Convey your actual point, not just the topic
- "Use headings to highlight key points" not "How to write a good heading"
- Use sentence case, no punctuation except question marks
- No links in headings unless entire heading is a link

### Instructions and Examples

**Tell people what to do:**
- Give the action before explaining why
- Put commands in execution order
- Don't describe tasks as "easy" or "simple"

## Review Checklist

**Tone and voice:**
- [ ] Formal/corporate language ("utilize" not "use")
- [ ] "Users" instead of "people" or "companies"
- [ ] Excessive exclamation points
- [ ] Telling readers something is cool instead of showing

**Structure and clarity:**
- [ ] Important information buried instead of leading
- [ ] Verbose text that adds little value
- [ ] Paragraphs without clear purpose
- [ ] Vague headings that don't convey the point
- [ ] Instructions explain "why" before telling "what to do"
- [ ] Tasks described as "easy" or "simple"

**Links and references:**
- [ ] Linking the word "here" instead of descriptive text
- [ ] Links in headings (unless entire heading is a link)

**Formatting:**
- [ ] Ampersands as "and" substitute (except proper nouns)
- [ ] Inconsistent list formatting

**Code and examples:**
- [ ] Code examples that don't work or would error
- [ ] Commands not in execution order
- [ ] Full-width screenshots instead of scoped UI elements

## Quick Scan Table

| Pattern | Issue |
|---------|-------|
| we can do X, our feature | Should be "Metabase" or "it" |
| click here, read more here | Need descriptive link text |
| easy, simple, just | Remove condescending qualifiers |
| users | Should be "people" or "companies" |

## Feedback Format

**MANDATORY: Every issue MUST be numbered sequentially starting from Issue 1.**

### Format Example

```markdown
## Issues

**Issue 1: [Brief title]**
Line X: Succinct description of the issue
Suggested fix or explanation

**Issue 2: [Brief title]**
Line Y: Description of the issue
Suggested fix or explanation
```

**Examples:**

> **Issue 1: Formal tone**
> Line 15: This could be more conversational. Consider: "You can't..." instead of "You cannot..."

> **Issue 2: Vague heading**
> Line 8: The heading could be more specific. Try stating the point directly.

## Final Check

1. Remove issues that won't make a material difference to the reader
2. Verify all issues are numbered sequentially starting from Issue 1
3. Confirm format matches: `**Issue N: [Brief title]**`
