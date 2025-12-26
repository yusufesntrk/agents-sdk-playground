---
name: typescript-review
description: Review TypeScript and JavaScript code changes for compliance with coding standards, style violations, and code quality issues. Use when reviewing pull requests or diffs containing TypeScript/JavaScript code.
version: 1.0.0
allowed-tools: Read, Grep, Bash, Glob
---

# TypeScript/JavaScript Code Review Skill

## Code Review Guidelines

Review pull requests with a focus on:

- Compliance with project coding standards and conventions
- Code quality and best practices
- Clear and correct JSDoc comments
- Type safety and proper TypeScript usage
- React best practices (when applicable)

## Commands

### Linting and Formatting

- **Lint:** `yarn lint-eslint-pure` - Run ESLint on the codebase
- **Format:** `yarn prettier` - Format code using Prettier
- **Type Check:** `yarn type-check-pure` - Run TypeScript type checking

### Testing

- **Test a specific file:** `yarn test-unit path/to/file.unit.spec.js`
- **Test by pattern:** `yarn test-unit -t "pattern"` - Runs tests matching pattern

## Review Checklist

### TypeScript Quality

- [ ] Proper type annotations (avoid `any`)
- [ ] Consistent use of interfaces vs types
- [ ] Correct generic type usage
- [ ] No type assertions without justification (`as`)
- [ ] Proper null/undefined handling

### Code Organization

- [ ] Single responsibility principle
- [ ] Functions under 30 lines when possible
- [ ] Proper file/folder structure
- [ ] Consistent naming conventions
- [ ] No dead code or commented-out code

### React Specific

- [ ] Proper hook dependencies
- [ ] No unnecessary re-renders
- [ ] Correct key usage in lists
- [ ] Proper component composition
- [ ] Event handlers properly bound

### Documentation

- [ ] JSDoc comments for public functions
- [ ] Clear prop type definitions
- [ ] Inline comments for complex logic
- [ ] README updates if needed

### Error Handling

- [ ] Proper try/catch usage
- [ ] Error boundaries where appropriate
- [ ] Graceful error states in UI
- [ ] Meaningful error messages

### Testing

- [ ] Unit tests for new functions
- [ ] Integration tests for components
- [ ] Edge cases covered
- [ ] Test naming is descriptive

## Pattern Matching Table

| Pattern | Issue |
|---------|-------|
| `any` type | Should use specific type |
| `// @ts-ignore` | Needs justification or fix |
| `console.log` | Remove before commit |
| `useState` without deps | Check useEffect dependencies |
| `key={index}` | Use stable unique key |
| Empty catch block | Handle or log error |

## Feedback Format

**For type issues:**
> Consider using a more specific type instead of `any`. This helps catch errors at compile time.

**For React issues:**
> The `useEffect` is missing `dependency` in its dependency array, which could cause stale closures.

**For style issues:**
> This function is over 50 lines. Consider breaking it into smaller, focused functions.
