---
name: postmortem-writing
description: Write effective blameless postmortems with root cause analysis, timelines, and action items. Use when conducting incident reviews, writing postmortem documents, or improving incident response processes.
version: 1.0.0
---

# Postmortem Writing

Comprehensive guide to writing effective, blameless postmortems that drive organizational learning and prevent incident recurrence.

## When to Use This Skill

- Conducting post-incident reviews
- Writing postmortem documents
- Facilitating blameless postmortem meetings
- Identifying root causes and contributing factors
- Creating actionable follow-up items
- Building organizational learning culture

## Core Concepts

### Blameless Culture

| Blame-Focused | Blameless |
|---------------|-----------|
| "Who caused this?" | "What conditions allowed this?" |
| "Someone made a mistake" | "The system allowed this mistake" |
| Punish individuals | Improve systems |
| Hide information | Share learnings |

### Postmortem Triggers

- SEV1 or SEV2 incidents
- Customer-facing outages > 15 minutes
- Data loss or security incidents
- Near-misses that could have been severe
- Novel failure modes

### Timeline

```
Day 0: Incident occurs
Day 1-2: Draft postmortem document
Day 3-5: Postmortem meeting
Day 5-7: Finalize document, create tickets
Week 2+: Action item completion
```

## Standard Postmortem Template

```markdown
# Postmortem: [Incident Title]

**Date**: 2024-01-15
**Authors**: @alice, @bob
**Status**: Draft | In Review | Final
**Severity**: SEV2
**Duration**: 47 minutes

## Executive Summary
Brief description of what happened, root cause, and resolution.

**Impact**:
- X customers affected
- Estimated revenue loss: $X
- X support tickets created

## Timeline (All times UTC)

| Time | Event |
|------|-------|
| 14:23 | Deployment completed |
| 14:31 | First alert fired |
| 14:33 | On-call acknowledges |
| 15:18 | Service recovered |

## Root Cause Analysis

### What Happened
Technical description of the failure.

### Why It Happened
1. **Proximate Cause**: Immediate trigger
2. **Contributing Factors**: Conditions that enabled it
3. **5 Whys Analysis**: Deep dive into root cause

## Detection

### What Worked
- Alert fired within X minutes
- Dashboard showed clear issue

### What Didn't Work
- Alert threshold too high
- No deployment-correlated alerting

## Response

### What Worked
- Quick identification of issue
- Rollback decision was decisive

### What Could Be Improved
- Took X minutes to correlate with deployment

## Impact

- Customer Impact: X users affected
- Business Impact: $X revenue loss
- Technical Impact: Database load elevated

## Lessons Learned

### What Went Well
1. Alerting detected issue before customer reports
2. Team collaborated effectively

### What Went Wrong
1. Code review missed critical change
2. Test coverage gap

### Where We Got Lucky
1. Incident occurred during business hours

## Action Items

| Priority | Action | Owner | Due Date | Ticket |
|----------|--------|-------|----------|--------|
| P0 | Add integration test | @alice | 2024-01-22 | ENG-1234 |
| P1 | Document patterns | @bob | 2024-01-29 | DOC-89 |
```

## 5 Whys Analysis Template

```markdown
## Problem Statement
Payment service experienced 47-minute outage.

### Why #1: Why did the service fail?
Database connections exhausted.

### Why #2: Why were connections exhausted?
Each request opened new connection instead of using pool.

### Why #3: Why did code bypass connection pool?
Developer refactored and inadvertently changed method.

### Why #4: Why wasn't this caught in code review?
Reviewer focused on functional change, not infrastructure.

### Why #5: Why isn't there a safety net?
Missing automated tests for infrastructure behavior.

## Root Causes Identified
1. Missing automated tests for infrastructure behavior
2. Insufficient documentation of architectural patterns
```

## Facilitation Guide

### Meeting Structure (60 minutes)

1. **Opening (5 min)** - Remind of blameless culture
2. **Timeline Review (15 min)** - Walk through events
3. **Analysis Discussion (20 min)** - What failed and why
4. **Action Items (15 min)** - Prioritize improvements
5. **Closing (5 min)** - Summarize learnings

### Facilitation Tips
- Keep discussion on track
- Redirect blame to systems
- Encourage quiet participants
- Document dissenting views
- Time-box tangents

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Better Approach |
|--------------|---------|-----------------|
| **Blame game** | Shuts down learning | Focus on systems |
| **Shallow analysis** | Doesn't prevent recurrence | Ask "why" 5 times |
| **No action items** | Waste of time | Always have concrete next steps |
| **No follow-up** | Actions forgotten | Track in ticketing system |

## Best Practices

### Do's
- **Start immediately** - Memory fades fast
- **Be specific** - Exact times, exact errors
- **Include graphs** - Visual evidence
- **Assign owners** - No orphan action items
- **Share widely** - Organizational learning

### Don'ts
- **Don't name and shame** - Ever
- **Don't skip small incidents** - They reveal patterns
- **Don't create busywork** - Actions should be meaningful
- **Don't skip follow-up** - Verify actions completed

## Resources

- Google SRE - Postmortem Culture
- Etsy's Blameless Postmortems
- PagerDuty Postmortem Guide
