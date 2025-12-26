# Refine - Improve Latest Implementation

Refine and improve the most recent feature implementation based on user feedback.

## Purpose

The `/refine` command takes the last completed implementation and:

1. **Understands** - What the user wants to improve
2. **Refines** - Makes improvements to code, UI, functionality
3. **Tests** - Validates changes with real end-to-end tests using Playwright
4. **Debugs** - Takes screenshots and fixes any issues that arise
5. **Documents** - Updates FEATURES.md with improvements

## Usage

```bash
/refine "die UI ist zu hässlich und nicht kompakt"
/refine "der upload funktioniert nicht richtig"
/refine "das sieht unprofessionell aus, bitte schöner machen"
/refine --check-last  # Just check the last implementation
/refine --full-refinement  # Comprehensive audit and improvements
```

## Workflow

```
User Input: /refine "improvement suggestion"
    ↓
1. IDENTIFY PHASE
   ├─ What was implemented last?
   ├─ Which files were changed?
   ├─ What's the current status?
    ↓
2. UNDERSTAND PHASE
   ├─ Parse user feedback
   ├─ Identify problem areas (UI, functionality, performance)
   ├─ Determine what needs to be fixed
    ↓
3. REFINE PHASE (with Sub-Agents)
   ├─ If Backend Issues:
   │  └─ Backend Agent → Fix DB/Hooks/Logic
   │
   ├─ If Frontend Issues:
   │  └─ Frontend Agent → Fix Components/Pages
   │
   ├─ If UI Issues:
   │  └─ UI Review Agent → Analyze with screenshots → Suggest fixes
    ↓
4. TEST PHASE (with Playwright)
   ├─ Test Agent creates E2E tests
   ├─ Tests simulate real user actions:
   │  ├─ Click buttons
   │  ├─ Fill forms
   │  ├─ Upload files
   │  ├─ Navigate pages
   │  └─ Check results
   │
   ├─ Debug Agent captures:
   │  ├─ Screenshots
   │  ├─ Console logs
   │  ├─ Network errors
   │  ├─ Performance metrics
    ↓
5. DEBUG PHASE (if tests fail)
   ├─ Analyze failures
   ├─ Identify root cause
   ├─ Re-run Frontend/Backend Agent with fixes
   ├─ Re-test with Playwright
   └─ Repeat until passing
    ↓
6. DOCUMENT PHASE
   └─ Update FEATURES.md with improvements
```

## Example Scenarios

### Scenario 1: UI Too Ugly
```bash
/refine "die UI ist zu hässlich und nicht kompakt"

Process:
1. Identify: "Document Management" was last implemented
2. Understand: UI is verbose, needs to be more compact
3. Refine:
   - UI Review Agent analyzes components
   - Takes Playwright screenshots
   - Identifies issues (large spacing, redundant buttons, etc.)
   - Frontend Agent applies design fixes
4. Test:
   - Playwright tests navigate to Document section
   - Takes before/after screenshots
   - Verifies compact layout
5. Debug: If layout broken, fix with Frontend Agent
6. Document: Update FEATURES.md
```

### Scenario 2: Functionality Not Working
```bash
/refine "der upload funktioniert nicht richtig"

Process:
1. Identify: "Document Upload" implementation
2. Understand: Upload is failing or incomplete
3. Refine:
   - Debug Agent runs test upload scenario
   - Captures network/console errors
   - Backend Agent checks hooks/DB
   - Frontend Agent checks validation
4. Test:
   - Playwright test: Upload file → Check if appears → Verify metadata
5. Debug: Run full diagnostic if test fails
6. Document: Update FEATURES.md with fixes
```

### Scenario 3: General Improvement
```bash
/refine --full-refinement

Process:
1. Identify: All recent implementations
2. Understand: Comprehensive audit
3. Refine:
   - Code review for quality
   - Performance optimization
   - Security check
   - UI/UX consistency
4. Test: Full E2E test suite
5. Debug: Fix all issues found
6. Document: Update all affected sections
```

## Sub-Agents Used

### 1. **Backend Agent**
- Fixes: Database issues, RLS policies, hooks, validation
- Command: Identify and fix backend problems

### 2. **Frontend Agent**
- Fixes: Component logic, state management, forms
- Command: Refactor components based on feedback

### 3. **UI Review Agent**
- Takes: Playwright screenshots
- Analyzes: Layout, spacing, colors, icons
- Reports: Issues and recommendations
- Command: Auto-fix UI pattern violations

### 4. **Test Agent**
- Creates: E2E tests for the refinement
- Tests: Real user workflows
- Reports: Pass/fail, coverage

### 5. **Debug Agent**
- Runs: Playwright with monitoring
- Captures: Screenshots, console, network
- Analyzes: Root causes
- Reports: Issues and fixes

## Process Details

### Identify Phase
1. Check git log for recent commits
2. Find the feature branch or last changes
3. Identify which files were modified
4. Determine feature category (Backend/Frontend/UI)

### Understand Phase
1. Parse user input for keywords
2. Extract problems: "not working", "ugly", "slow", etc.
3. Map to components/features
4. Create improvement checklist

### Refine Phase
1. **If Backend Issues:**
   - Backend Agent reads current implementation
   - Identifies problems in hooks/DB
   - Fixes validation, error handling
   - Improves performance

2. **If Frontend Issues:**
   - Frontend Agent reads components
   - Improves state management
   - Better error handling
   - Cleaner code

3. **If UI Issues:**
   - UI Review Agent takes screenshots
   - Analyzes patterns
   - Creates fix plan
   - Frontend Agent applies fixes

### Test Phase
1. Test Agent creates E2E test
2. Playwright runs real scenarios
3. Tests verify:
   - Functionality works
   - UI looks correct
   - Performance is good
   - No console errors

### Debug Phase (if needed)
1. Debug Agent runs with monitoring
2. Captures screenshots at each step
3. Analyzes console/network
4. Identifies root cause
5. Fixes applied
6. Re-tests

### Document Phase
1. Extract what was changed
2. Update FEATURES.md
3. Add improvement notes
4. Commit with message

## Output

After `/refine` completes:

```
✅ Refinement Complete

Feature: Document Management System
Status: ✅ Improved

Changes Made:
- Frontend: Redesigned component layout (40% more compact)
- UI: Applied spacing token fixes
- Tests: All E2E tests passing ✅

Test Results:
- Document Upload: ✅ PASS
- Document Preview: ✅ PASS
- Delete Confirmation: ✅ PASS
- UI Layout: ✅ PASS (compact design verified)

Performance:
- Load time: 245ms → 189ms ⚡
- Component re-renders: 12 → 5 ✨

FEATURES.md: Updated ✅
Commit: abc1234def - refine: Improve Document Management UX and performance
```

## Technical Details

### How It Works

1. **Identify**: Uses git log to find last implementation
2. **Understand**: NLP-like parsing of user feedback
3. **Refine**: Calls appropriate sub-agents
4. **Test**: Launches Playwright with test scenarios
5. **Debug**: Uses Playwright for visual debugging
6. **Document**: Auto-generates FEATURES.md updates

### Sub-Agent Communication

Agents communicate via:
- **File System**: Shared files with implementation details
- **Git**: Commits and branches for tracking
- **Console**: Structured JSON output for parsing

### Refinement Scope

- ✅ Code quality improvements
- ✅ UI/UX refinements
- ✅ Performance optimization
- ✅ Bug fixes
- ✅ Documentation updates

## Examples of Improvements

### Before Refinement
```typescript
// Verbose component
<div className="p-6 space-y-4">
  <Card className="p-4">
    <Button className="w-full">
      <Icon className="h-5 w-5 mr-3" />
      <span className="text-base">Click Me</span>
    </Button>
  </Card>
</div>
```

### After Refinement
```typescript
// Compact component
<div className="p-3 space-y-2">
  <Button size="sm" className="h-8 w-8 p-0" title="Click Me">
    <Icon className="h-4 w-4" />
  </Button>
</div>
```

## Requirements

- Dev server running: `npm run dev`
- Playwright installed: `npx playwright install`
- Git repo clean or on feature branch
- Recent implementation to refine

## Limitations

- Cannot change database schema (only fixes to existing structure)
- Cannot add new features (only refines existing ones)
- Maximum refinement time: ~5 minutes per feature
- Requires clean git state to commit

## Future Enhancements

- [ ] Interactive refinement preview
- [ ] Performance profiling
- [ ] Automated security audit
- [ ] Cross-browser testing
- [ ] Accessibility audit (WCAG)
- [ ] Multi-language support
- [ ] A/B testing suggestions

---

## Command Syntax

```bash
# Basic refinement
/refine "your feedback here"

# Check last implementation
/refine --check-last

# Full comprehensive refinement
/refine --full-refinement

# Specific feature refinement
/refine "feature-name" "improvement suggestion"

# With options
/refine "feedback" --no-test  # Don't run tests
/refine "feedback" --verbose   # Detailed output
/refine "feedback" --dry-run   # Show what would happen
```

---

**Status:** 🟢 Ready to Implement
**Estimated Impl Time:** 1-2 hours
**Complexity:** High (orchestration, multi-agent)
