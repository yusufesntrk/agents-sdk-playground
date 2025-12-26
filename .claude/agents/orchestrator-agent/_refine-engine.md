# Refine Engine - Implementation Guide

The Refine Engine orchestrates a multi-phase improvement workflow for recent implementations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER: /refine "feedback"                  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  IDENTIFY PHASE         │
        │  - git log analysis     │
        │  - file change tracking │
        │  - feature categorization
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  UNDERSTAND PHASE       │
        │  - parse user feedback  │
        │  - extract requirements │
        │  - identify issues      │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────────────┐
        │  REFINE PHASE (Sub-Agents)      │
        │                                  │
        │  ┌─ Backend Issues?              │
        │  │  └→ Backend Agent             │
        │  │                               │
        │  ├─ Frontend Issues?             │
        │  │  └→ Frontend Agent            │
        │  │                               │
        │  └─ UI Issues?                   │
        │     ├→ UI Review Agent           │
        │     └→ Frontend Agent (fixes)    │
        │                                  │
        └────────────┬────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  TEST PHASE             │
        │  - Playwright E2E tests │
        │  - real user workflows  │
        │  - verification         │
        └────────────┬────────────┘
                     │
            ┌────────▼────────┐
            │  All Tests Pass? │
            └────┬────────┬───┘
                 │        │
              Yes│        │No
                 │        └──→ DEBUG PHASE
                 │             ├─ Screenshot analysis
                 │             ├─ Console log review
                 │             ├─ Root cause analysis
                 │             └─ Re-run Refine
                 │
        ┌────────▼────────────┐
        │  DOCUMENT PHASE     │
        │  - Update FEATURES  │
        │  - Commit changes   │
        │  - Report results   │
        └─────────────────────┘
```

## Phase Details

### 1. IDENTIFY PHASE

**Goal:** Determine what was just implemented

```typescript
interface ImplementationContext {
  lastCommit: {
    sha: string;
    message: string;
    timestamp: Date;
    author: string;
  };

  changedFiles: {
    path: string;
    type: 'added' | 'modified' | 'deleted';
    changes: number;
  }[];

  feature: {
    name: string;
    category: 'backend' | 'frontend' | 'ui' | 'mixed';
    phase: string;  // e.g., "Phase 2.5"
    scope: string[]; // e.g., ["components", "hooks", "migrations"]
  };

  currentStatus: {
    buildPasses: boolean;
    testsPass: boolean;
    deployable: boolean;
  };
}
```

**Steps:**

1. Run `git log -1 --name-status` to find recent changes
2. Analyze file types (src/, supabase/, tests/)
3. Extract feature name from commit message
4. Determine which sub-agents to activate
5. Load current implementation context

### 2. UNDERSTAND PHASE

**Goal:** Parse user feedback and identify improvement areas

```typescript
interface RefinementRequest {
  userFeedback: string;

  problems: {
    category: 'ui' | 'performance' | 'functionality' | 'code-quality';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedArea: string;
  }[];

  improvements: {
    priority: number;
    action: string;
    rationale: string;
  }[];

  scope: {
    backend: boolean;
    frontend: boolean;
    ui: boolean;
    tests: boolean;
    documentation: boolean;
  };
}
```

**Steps:**

1. Parse user input for keywords:
   - **"ugly", "bad", "horrible"** → UI issue
   - **"slow", "performance"** → Performance issue
   - **"doesn't work", "broken"** → Functionality issue
   - **"compact", "tight", "clean"** → UI refinement

2. Extract improvement targets

3. Determine which phases need activation

4. Create refinement action plan

### 3. REFINE PHASE

**Goal:** Apply improvements using sub-agents

#### 3a. If Backend Issues

```bash
Backend Agent Instructions:
1. Analyze: hooks, migrations, RLS policies
2. Improve:
   - Error handling
   - Performance
   - Validation
3. Output: Updated files + explanation
4. Save: Changed files to shared location
```

#### 3b. If Frontend Issues

```bash
Frontend Agent Instructions:
1. Analyze: components, pages, state management
2. Improve:
   - Component logic
   - State management
   - Error handling
   - Accessibility
3. Output: Refactored components + explanation
4. Save: Changed files to shared location
```

#### 3c. If UI Issues

```bash
Step 1: UI Review Agent
- Read components
- Take Playwright screenshots
- Analyze against ui-patterns.md
- Generate fix recommendations

Step 2: Frontend Agent
- Apply UI recommendations
- Refactor styling
- Optimize spacing/sizing
- Improve visual hierarchy
```

**Sub-Agent Sequencing:**

```typescript
const refinementPlan = {
  if (problems.includes('ui')) {
    // UI Review Agent analyzes
    // Frontend Agent applies fixes
  }
  if (problems.includes('performance')) {
    // Backend Agent optimizes queries
    // Frontend Agent memoizes components
    // Test Agent benchmarks
  }
  if (problems.includes('functionality')) {
    // Backend Agent fixes hooks/DB
    // Frontend Agent fixes UI
    // Test Agent validates workflows
  }
}
```

### 4. TEST PHASE

**Goal:** Validate improvements with real-world tests

```typescript
interface TestScenarios {
  // For each component that was refined
  scenarios: [
    {
      name: string;
      steps: [
        "navigate to page",
        "interact with element",
        "verify state",
        "check visual appearance"
      ];
      assertions: [
        "element renders",
        "button is clickable",
        "data loads",
        "no console errors"
      ];
    }
  ];
}
```

**Test Types:**

1. **Functional Tests**
   - Does the feature work?
   - Are all workflows complete?
   - No errors or crashes?

2. **Visual Tests**
   - Does UI look good?
   - Spacing is consistent?
   - Icons/colors correct?

3. **Performance Tests**
   - Load time acceptable?
   - No memory leaks?
   - Smooth interactions?

4. **Integration Tests**
   - Works with rest of system?
   - Data persists correctly?
   - No conflicts?

### 5. DEBUG PHASE (if needed)

**Goal:** Fix test failures

```bash
Debug Agent Actions:
1. Take screenshots at each step
2. Capture console logs
3. Monitor network requests
4. Identify failure point
5. Analyze root cause
6. Generate fix recommendations

Then:
1. Return to appropriate Sub-Agent (Backend/Frontend)
2. Apply fixes
3. Re-test
4. Repeat until all pass
```

### 6. DOCUMENT PHASE

**Goal:** Update FEATURES.md and commit

```bash
1. Extract refinement summary
2. Update relevant FEATURES.md section
3. Add notes about improvements
4. Create git commit:
   "refine: Improve [Feature Name] - [changes]"
5. Commit Sub-Agents' work if not auto-committed
```

## Sub-Agent Communication Protocol

### File-Based Communication

```
Shared Location: `.claude/orchestrator/.refine-context/`

Files:
- `context.json` - Current refinement context
- `problems.json` - Identified issues
- `improvements.json` - Planned improvements
- `changes.json` - Made changes
- `test-results.json` - Test results
```

### Example: Backend Agent Refinement

```json
{
  "status": "backend-refinement-needed",
  "feature": "Document Management",
  "issues": [
    {
      "file": "src/hooks/useDocumentUpload.ts",
      "problem": "Missing error handling for large files",
      "severity": "high"
    },
    {
      "file": "supabase/migrations/...",
      "problem": "RLS policy too permissive",
      "severity": "critical"
    }
  ],
  "instructions": {
    "analyze": "Review hooks and migrations",
    "improve": "Add proper validation and error handling",
    "test": "Verify with new test cases"
  }
}
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `/refine` command spec (.claude/commands/refine.md) ✅
- [ ] Document architecture (this file) ✅
- [ ] Define communication protocol
- [ ] Create context manager

### Phase 2: Identify & Understand
- [ ] Git log parser
- [ ] User feedback parser
- [ ] Problem categorizer
- [ ] Refinement planner

### Phase 3: Refinement Integration
- [ ] Backend Agent integration
- [ ] Frontend Agent integration
- [ ] UI Review Agent integration
- [ ] Change collector

### Phase 4: Testing Framework
- [ ] E2E test generator
- [ ] Test runner
- [ ] Result analyzer
- [ ] Screenshot capture

### Phase 5: Debug Integration
- [ ] Debug Agent integration
- [ ] Error handler
- [ ] Root cause analyzer
- [ ] Fix applier

### Phase 6: Documentation
- [ ] FEATURES.md updater
- [ ] Commit generator
- [ ] Result reporter

### Phase 7: Orchestration
- [ ] Main refine orchestrator
- [ ] Sub-agent coordinator
- [ ] Error recovery
- [ ] Progress tracking

## Key Design Decisions

### 1. Sequential vs Parallel Sub-Agents

**Decision:** Mostly sequential with strategic parallelism

**Reasoning:**
- UI Review → Frontend fixes must be sequential
- Backend and Frontend can run parallel if independent
- Tests must run after all refinements complete
- Debug runs conditionally

### 2. Test Scope

**Decision:** E2E tests only, not unit tests

**Reasoning:**
- E2E tests verify actual user workflows
- Unit tests too granular for refinement
- Playwright can catch UI regressions

### 3. Auto-fix vs Manual

**Decision:** Auto-fix for code patterns, manual for complex logic

**Reasoning:**
- UI patterns can be auto-fixed (spacing, sizing)
- Complex logic needs human review
- Preserve code quality standards

### 4. Commit Strategy

**Decision:** Single commit after all phases complete

**Reasoning:**
- Atomic changes
- Easier rollback
- Cleaner git history
- Tracks full refinement in one commit

## Error Handling

### If Sub-Agent Fails

```
1. Capture error and context
2. Log detailed error info
3. Ask sub-agent to retry or escalate
4. If still fails, abort refinement
5. Report error to user with suggestions
```

### If Tests Fail

```
1. Run Debug Agent
2. Analyze failure
3. Determine root cause
4. Re-run appropriate Sub-Agent
5. Re-test
6. If still failing after 2 attempts, manual review needed
```

### If Refinement Blocked

```
1. Report what's blocking
2. Show suggestions for manual fixes
3. Provide recovery instructions
4. Option to rollback and try different approach
```

## Performance Considerations

- **Sub-Agent Execution:** ~1-2 minutes per agent
- **Playwright Tests:** ~1-2 minutes for ~10 tests
- **Total Refinement Time:** ~5-10 minutes typical case
- **Timeout:** 15 minutes maximum before failure

## Future Enhancements

1. **Interactive Refinement Preview**
   - Show before/after side-by-side
   - Let user approve/reject changes
   - Iterative refinement

2. **Performance Profiling**
   - Measure improvement metrics
   - Before/after comparison
   - Performance badges

3. **Accessibility Audit**
   - WCAG compliance checking
   - Screen reader testing
   - Keyboard navigation verification

4. **Security Audit**
   - XSS vulnerability scan
   - SQL injection check
   - Permission validation

5. **Code Metrics**
   - Complexity reduction
   - Test coverage improvement
   - Bundle size impact

---

**Status:** 📋 Design Complete, Ready for Implementation
**Next Step:** Implement Phase 1 (Foundation)
