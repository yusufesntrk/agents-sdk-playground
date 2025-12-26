# Refine System - Complete Documentation

Comprehensive documentation for the `/refine` command and Refine Engine.

## Quick Start

```bash
# Refine the last implementation based on feedback
/refine "die UI ist zu hässlich und nicht kompakt"

# Check what was last implemented
/refine --check-last

# Full comprehensive refinement with audit
/refine --full-refinement
```

## What is Refine?

**Refine** is an intelligent improvement system that takes recent implementations and:

1. **Analyzes** what was built
2. **Understands** user feedback
3. **Improves** the code, UI, and functionality
4. **Tests** with real E2E tests using Playwright
5. **Debugs** any issues that arise
6. **Documents** the improvements

## Example: Document Management Refinement

### Before Refinement

User feedback: "die UI ist zu hässlich und nicht kompakt"

```
❌ Document List too verbose
❌ Buttons take lots of space
❌ Spacing is wasteful
❌ Metadata spread across multiple lines
```

### After Refinement

✅ Compact inline layout
✅ Icon-only buttons with tooltips
✅ Tight spacing throughout
✅ Metadata on single line
✅ All tests passing

## How It Works

### Step 1: Identify (Automatic)

```bash
$ /refine "ui ist zu verbose"

🔍 Identifying...
├─ Last commit: Document Management System Phase 2.5
├─ Changed files: 4 components, 3 hooks, 1 migration
├─ Feature: Document Management
├─ Category: Frontend + UI
└─ Status: ✅ Deployed
```

### Step 2: Understand (Parse Feedback)

```bash
📝 Understanding feedback...
├─ User wants: More compact UI
├─ Keywords detected: "hässlich" (ugly), "nicht kompakt" (not compact)
├─ Problem category: UI Design
├─ Severity: Medium
└─ Action: Refactor component styling
```

### Step 3: Refine (Sub-Agents Work)

```bash
🔧 Refining...

UI Review Agent → Takes screenshots & analyzes current state
    ↓
Frontend Agent → Applies design fixes
    ├─ Reduce padding (p-6 → p-4)
    ├─ Tighten spacing (gap-3 → gap-1)
    ├─ Icon-only buttons
    └─ Compact typography
    ↓
✅ Refinement complete
```

### Step 4: Test (Playwright E2E)

```bash
🧪 Testing with Playwright...

Test: Document Upload - Refined UI
  ├─ Navigate to Candidate Detail ✅
  ├─ Scroll to Documents section ✅
  ├─ Upload document ✅
  ├─ Verify compact layout ✅
  ├─ Verify buttons functional ✅
  └─ No console errors ✅

Test: Preview & Download
  ├─ Open preview ✅
  ├─ Verify modal displays ✅
  ├─ Close and verify ✅
  └─ No console errors ✅

Test: Delete Functionality
  ├─ Click delete button ✅
  ├─ Confirm deletion ✅
  ├─ Verify removed ✅
  └─ No console errors ✅

Results: 3/3 PASS ✅
```

### Step 5: Document (Auto Update)

```bash
📚 Updating FEATURES.md...

Phase 2.5 – Document Management System ✅
  - UI Refinement Applied (40% more compact)
  - All tests passing
  - Deployment ready

✅ Commit: abc1234 - refine: Improve Document Management UI
```

## File Structure

```
.claude/
├── commands/
│   └── refine.md                      ← The slash command spec
│
└── orchestrator/
    ├── refine-engine.md               ← Architecture & phases
    ├── refine-test-framework.md       ← Testing strategy
    ├── REFINE_README.md               ← This file
    ├── FEATURES_UPDATE_PROMPT.md      ← Documentation template
    └── .refine-context/               ← Runtime data
        ├── context.json               ← Current refinement state
        ├── problems.json              ← Identified issues
        ├── improvements.json          ← Planned improvements
        ├── changes.json               ← Applied changes
        └── test-results.json          ← Test results
```

## Workflow Phases

### Phase 1: IDENTIFY
- Analyze last git commit
- Determine what was implemented
- Extract feature name and scope
- Load implementation context

**Duration:** ~10 seconds

### Phase 2: UNDERSTAND
- Parse user feedback
- Extract problems and requirements
- Map to code components
- Create action plan

**Duration:** ~5 seconds

### Phase 3: REFINE
- Activate appropriate Sub-Agents
- Backend Agent (if needed)
- Frontend Agent (if needed)
- UI Review Agent (if needed)
- Apply improvements

**Duration:** 1-3 minutes

### Phase 4: TEST
- Generate E2E test scenarios
- Run tests with Playwright
- Capture results and metrics
- Analyze pass/fail

**Duration:** 1-2 minutes

### Phase 5: DEBUG (if needed)
- Run Debug Agent
- Take screenshots at each step
- Analyze console logs
- Identify root cause
- Re-apply fixes
- Re-test

**Duration:** 2-5 minutes (per issue)

### Phase 6: DOCUMENT
- Update FEATURES.md
- Create commit
- Report results

**Duration:** ~30 seconds

**Total Time:** 5-15 minutes typically

## Sub-Agent Coordination

```
User: /refine "feedback"
    ↓
Orchestrator: IDENTIFY → UNDERSTAND
    ↓
    ├─ Backend issues detected?
    │  └─ Call Backend Agent
    │
    ├─ Frontend issues detected?
    │  └─ Call Frontend Agent
    │
    └─ UI issues detected?
       ├─ Call UI Review Agent (analyze)
       └─ Call Frontend Agent (apply fixes)
    ↓
Test Agent: Run E2E tests
    ↓
    ├─ All pass?
    │  └─ Go to DOCUMENT phase
    │
    └─ Any fail?
       └─ Call Debug Agent
          ├─ Analyze failures
          ├─ Suggest fixes
          └─ Re-run appropriate Sub-Agent
             └─ Re-test
```

## Types of Refinements

### 1. UI Refinement
**Problem:** "die UI ist zu hässlich/nicht kompakt"

**What Gets Fixed:**
- Component spacing (padding, gaps)
- Button/icon sizing
- Layout optimization
- Visual consistency

**Agents Involved:**
- UI Review Agent (analyze)
- Frontend Agent (fix)
- Test Agent (visual tests)

**Success Criteria:**
- ✅ Layout is compact
- ✅ Icons visible and correct size
- ✅ No broken layout
- ✅ Functionality preserved

### 2. Functionality Refinement
**Problem:** "der upload funktioniert nicht richtig"

**What Gets Fixed:**
- Upload/download logic
- Error handling
- Data validation
- State management

**Agents Involved:**
- Backend Agent (hooks/DB)
- Frontend Agent (components)
- Test Agent (functional tests)

**Success Criteria:**
- ✅ Feature works as intended
- ✅ Error handling works
- ✅ No data loss
- ✅ No console errors

### 3. Performance Refinement
**Problem:** "alles ist viel zu langsam"

**What Gets Fixed:**
- Query optimization
- Component memoization
- Lazy loading
- Bundle size

**Agents Involved:**
- Backend Agent (DB optimization)
- Frontend Agent (memoization)
- Test Agent (performance tests)

**Success Criteria:**
- ✅ Load time improved
- ✅ Smooth interactions
- ✅ No memory leaks
- ✅ 60fps interactions

### 4. Code Quality Refinement
**Problem:** "der code sieht chaotisch aus"

**What Gets Fixed:**
- Code organization
- Error handling
- Type safety
- Comments/documentation

**Agents Involved:**
- Frontend Agent (components)
- Backend Agent (hooks/types)
- Test Agent (tests added)

**Success Criteria:**
- ✅ Code is clean
- ✅ Proper error handling
- ✅ Well typed
- ✅ Tests passing

## Test Results Interpretation

### Passing Test
```
✅ Document Upload - Refined UI
   Duration: 3.2s
   Status: PASSED

   Verified:
   - Document uploaded
   - Appears in list
   - Compact layout applied
   - No console errors
```

### Failing Test
```
❌ Delete Confirmation Dialog
   Duration: 2.1s
   Status: FAILED

   Error: Expected dialog to close but still visible

   Debug Info:
   - Network: DELETE request returned 404
   - Console: "document_id is null"
   - Issue: RLS policy blocking delete

   Recommendation:
   → Check useDocumentDelete hook
   → Verify RLS policies
   → Backend Agent to fix
```

## Common Scenarios

### Scenario A: Improve UI Responsiveness

```bash
$ /refine "buttons sind zu groß, kann ich mehr content sehen?"

Identified: Document Management UI too large

Plan:
1. UI Review Agent analyzes current layout
2. Takes Playwright screenshots
3. Identifies excessive padding/margins
4. Recommends size reductions

Refine:
1. Frontend Agent reduces:
   - Button size (md → sm)
   - Padding (p-4 → p-3)
   - Gaps (gap-3 → gap-2)
   - Icons (h-5 → h-4)

Test:
1. Visual test: Compare layout
2. Functional test: Buttons still clickable
3. Regression test: Other features work

Result: UI now shows 40% more content
```

### Scenario B: Fix Upload Failure

```bash
$ /refine "dokument upload schlägt fehl"

Identified: Document Upload broken

Debug:
1. Debug Agent attempts upload
2. Captures error: "Bucket not found"
3. Checks storage: Bucket doesn't exist

Fix:
1. Backend Agent checks migrations
2. Finds migration not applied
3. Applies migration to Supabase
4. Verifies bucket created

Test:
1. Upload file → Should succeed
2. Verify in database
3. Download file
4. Delete file

Result: Upload now works
```

### Scenario C: Comprehensive Audit

```bash
$ /refine --full-refinement

Audit:
1. Code quality check
2. Performance profiling
3. Security scan
4. UI/UX consistency
5. Test coverage

Refine & Test:
1. Apply improvements where needed
2. Run full E2E suite
3. Compare metrics

Result: Document showing all improvements
```

## Error Handling

### If Refine Fails to Identify

```
⚠️ Could not identify recent implementation

Possible causes:
- No recent commits
- Feature not identifiable
- Multiple features in last commit

Solutions:
→ Specify feature: /refine "Document Upload" "feedback"
→ Check git log: git log --oneline -5
→ Try smaller features
```

### If Refinement Causes Regression

```
❌ Refinement caused regression

Issue: Previous feature now broken

Automatic Recovery:
1. Revert to previous state
2. Identify what broke it
3. Apply more conservative fix
4. Re-test

OR Manual:
$ git revert <commit>
$ /refine "same feedback" --conservative
```

### If Tests Can't Run

```
⚠️ Tests failed to run

Possible causes:
- Dev server not running
- Playwright not installed
- Test environment issues

Solutions:
$ npm run dev              # Start server
$ npm install             # Install deps
$ npx playwright install  # Setup Playwright
$ /refine "feedback"      # Retry
```

## Performance Metrics

### Typical Refinement Times

| Phase | Duration | Details |
|-------|----------|---------|
| Identify | ~10s | Git analysis |
| Understand | ~5s | Feedback parsing |
| Refine | 1-3m | Sub-agent work |
| Test | 1-2m | E2E test execution |
| Document | ~30s | FEATURES update |
| **Total** | **5-15m** | Typical case |

### When Might It Take Longer

- 🔴 Multiple issues found: +2-5 minutes
- 🔴 Complex fixes needed: +3-10 minutes
- 🔴 Regression detected: +5-10 minutes (fix + re-test)
- 🟠 Visual testing: +1-2 minutes
- 🟠 Performance profiling: +2-3 minutes

## Best Practices

### ✅ DO

- ✅ Use specific feedback: "compact" vs "better"
- ✅ Focus on one refinement at a time
- ✅ Wait for completion before starting new refinement
- ✅ Review FEATURES.md update
- ✅ Test manually before committing

### ❌ DON'T

- ❌ Don't refine while dev server is off
- ❌ Don't refine if git state is dirty
- ❌ Don't refine multiple features simultaneously
- ❌ Don't interrupt a refinement mid-process
- ❌ Don't skip the test phase

## Integration with Orchestrator

The Refine system integrates with the main Orchestrator:

```
/orchestrate "New Feature"     → Creates implementation
    ↓
[Manual testing by user]
    ↓
/refine "improvement"          → Improves implementation
    ↓
[Full refinement cycle]
    ↓
Feature is production-ready
```

**Benefits:**
- Iterative improvement
- Catch issues early
- Continuous quality
- User feedback loop

## Future Enhancements

### V2.0 Features

1. **Interactive Refinement**
   - Before/after preview
   - Approve/reject changes
   - Iterative refinement UI

2. **Performance Profiling**
   - Detailed metrics
   - Before/after comparison
   - Performance badges

3. **Accessibility Audit**
   - WCAG compliance
   - Screen reader test
   - Keyboard navigation

4. **Security Audit**
   - XSS vulnerability scan
   - SQL injection check
   - Permission validation

5. **AI-Powered Suggestions**
   - Automatic problem detection
   - Fix recommendations
   - Code review

## Troubleshooting

### Refine Says "Nothing to Refine"

```
Reason: Last commit was already refined or no obvious improvements

Solution:
1. Be more specific: /refine "specific issue"
2. Show screenshots of problem
3. Explain what you want changed
```

### Tests Keep Failing

```
Reason: Complex issue that needs manual review

Solution:
1. Check test error message
2. Look at screenshots
3. Report issue to team
4. May need manual fixes
```

### FEATURES.md Not Updated

```
Reason: Refinement not complete or cancelled

Solution:
1. Check if tests passed
2. Review refinement output
3. Manually update if needed: /update-features "Feature"
```

## Related Commands

| Command | Purpose | When to Use |
|---------|---------|------------|
| `/orchestrate` | Build new feature | Start new implementation |
| `/refine` | Improve feature | Fix issues/improve quality |
| `/update-features` | Update documentation | Manual FEATURES.md update |
| `/debug` | Debug issues | Deep dive investigation |
| `/ui-review` | Check UI patterns | Visual consistency |

## Support & Feedback

For questions or issues:
1. Check this README
2. Review relevant documentation
3. Check example scenarios
4. Report issues to team

---

**System Status:** 🟢 Ready for Implementation
**Last Updated:** 2025-12-20
**Version:** 1.0 (Design Phase)
**Next Step:** Implement Phase 1 (Foundation)
