# Automated FEATURES.md Update Prompt
## Template for Post-Orchestration Feature Documentation

**Purpose:** Automatically update FEATURES.md when `/orchestrate` completes successfully.

**When to Use:** After orchestrator finishes with "✅ Orchestration Complete" status.

---

## Step 1: Extract Implementation Summary

From orchestrator output, identify and collect:

### Backend Agent Output
```
Files Created:
- Migrations (SQL files in supabase/migrations/)
- Hooks (React files in src/hooks/)
- Utilities (Helper files in src/lib/)
- Types (TypeScript type definitions)

Deliverables:
- Database tables created: [list table names]
- RLS policies: [count]
- Hooks created: [list hook names with descriptions]
- Storage configuration: [bucket names, policies]
```

### Frontend Agent Output
```
Files Created:
- Components (React files in src/components/)
- Pages (React files in src/pages/)
- Modifications (Updated existing files)

Deliverables:
- Components: [list component names with brief descriptions]
- Page updates: [which pages modified and what was added]
- UI patterns used: [which patterns from ui-patterns.md]
- Integrations: [which existing features were connected]
```

### Test Agent Output
```
Files Created:
- E2E tests (files in tests/)
- Test fixtures (files in tests/fixtures/)

Deliverables:
- Test count: [total number of test cases]
- Test scenarios: [list of what was tested]
- Fixtures created: [test data files]
```

---

## Step 2: Determine Phase & Feature Category

Map implementation to FEATURES.md structure:

| Feature Type | Phase | Subsection | Examples |
|---|---|---|---|
| Core CRUD (Jobs, Candidates, Apps) | Phase 1 | 1.4 | Job/Candidate/Application CRUD |
| Authentication | Phase 1 | 1.1 | Login, Signup, Auth flows |
| Settings/Admin | Phase 1 | 1.3 | Departments, Locations, Source Platforms |
| Detail Pages | Phase 2 | 2.1-2.5 | Candidate/Job/Application detail views |
| Skills, Documents, etc. | Phase 2 | 2.4-2.5 | Skills management, Document management |
| Tasks System | Phase 3 | 3.1-3.2 | Task CRUD, Task integration |
| Feedback Portal | Phase 3.5 | - | Feedback, Feature Requests |
| Interviews & Calendar | Phase 4 | 4.1-4.2 | Interview CRUD, Calendar views, Feedback |
| Dashboard & Reports | Phase 5 | 5.1-5.2 | Dashboard widgets, Reports |
| Email, Talent Pools, etc. | Phase 6 | 6.1-6.4 | Email integration, Talent pools, Matching, RBAC |

---

## Step 3: Update FEATURES.md with Implementation Details

### Format: Feature Checklist Items

Each completed feature gets formatted as:
```markdown
- [x] **Feature Name** (Detailed description of what was implemented)
  - [x] Sub-component/aspect 1
  - [x] Sub-component/aspect 2
  - [x] Sub-component/aspect 3
```

### Template for Adding New Subsections

When creating a new subsection (e.g., "2.5 Document Management"):

```markdown
### X.Y Feature Name ✅
- [x] **Database/Backend**
  - [x] Table/Schema: [description]
  - [x] RLS Policies: [description]
  - [x] Triggers/Functions: [description]

- [x] **React Hooks**
  - [x] Hook 1: [description]
  - [x] Hook 2: [description]

- [x] **Frontend Components**
  - [x] Component 1: [description]
  - [x] Component 2: [description]

- [x] **Integration**
  - [x] Which page/component uses this
  - [x] File utilities/helpers created

- [x] **Features**
  - [x] Feature 1
  - [x] Feature 2

- [x] **E2E Tests** (X test scenarios)
  - [x] Test scenario 1
  - [x] Test scenario 2
```

---

## Step 4: Update Phase Status Table

Modify the status table around line 360:

```markdown
| Phase | Status | Komponenten |
|-------|--------|-------------|
| Phase X | ✅ | ...existing text... + New Feature |
```

Mark as ✅ if phase is 100% complete, 🟡 if partial, ⏳ if pending.

---

## Step 5: Update "Nächste Schritte" Priority List

**Remove** completed features from priority list (if they were there).

**Example:** If "Document Management" was item #2 in priorities, remove it and renumber items 3-6 to become 2-5.

---

## Step 6: Remove from Phase 6 (If Applicable)

If completed feature was listed in Phase 6 "Erweiterte Features", remove or move it.

**Example:**
```markdown
// BEFORE:
### 6.2 Document Management
- [ ] CV Upload & Storage
- [ ] CV Viewer
- [ ] Multiple CV Versionen

### 6.3 Talent Pools
- [ ] Talent Pool CRUD

// AFTER:
### 6.2 Talent Pools
- [ ] Talent Pool CRUD
```

Also renumber subsequent sections if needed.

---

## Step 7: Commit Changes

```bash
git add FEATURES.md
git commit -m "docs: Update FEATURES.md - Mark [Feature Name] as complete ✅

- Added Phase X.Y: [Feature Name] subsection
- Marked all related checklist items as complete
- Removed from priority list / Phase 6 backlog
- Updated status table

🤖 Generated with Orchestrator Auto-Update"
```

---

## Implementation Reference

### Example: Document Management (Phase 2.2)

**Orchestrator Output Summary:**
- Backend: 2 migrations (document_uploads table + storage bucket)
- Backend: 3 hooks (useDocuments, useDocumentUpload, useDocumentDelete)
- Frontend: 3 components (DocumentUpload, DocumentList, DocumentViewer)
- Frontend: 1 integration (CandidateDetail.tsx updated)
- Tests: 10 E2E test scenarios

**FEATURES.md Update:**
1. Mark line 68: `- [x] CV/Dokument Upload`
2. Add section "### 2.5 Document Management System ✅" with comprehensive details
3. Update Phase 2 row: + Document Management
4. Remove from "Nächste Schritte" priority #2
5. Remove/renumber Phase 6.2 section
6. Commit with message "docs: Update FEATURES.md - Document Management Phase 2.5 ✅"

---

## Usage Instructions for Future Orchestrations

**For User:**
When `/orchestrate` completes, instead of manually updating FEATURES.md:

```bash
# The orchestrator should automatically trigger this prompt:
# The system will:
# 1. Parse orchestrator output
# 2. Extract implementation summary
# 3. Update FEATURES.md automatically
# 4. Create git commit
# 5. Show summary
```

**For Integration:**
This prompt should be called as final step in orchestrator pipeline:

```
Orchestrator Pipeline:
  Backend Agent → Frontend Agent → Test Agent → [✨ AUTO-UPDATE FEATURES.md ✨] → Report
```

---

## Validation Checklist

Before committing FEATURES.md updates, verify:

- [ ] All completed features marked with `[x]`
- [ ] Phase status table updated
- [ ] Feature removed from "Nächste Schritte" if was there
- [ ] Feature removed from Phase 6 if was listed there
- [ ] Section numbers renumbered correctly (no gaps)
- [ ] No duplicate entries in FEATURES.md
- [ ] Formatting consistent with rest of file
- [ ] Git commit message follows pattern
- [ ] File has no syntax errors (valid Markdown)

---

## Integration with `.claude/commands`

This prompt could be converted into a reusable slash command:

```bash
/update-features "Document Management System"
/update-features "Tasks CRUD" --phase 3
/update-features "Email Integration" --phase 6
```

Or integrated into orchestrator as automatic final step.

---

## Notes

- Always use German for descriptions to match FEATURES.md style
- Use ✅ emoji for complete subsections
- Group related items (Database, Hooks, Components, Integration, Features, Tests)
- Preserve historical items - never delete completed entries
- Keep phase structure intact (no reorganization unless phase is fully empty)
