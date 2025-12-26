---
name: clojure-review
description: Review Clojure and ClojureScript code changes for compliance with coding standards, style violations, and code quality issues. Use when reviewing pull requests or diffs containing Clojure/ClojureScript code.
version: 1.0.0
allowed-tools: Read, Grep, Bash, Glob
---

# Clojure Code Review Skill

## Clojure Style Guide

### Naming Conventions

**General Naming:**
- Acceptable abbreviations: `acc`, `i`, `pred`, `coll`, `n`, `s`, `k`, `f`
- Use `kebab-case` for all variables, functions, and constants

**Function Naming:**
- Pure functions should be nouns describing the value they return (e.g., `age` not `calculate-age` or `get-age`)
- Functions with side effects must end with `!`
- Don't repeat namespace alias in function names

**Destructuring:**
- Map destructuring should use kebab-case local bindings even if the map uses `snake_case` keys

### Documentation Standards

**Docstrings:**
- Every public var must have docstring
- Format using Markdown conventions
- Reference other vars with `[[other-var]]` not backticks

**Comments:**
- `TODO` format: `;; TODO (Name M/D/YY) -- description`

### Code Organization

**Visibility:**
- Make everything `^:private` unless it is used elsewhere
- Try to organize namespaces to avoid `declare` (put public functions near the end)

**Size and Structure:**
- Break up functions > 20 lines
- Lines ≤ 120 characters
- No blank lines within definition forms (except pairwise `let`/`cond`)

## Review Guidelines

**What to flag:**
- Check compliance with the Clojure style guide
- Flag all style guide violations

**What NOT to post:**
- Do not post comments congratulating someone for trivial changes
- Do not post comments confirming things "look good"
- Only post comments about style violations or potential issues

**Special cases:**
- Do not post comments about missing parentheses (caught by linter)

## Quick Review Checklist

### Naming
- [ ] Descriptive names (no `tbl`, `zs`)
- [ ] Pure functions named as nouns describing their return value
- [ ] `kebab-case` for all variables and functions
- [ ] Side-effect functions end with `!`
- [ ] No namespace-alias repetition in function names

### Documentation
- [ ] Public vars have useful docstrings
- [ ] Docstrings use Markdown conventions
- [ ] References use `[[other-var]]` not backticks
- [ ] `TODO` comments include author and date

### Code Organization
- [ ] Everything `^:private` unless used elsewhere
- [ ] No `declare` when avoidable
- [ ] Functions under 20 lines when possible
- [ ] No blank lines within definition forms
- [ ] Lines ≤ 120 characters

### Tests
- [ ] Separate `deftest` forms for distinct test cases
- [ ] Pure tests marked `^:parallel`
- [ ] Test names end in `-test` or `-test-<number>`

### REST API
- [ ] Response schemas present (`:- <schema>`)
- [ ] Query params use kebab-case, bodies use `snake_case`
- [ ] Routes use singular nouns (e.g., `/api/dashboard/:id`)
- [ ] All new endpoints have tests

## Pattern Matching Table

| Pattern | Issue |
|---------|-------|
| `calculate-age`, `get-user` | Pure functions should be nouns: `age`, `user` |
| `update-db`, `save-model` | Missing `!` for side effects |
| `snake_case_var` | Should use kebab-case |
| Public var without docstring | Add docstring explaining purpose |
| `;; TODO fix this` | Missing author/date |
| Function > 20 lines | Consider breaking up |
| `/api/dashboards/:id` | Use singular: `/api/dashboard/:id` |

## Feedback Format Examples

**For style violations:**
> This pure function should be named as a noun describing its return value. Consider `user` instead of `get-user`.

**For missing documentation:**
> This public var needs a docstring explaining its purpose, inputs, and outputs.

**For organization issues:**
> This function is only used in this namespace, so it should be marked `^:private`.
