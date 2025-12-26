---
name: architecture-decision-records
description: Write and maintain Architecture Decision Records (ADRs) following best practices for technical decision documentation. Use when documenting significant technical decisions, reviewing past architectural choices, or establishing decision processes.
version: 1.0.0
---

# Architecture Decision Records

Comprehensive patterns for creating, maintaining, and managing Architecture Decision Records (ADRs) that capture the context and rationale behind significant technical decisions.

## When to Use This Skill

- Making significant architectural decisions
- Documenting technology choices
- Recording design trade-offs
- Onboarding new team members
- Reviewing historical decisions
- Establishing decision-making processes

## Core Concepts

### What is an ADR?

An Architecture Decision Record captures:
- **Context**: Why we needed to make a decision
- **Decision**: What we decided
- **Consequences**: What happens as a result

### When to Write an ADR

| Write ADR | Skip ADR |
|-----------|----------|
| New framework adoption | Minor version upgrades |
| Database technology choice | Bug fixes |
| API design patterns | Implementation details |
| Security architecture | Routine maintenance |

### ADR Lifecycle

```
Proposed → Accepted → Deprecated → Superseded
              ↓
           Rejected
```

## Standard ADR Template (MADR Format)

```markdown
# ADR-0001: Use PostgreSQL as Primary Database

## Status
Accepted

## Context
We need to select a primary database for our new platform...

## Decision Drivers
* **Must have ACID compliance** for payment processing
* **Must support complex queries** for reporting
* **Should support full-text search**

## Considered Options
### Option 1: PostgreSQL
- **Pros**: ACID compliant, excellent JSON support, built-in full-text search
- **Cons**: Slightly more complex replication setup

### Option 2: MySQL
- **Pros**: Very familiar to team, simple replication
- **Cons**: Weaker JSON support, no built-in full-text search

## Decision
We will use **PostgreSQL 15** as our primary database.

## Consequences
### Positive
- Single database handles transactions, search, and geospatial queries
- Reduced operational complexity

### Negative
- Need to learn PostgreSQL-specific features
- Some team members need training
```

## Lightweight ADR Template

```markdown
# ADR-0012: Adopt TypeScript for Frontend Development

**Status**: Accepted
**Date**: 2024-01-15
**Deciders**: @alice, @bob, @charlie

## Context
Our React codebase has grown with increasing bug reports related to type mismatches.

## Decision
Adopt TypeScript for all new frontend code. Migrate existing code incrementally.

## Consequences
**Good**: Catch type errors at compile time, better IDE support
**Bad**: Learning curve, initial slowdown
```

## Y-Statement Format

```markdown
In the context of **building a microservices architecture**,
facing **the need for centralized API management**,
we decided for **Kong Gateway**
and against **AWS API Gateway and custom Nginx solution**,
to achieve **vendor independence and plugin extensibility**,
accepting that **we need to manage Kong infrastructure ourselves**.
```

## ADR Directory Structure

```
docs/
├── adr/
│   ├── README.md           # Index and guidelines
│   ├── template.md         # Team's ADR template
│   ├── 0001-use-postgresql.md
│   ├── 0002-caching-strategy.md
│   └── 0003-mongodb-user-profiles.md  # [DEPRECATED]
```

## Best Practices

### Do's
- **Write ADRs early** - Before implementation starts
- **Keep them short** - 1-2 pages maximum
- **Be honest about trade-offs** - Include real cons
- **Link related decisions** - Build decision graph
- **Update status** - Deprecate when superseded

### Don'ts
- **Don't change accepted ADRs** - Write new ones to supersede
- **Don't skip context** - Future readers need background
- **Don't hide failures** - Rejected decisions are valuable
- **Don't be vague** - Specific decisions, specific consequences
