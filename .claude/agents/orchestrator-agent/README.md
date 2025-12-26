# Claude Code Orchestrator System

Advanced orchestration system for managing complex, multi-agent workflows in ShortSelect.

## What's Here

### Core Systems

#### 1. **Multi-Agent Orchestrator** ✅
- Coordinates 5 specialized agents (Backend, Frontend, UI, Test, Debug)
- Parallel and sequential execution
- Inter-agent communication
- Error handling and recovery

**Files:**
- `.claude/agents/` - Agent implementations
- `shared/orchestrator.ts` - Core logic

#### 2. **Refine System** 📋 (Ready to Implement)
Intelligent improvement workflow for existing implementations

**Files:**
- `.claude/commands/refine.md` - Slash command spec
- `refine-engine.md` - Architecture & phases
- `refine-test-framework.md` - Testing strategy
- `REFINE_README.md` - User documentation
- `IMPLEMENTATION_PLAN.md` - Dev guide

**What It Does:**
```bash
/refine "die UI ist zu hässlich"

Workflow:
1. IDENTIFY: What was implemented last?
2. UNDERSTAND: Parse user feedback
3. REFINE: Sub-agents improve code/UI/functionality
4. TEST: E2E tests verify changes
5. DEBUG: Fix issues automatically
6. DOCUMENT: Update FEATURES.md
```

#### 3. **FEATURES.md Auto-Update System** ✅
Automatically updates project documentation after orchestrations

**Files:**
- `FEATURES_UPDATE_PROMPT.md` - Update template
- `INTEGRATION_GUIDE.md` - Integration options
- `README_FEATURES_UPDATE.md` - Usage guide
- `.claude/commands/update-features.md` - Manual command

**What It Does:**
```bash
# After /orchestrate completes:
# Automatically updates FEATURES.md with:
# - Completed items checkmarked
# - New subsections added
# - Status table updated
# - Priorities adjusted
```

---

## Documentation Map

```
.claude/orchestrator/
│
├─ README.md (you are here)
├─ README_FEATURES_UPDATE.md
├─ FEATURES_UPDATE_PROMPT.md
├─ INTEGRATION_GUIDE.md
├─ IMPLEMENTATION_PLAN.md
│
├─ refine-engine.md
├─ REFINE_README.md
├─ refine-test-framework.md
│
├─ .refine-context/ (runtime data)
│  ├─ context.json
│  ├─ problems.json
│  ├─ improvements.json
│  ├─ changes.json
│  └─ test-results.json
│
└─ [Implementation files - TBD]
   ├─ core/
   │  ├─ context-manager.ts
   │  ├─ feedback-parser.ts
   │  ├─ git-utils.ts
   │  ├─ sub-agents.ts
   │  ├─ categorizer.ts
   │  ├─ change-tracker.ts
   │  └─ status-tracker.ts
   │
   ├─ testing/
   │  ├─ test-generator.ts
   │  ├─ test-executor.ts
   │  ├─ visual-tester.ts
   │  └─ test-templates/
   │
   ├─ debug/
   │  ├─ failure-analyzer.ts
   │  └─ debug-reporter.ts
   │
   └─ reporting/
      ├─ report-generator.ts
      └─ report-templates/
```

---

## Quick Start

### For Users

#### Use the Orchestrator
```bash
# Build a new feature with all agents
/orchestrate "Add Tasks System"

# Refine an existing implementation
/refine "the UI is too verbose"

# Update documentation
/update-features "Document Management"
```

#### Monitor Progress
- Orchestrator shows real-time phase progress
- Each agent reports when complete
- Tests show pass/fail status
- Final report shows all changes

### For Developers

#### Review the Design

1. **Start here:**
   - Read: `REFINE_README.md` (high-level overview)
   - Read: `refine-engine.md` (architecture details)

2. **Understand the workflow:**
   - Study: `refine-test-framework.md` (how testing works)
   - Review: `FEATURES_UPDATE_PROMPT.md` (documentation patterns)

3. **Plan implementation:**
   - Read: `IMPLEMENTATION_PLAN.md` (step-by-step)
   - Check: Timeline and dependencies

#### Start Implementation

**Phase 1 (Foundation - 2-3 hours):**
1. Create `core/context-manager.ts`
2. Create `core/feedback-parser.ts`
3. Create `core/git-utils.ts`

**Checkpoint:** Can identify features and parse feedback

**Phase 2 (Sub-Agents - 2-3 hours):**
1. Create `core/sub-agents.ts`
2. Create `core/categorizer.ts`
3. Create `core/change-tracker.ts`

**Checkpoint:** Can route to correct agents

**See IMPLEMENTATION_PLAN.md for full details**

---

## Features

### Orchestrator
- ✅ Multi-agent coordination
- ✅ Parallel execution where possible
- ✅ Error handling and recovery
- ✅ Result aggregation
- ✅ User-friendly reporting

### Refine System
- 📋 Intelligent refinement (READY TO BUILD)
- 📋 Automated testing with Playwright
- 📋 Visual regression detection
- 📋 Performance metrics
- 📋 Auto-debugging

### Documentation System
- ✅ Auto-update FEATURES.md
- ✅ Pattern templates
- ✅ Integration guides
- ✅ Manual override option

---

## Usage Examples

### Build a New Feature
```bash
$ /orchestrate "Add Talent Pools feature"

1️⃣  Backend Agent
   ├─ Creates database schema
   ├─ Implements RLS policies
   └─ Creates hooks

2️⃣  Frontend Agent
   ├─ Creates components
   ├─ Integrates with UI
   └─ Adds to pages

3️⃣  UI Review Agent (parallel with Frontend)
   ├─ Analyzes patterns
   └─ Suggests fixes

4️⃣  Test Agent
   ├─ Creates E2E tests
   ├─ Verifies functionality
   └─ Tests UI

5️⃣  Update FEATURES.md (automatic)
   └─ Marks complete

Result: New feature deployed ✅
```

### Improve an Existing Feature
```bash
$ /refine "Document upload UI too verbose"

1️⃣  Identify what was implemented
   → Document Management System

2️⃣  Understand the feedback
   → UI needs to be more compact

3️⃣  Refine (UI Review + Frontend Agent)
   ├─ Analyze current design
   ├─ Redesign components
   └─ Apply changes

4️⃣  Test with Playwright
   ├─ Visual tests verify compact layout
   ├─ Functional tests verify upload works
   └─ Regression tests verify nothing broke

5️⃣  Debug (if any tests fail)
   ├─ Capture screenshots
   ├─ Analyze errors
   └─ Re-run fixes

6️⃣  Document improvements
   └─ Update FEATURES.md with refinements

Result: Improved feature deployed ✅
```

---

## Technical Details

### Sub-Agents
- **Backend Agent**: Database, migrations, RLS, hooks
- **Frontend Agent**: React components, pages, state management
- **UI Review Agent**: Pattern validation, visual checks
- **Test Agent**: E2E tests with Playwright
- **Debug Agent**: Browser debugging, error analysis

### Communication
- **File System**: Shared JSON files for context
- **Git**: Commits for tracking changes
- **Console**: Structured output for parsing

### Testing
- **E2E Tests**: Real user workflows with Playwright
- **Visual Tests**: Screenshot comparison
- **Performance Tests**: Metrics tracking
- **Regression Tests**: Verify nothing broke

---

## Implementation Status

### ✅ Completed
- Orchestrator core logic
- Sub-agent framework
- FEATURES.md auto-update system
- Documentation and guides

### 📋 Ready to Build
- Refine system (7 implementation phases)
- Testing framework
- Debug integration

### 🔮 Future (v2.0+)
- Interactive refinement preview
- Performance profiling
- Accessibility audit
- Security scanning

---

## Documentation Reference

| File | Purpose | For |
|------|---------|-----|
| `refine-engine.md` | Architecture & design | Developers |
| `REFINE_README.md` | User guide | Everyone |
| `refine-test-framework.md` | Testing strategy | QA/Devs |
| `IMPLEMENTATION_PLAN.md` | Build guide | Developers |
| `FEATURES_UPDATE_PROMPT.md` | Documentation format | Automation |

---

## How to Contribute

### Adding a New System
1. Design the system (write README)
2. Create integration points
3. Document usage
4. Add to this README
5. Implement gradually

### Improving Existing System
1. Identify what needs improvement
2. Update documentation
3. Implement changes
4. Test thoroughly
5. Report results

---

## Troubleshooting

### Orchestrator Issue?
→ Check `.claude/agents/` for agent implementations
→ Review `shared/orchestrator.ts` for logic

### Refine System Issue?
→ Read `REFINE_README.md` troubleshooting section
→ Check `IMPLEMENTATION_PLAN.md` for setup

### Test Failures?
→ Review `refine-test-framework.md`
→ Check Playwright test output
→ Use Debug Agent for detailed analysis

### Documentation Problem?
→ Check `FEATURES_UPDATE_PROMPT.md` for format
→ Use `update-features` command to fix
→ Review recent commits for patterns

---

## Support

For questions or issues:
1. Read relevant documentation file
2. Check examples in this README
3. Review code comments
4. Ask team for help

---

**System Status:** 🟢 Design Complete, Implementation Ready
**Last Updated:** 2025-12-20
**Version:** 1.0 (Design Phase)
**Maintainer:** Claude Code Team

---

## Quick Links

- [Refine System Guide](./REFINE_README.md)
- [Refine Architecture](./refine-engine.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Testing Framework](./refine-test-framework.md)
- [Features Update Guide](./README_FEATURES_UPDATE.md)
- [Agents Documentation](./../agents/README.md)
