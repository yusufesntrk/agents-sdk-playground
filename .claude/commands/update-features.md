# Update FEATURES.md After Orchestration

You are tasked with updating FEATURES.md to reflect a completed orchestration task.

## Input Requirements

The user will provide:
1. **Feature Name** - Name of the feature that was implemented
2. **Phase** - Which phase it belongs to (Phase 2.5, Phase 3.1, etc.)
3. **Orchestrator Output** - Summary of what was built (optional - I can extract from recent output)

## Process

1. Read FEATURES.md to understand current structure
2. Locate the appropriate phase/subsection
3. Update the feature checklist items to [x] (completed)
4. Add comprehensive subsection if it doesn't exist
5. Update the phase status table
6. Remove from "Nächste Schritte" priority list if listed
7. Remove from Phase 6 backlog if it was there
8. Commit changes to git

## Implementation Details

For the feature being marked complete, include in FEATURES.md:

### If Creating New Subsection:
- Database/Backend section (tables, RLS, triggers)
- React Hooks section (hook names and descriptions)
- Frontend Components section (component names and descriptions)
- Integration section (where this integrates into existing features)
- Features section (key capabilities)
- E2E Tests section (test count and scenarios)

### If Updating Existing Section:
- Mark individual checklist items as [x]
- Add any missing sub-items
- Update description if needed
- Add test count if not present

## Output

After completing updates:
1. Show summary of changes made
2. Verify all checkmarks updated correctly
3. Create git commit with standardized message format
4. Confirm FEATURES.md is valid Markdown

## Commit Message Template

```
docs: Update FEATURES.md - [Feature Name] Phase X.Y ✅

- Marked [Feature Name] as complete
- Added/Updated subsection X.Y with comprehensive details
- Updated phase status table
- Removed from priority list / Phase 6 backlog
- [Any other relevant changes]

🤖 Generated with /update-features Command
```

## Example Usage

```bash
/update-features "Document Management System"
# User provides details or you extract from orchestrator output

/update-features "Tasks System" --phase 3.1
# Finds Phase 3.1 and marks complete

/update-features "Interview Scheduling" --extract-last-run
# Automatically extracts from last orchestration
```

## Validation

Before committing, ensure:
- [ ] All related items marked [x]
- [ ] No formatting issues
- [ ] Phase status table updated
- [ ] "Nächste Schritte" correctly updated
- [ ] Section numbers not duplicated
- [ ] Commit message follows template
