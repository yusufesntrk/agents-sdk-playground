# Automated FEATURES.md Update System

This system automatically updates FEATURES.md when the orchestrator completes a task, ensuring documentation stays in sync with implementation.

## Overview

After `/orchestrate "Feature Name"` completes successfully, the system:

1. ✅ Parses what was built (components, hooks, tests, migrations)
2. ✅ Determines which phase/section to update (Phase 2.5, Phase 3.1, etc.)
3. ✅ Updates FEATURES.md with checkmarks and descriptions
4. ✅ Updates status tables and priority lists
5. ✅ Creates a git commit automatically
6. ✅ Reports changes to the user

## System Components

### 1. FEATURES_UPDATE_PROMPT.md
**Location:** `.claude/orchestrator/FEATURES_UPDATE_PROMPT.md`

A comprehensive template that defines:
- How to extract implementation summary from orchestrator output
- How to classify features into phases
- Exact format for FEATURES.md updates
- Template for new subsections
- Validation checklist

**Usage:** Reference guide for update logic and format requirements.

### 2. update-features Command
**Location:** `.claude/commands/update-features.md`

A slash command for manual or user-triggered FEATURES.md updates:

```bash
/update-features "Document Management System"
/update-features "Tasks CRUD" --phase 3.1
/update-features "Email Integration" --auto-commit
```

**Usage:**
- As fallback if auto-update fails
- For manual updates anytime
- For users to explicitly trigger updates

### 3. INTEGRATION_GUIDE.md
**Location:** `.claude/orchestrator/INTEGRATION_GUIDE.md`

Detailed implementation guide for integrating auto-updates into orchestrator:

- Architecture options (A, B, C)
- Code patterns and examples
- Testing procedures
- Rollback instructions
- Future enhancements

**Usage:** Developer reference for implementing the auto-update feature.

## Current Status

### ✅ Complete (Documentation Phase)
- FEATURES.md updated with Document Management Phase 2.5
- All three template/reference files created
- Integration guide documented

### ⏳ Pending (Implementation Phase)
- Integration into orchestrator pipeline
- Auto-update function development
- Testing of integration

### 🎯 Future (Enhancement Phase)
- Smart phase detection
- Changelog generation
- Team notifications
- Status board integration

## How It Works

### Manual Update (Current)

User explicitly updates FEATURES.md:

```bash
# After orchestration completes
/update-features "Document Management System"

# System will:
# 1. Ask for phase/category confirmation
# 2. Extract from recent orchestrator output
# 3. Generate updates
# 4. Apply to FEATURES.md
# 5. Create git commit
# 6. Show summary
```

### Automatic Update (Future)

When integrated into orchestrator:

```bash
/orchestrate "Document Management System"

# Orchestrator will:
# 1. Run Backend, Frontend, Test agents
# 2. [NEW] Auto-update FEATURES.md
# 3. [NEW] Create git commit
# 4. Show complete report including FEATURES.md changes
```

## File Structure

```
.claude/orchestrator/
├── README_FEATURES_UPDATE.md          ← You are here
├── FEATURES_UPDATE_PROMPT.md          ← Update template & reference
├── INTEGRATION_GUIDE.md               ← Implementation guide
├── features-updater.ts                ← [TODO] Implementation
└── post-completion.ts                 ← [TODO] Hook integration

.claude/commands/
└── update-features.md                 ← Manual slash command

FEATURES.md                            ← The target file being updated
```

## FEATURES.md Update Format

When a feature is completed, it appears in FEATURES.md like:

```markdown
### 2.5 Document Management System ✅
- [x] **Database Schema**
  - [x] document_uploads Tabelle
  - [x] ENUM document_type
  - [x] RLS Policies

- [x] **React Hooks**
  - [x] useDocuments()
  - [x] useDocumentUpload()
  - [x] useDocumentDelete()

- [x] **Frontend Components**
  - [x] DocumentUpload.tsx
  - [x] DocumentList.tsx
  - [x] DocumentViewer.tsx

- [x] **E2E Tests** (10 test scenarios)
  - [x] Upload via file picker
  - [x] Upload via drag & drop
  - [x] Delete with confirmation
  - ... (7 more tests)
```

## Update Categories

### Phase Assignments

```
Phase 1 → Authentication, Core CRUDs (Jobs, Candidates, Applications)
Phase 2 → Detail pages, Skills, Documents, Integration
Phase 3 → Tasks System
Phase 3.5 → Feedback Portal
Phase 4 → Interviews & Scheduling
Phase 5 → Dashboard & Reports
Phase 6 → Email, Talent Pools, Matching, Advanced RBAC
Phase 7 → Agent Infrastructure
```

### Section Templates

**New Feature (X.Y):**
```
- [x] **Database/Backend**
- [x] **React Hooks**
- [x] **Frontend Components**
- [x] **Integration**
- [x] **Features**
- [x] **E2E Tests** (N test scenarios)
```

**Existing Feature Update:**
```
- [x] Individual checklist items (if not already checked)
- [x] Add to existing subsection
```

## Quick Start

### To Use Currently (Manual)

1. After orchestration completes, save the output
2. Run: `/update-features "Feature Name"`
3. Confirm the phase/category
4. Review changes
5. Confirm commit

### To Implement (Developer)

1. Read INTEGRATION_GUIDE.md
2. Choose Option A, B, or C
3. Implement features-updater.ts
4. Add hook to orchestrator
5. Test thoroughly
6. Enable by default

## Example: Document Management

**Orchestration Input:**
```
/orchestrate "Document Management System"
```

**Orchestrator Output:**
```
✅ Orchestration Complete

Backend Agent:
- Migrations: document_uploads table + storage bucket
- Hooks: useDocuments, useDocumentUpload, useDocumentDelete
- Utilities: document-utils.ts

Frontend Agent:
- Components: DocumentUpload, DocumentList, DocumentViewer
- Integration: CandidateDetail.tsx updated

Test Agent:
- 10 E2E tests created
- All tests passing ✅
```

**Auto-Update Result:**
```
✅ FEATURES.md Updated

Changes:
- Added: Phase 2.5 - Document Management System (52 lines)
- Updated: 3 existing items marked complete
- Updated: Status table (Phase 2)
- Removed: From priority list and Phase 6 backlog

Commit: 8c3a5f2 docs: Update FEATURES.md - Document Management ✅
```

## Validation

Before updating FEATURES.md, the system verifies:

- [ ] All implemented features are captured
- [ ] Phase/category assignment is correct
- [ ] Checkmark syntax is correct (- [x])
- [ ] No duplicate entries
- [ ] Section numbers are unique
- [ ] Formatting matches rest of file
- [ ] Valid Markdown syntax
- [ ] Git commit message follows template

## Integration Checklist

To fully implement auto-updates:

- [ ] features-updater.ts created and tested
- [ ] Post-completion hook added to orchestrator
- [ ] Auto-update logic matches FEATURES_UPDATE_PROMPT.md
- [ ] Git commit creation working
- [ ] Error handling implemented
- [ ] Fallback to /update-features command ready
- [ ] Documentation updated
- [ ] All phase assignments validated
- [ ] Test suite for updater created

## Troubleshooting

### Auto-update failed?
1. Check git status (must be clean)
2. Run: `/update-features "Feature Name"` manually
3. Review FEATURES_UPDATE_PROMPT.md for format issues
4. Check INTEGRATION_GUIDE.md for implementation issues

### Wrong phase assigned?
1. Run: `/update-features "Feature Name" --phase X.Y`
2. Manually correct in FEATURES.md
3. Update phase classification logic

### Need to undo?
1. `git revert HEAD` to undo auto-commit
2. Manually edit FEATURES.md if needed
3. Report issue for future improvements

## Contributing

To improve this system:

1. Update FEATURES_UPDATE_PROMPT.md with new patterns
2. Add new phase classifications to INTEGRATION_GUIDE.md
3. Test edge cases and report results
4. Suggest enhancements in integration options
5. Document lessons learned

## Related Files

- `/FEATURES.md` - Main feature documentation
- `/CLAUDE.md` - Project instructions
- `.claude/agents/` - Orchestrator agent implementations
- `.claude/commands/` - Slash commands directory

## Future Ideas

1. **Smart Detection** - Automatically detect phase from changed files
2. **Diff Summary** - Show human-readable summary of changes
3. **Team Notifications** - Alert team when feature is documented
4. **Public Changelog** - Auto-generate changelog entries
5. **Version Tagging** - Tag releases with completed features
6. **Metrics Dashboard** - Track feature completion rate over time
7. **Timeline View** - Show when features were implemented
8. **Dependency Tracking** - Link related features across phases

---

**Last Updated:** 2025-12-20
**Status:** ✅ Documentation Complete, ⏳ Implementation Pending
**Created by:** Auto-Implementation System
