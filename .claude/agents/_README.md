# Claude Code Agents for ShortSelect ATS

**Multi-Agent System with Orchestration for automated feature development**

---

## 🎯 Overview

5 specialized agents working together to build complete features end-to-end:

```
Input: "Add Tasks System"
  ↓
Backend Agent    → Creates DB schema, migrations, hooks
  ↓
Frontend Agent   → Builds React components using hooks
  ↓
UI Review Agent  → Validates pattern compliance
  ↓
Test Agent       → Generates E2E tests, runs test suite
  ↓
Output: Complete, tested, production-ready feature
```

---

## 🤖 The Agents System

### Architecture

```
Feedback Portal
       ↓
Feature Request Agent (Orchestrator)
       ↓
Koordiniert: Backend → Frontend → Test → UI Review
```

---

## 📋 Standard Agents (5)

### 1. Backend Agent
**Responsibility:** Database design, migrations, RLS policies, custom hooks

**Input:**
```typescript
{
  featureName: "Tasks",
  tables: [
    {
      name: "tasks",
      columns: [
        { name: "id", type: "uuid" },
        { name: "title", type: "text" },
        // ...
      ]
    }
  ],
  hooks: [
    { name: "Tasks", type: "query", tableName: "tasks" }
  ]
}
```

**Output:**
- SQL migrations
- RLS policies
- React Query hooks in `src/hooks/`
- TypeScript types

### 2. Frontend Agent
**Responsibility:** React components, pages, forms

**Input:**
```typescript
{
  featureName: "Tasks",
  components: [
    {
      name: "TaskCard",
      type: "card",
      description: "Task display card"
    }
  ],
  pages: [
    {
      name: "Tasks",
      path: "/tasks",
      components: ["TaskList", "TaskForm"]
    }
  ]
}
```

**Output:**
- React components in `src/components/`
- Pages in `src/pages/`
- Proper TypeScript types
- UI pattern compliant code

### 3. Test Agent
**Responsibility:** E2E tests, unit tests, test execution

**Input:**
```typescript
{
  featureName: "Tasks",
  pages: ["Tasks"],
  testScenarios: [
    {
      name: "Create new task",
      type: "happy-path",
      steps: [/* ... */]
    }
  ]
}
```

**Output:**
- Playwright E2E tests
- Test reports
- Coverage metrics

### 4. Debug Agent
**Responsibility:** Browser debugging, issue investigation

**Input:**
```typescript
{
  page: "/tasks",
  issue: "Spinner doesn't disappear when loading completes"
}
```

**Output:**
- Screenshots
- Console logs
- Network analysis
- Performance metrics
- Root cause findings

### 5. UI Review Agent
**Responsibility:** UI pattern validation, auto-fixes

**Input:**

---

## 🎯 Specialized Agents (2)

### 6. Feature Orchestrator (Multi-Feature)
**Responsibility:** Implementiert EIN Feature durch die komplette Agent-Chain

**Wird genutzt wenn:** Der Haupt-Orchestrator mehrere Features parallel bearbeiten soll.

**Workflow:**
```
Feature Orchestrator
  ↓
Backend Agent → Frontend Agent → UI Review → Test Agent → QA Agent
  ↓
Gibt NUR Summary zurück (Context bleibt isoliert)
```

**Vorteil:**
- Jedes Feature hat eigenen Context
- Features können parallel laufen
- Haupt-Orchestrator bleibt schlank

**Output:**
```markdown
## Feature: Pipeline Velocity Widget
### Status: ✅ SUCCESS
### Erstellte Dateien:
- src/hooks/usePipelineVelocity.ts
- src/components/dashboard/PipelineVelocityWidget.tsx
### Tests: 2 passed, 0 failed
```

### 7. Feature Request Agent (Registry + Conflict Detection)
**Responsibility:** Registriert Feature Requests, prüft auf Konflikte, pflegt Registry

**Registry:** `FEATURE_REQUESTS.md` - Zentrale Ablage aller Requests

**Kernfunktionen:**
1. **Neue Requests registrieren** → In FEATURE_REQUESTS.md eintragen
2. **Konflikt-Prüfung** → Automatisch bei jedem neuen Request
3. **Konflikt-Dokumentation** → In Konflikt-Übersicht eintragen
4. **User warnen** → Bei erkannten Konflikten

**Konflikt-Typen:**
- **DUPLIKAT:** Inhaltlich gleicher Request
- **GEGENSÄTZLICH:** Requests widersprechen sich (A will X, B will nicht-X)
- **RESSOURCE:** Beide betreffen gleiche Komponente unterschiedlich
- **ABHÄNGIGKEIT:** Request B braucht abgelehnten Request A

**Automatischer Trigger:**
Bei neuem `feedback_items` mit `type = 'feature_request'`:
1. Request in FEATURE_REQUESTS.md registrieren
2. Konflikt-Check gegen alle existierenden Requests
3. Bei Konflikt: Warnung + Dokumentation

**Commands:**
- `/register-request [Titel]` - Neuen Request registrieren
- `/check-conflicts` - Alle offenen Requests auf Konflikte prüfen

---

## 🚀 Quick Start

### Manual Agent Execution

```typescript
import { BackendAgent } from './.claude/agents/backend-agent';
import { FrontendAgent } from './.claude/agents/frontend-agent';

// Backend first
const backendAgent = new BackendAgent();
const backendResult = await backendAgent.execute({
  featureName: "Tasks",
  tables: [/* ... */],
  hooks: [/* ... */]
});

// Frontend uses backend output
const frontendAgent = new FrontendAgent();
const frontendResult = await frontendAgent.execute({
  featureName: "Tasks",
  components: [/* ... */],
  context: {
    backendDependencies: ["useTasks", "useTaskMutation"]
  }
});
```

### Feature Request (from Feedback Portal)

When a Feature Request in the Feedback Portal is approved, it automatically:

```bash
/feature-request approve-feedback-123
```

This triggers:
1. ✅ Feature Request Agent receives plan
2. ✅ Parses plan into Backend/Frontend/Test/UI tasks
3. ✅ Orchestrates all 5 agents with proper sequencing
4. ✅ Returns success/partial/failed status
5. ✅ Generates consolidated report + next steps

### Manual Orchestration

```bash
/orchestrate "Add Tasks System to ShortSelect"
```

This automatically:
1. ✅ Runs Backend Agent
2. ✅ Runs Frontend Agent (using Backend output)
3. ✅ Runs UI Review Agent (parallel with Frontend)
4. ✅ Runs Test Agent
5. ✅ Generates consolidated report

---

## 📦 Project Structure

```
.claude/agents/
├── shared/                       # Shared Infrastructure
│   ├── types.ts                 # Central type definitions
│   ├── base-agent.ts            # BaseAgent class
│   ├── tool-registry.ts         # Tool management
│   ├── communication.ts         # Inter-agent communication
│   ├── logger.ts                # Logging utilities
│   ├── orchestrator.ts          # Agent orchestration
│   └── index.ts                 # Exports
│
├── backend-agent/
│   ├── index.ts                 # Backend Agent implementation
│   ├── tools.ts                 # Supabase tools
│   └── SKILL.md                 # Documentation
│
├── frontend-agent/
│   ├── index.ts                 # Frontend Agent implementation
│   ├── tools.ts                 # UI tools (shadcn, patterns)
│   └── SKILL.md                 # Documentation
│
├── test-agent/
│   └── index.ts                 # Test Agent implementation
│
├── debug-agent/
│   └── index.ts                 # Debug Agent implementation
│
├── ui-review-agent/
│   └── index.ts                 # UI Review Agent implementation
│
├── feature-orchestrator/         # Multi-Feature Orchestrator
│   └── SKILL.md                 # Documentation
│
├── feature-request-agent/        # Specialized Orchestrator
│   ├── index.ts                 # Feature Request Agent
│   └── SKILL.md                 # Documentation
│
├── index.ts                      # Main exports
└── README.md                     # This file
```

---

## 🔄 Agent Execution Flow

```
┌─────────────────────────────────────────────┐
│  Orchestrator                               │
│  ├─ Build Execution Plan                    │
│  ├─ Check Dependencies                      │
│  └─ Execute Agents in Order                 │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼────┐          ┌────▼────┐
    │ Backend│ (seq)    │ Frontend│ (parallel)
    │ Agent  │────────→ │ Agent   │
    └────────┘          └────┬────┘
                             │
                        ┌────▼────────┐
                        │ UI Review   │ (parallel)
                        │ Agent       │
                        └─────────────┘
                             │
                        ┌────▼────┐
                        │ Test    │ (seq)
                        │ Agent   │
                        └─────────┘
                             │
                        ┌────▼────────────┐
                        │ Consolidated   │
                        │ Report + Status │
                        └────────────────┘
```

---

## 🛠️ Tool Distribution

| Tool | Backend | Frontend | Test | Debug | UI Review |
|------|---------|----------|------|-------|-----------|
| Glob | ❌ | ✅ | ✅ | ❌ | ✅ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ✅ | ✅ | ❌ | ✅ |
| Grep | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bash | ✅ | ✅ | ✅ | ✅ | ✅ |
| Supabase | ✅ | ❌ | ❌ | ❌ | ❌ |
| Playwright | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 📋 Key Features

### 1. Type Safety
- Full TypeScript support
- Zod schemas for validation
- Shared type definitions

### 2. Inter-Agent Communication
- Cached output sharing
- Dependency tracking
- Serialized context passing

### 3. Error Handling
- Graceful degradation
- Detailed error messages
- Retry logic

### 4. Logging & Monitoring
- Multi-logger support
- Performance metrics
- Execution tracking

### 5. Extensibility
- Plugin-style tool registration
- Custom agent templates
- Configuration-driven behavior

---

## 🎯 Use Cases

### Feature Development
```bash
/orchestrate "Add Candidate Matching System"
# Backend creates algorithm tables
# Frontend builds matching UI
# Tests ensure correctness
```

### Bug Investigation
```bash
/debug /candidates "Avatar upload failing"
# Captures screenshots
# Analyzes network requests
# Identifies root cause
```

### Code Quality
```bash
/ui-review src/components/
# Validates against patterns
# Suggests improvements
# Auto-fixes if enabled
```

---

## 📊 Performance

- **Backend Agent:** ~2-3 minutes (DB design + hooks)
- **Frontend Agent:** ~2-3 minutes (components + pages)
- **UI Review Agent:** ~1 minute (validation)
- **Test Agent:** ~2-3 minutes (test creation + execution)
- **Feature Request Agent:** ~1 minute (planning + orchestration)
- **Total (Orchestrator):** ~6-8 minutes (with parallelization)
- **Total (Feature Request):** ~8-10 minutes (planning + full pipeline)

---

## 🔐 Security

- ✅ RLS policies enforced by Backend Agent
- ✅ Tenant isolation automatic
- ✅ No sensitive data in migrations
- ✅ Type-safe all operations
- ✅ Audit logging available

---

## 📚 Documentation

- **PLAN.md** - Full architecture & design
- **FEATURES.md** - Implementation status
- **CLAUDE.md** - Project instructions
- `backend-agent/SKILL.md` - Backend details
- `frontend-agent/SKILL.md` - Frontend details

---

## 🚀 Next Steps

1. ✅ Infrastructure complete
2. ⏳ Hook into Claude Code slash commands
3. ⏳ Integration with existing features
4. ⏳ Performance optimization
5. ⏳ Community feedback & refinement

---

## 📝 Version

**Agent SDK Version:** 1.3.0
**Last Updated:** 2025-12-21
**Status:** Production Ready (5 Standard Agents + 2 Specialized)
**Agents:** 7 (5 Standard + 2 Specialized: Feature Orchestrator, Feature Request)

**Registry:** `FEATURE_REQUESTS.md` - Feature Request Ablage mit Konflikt-Erkennung

---

## 🤝 Contributing

To add new agents or tools:

1. Create new directory under `.claude/agents/`
2. Extend `BaseAgent` class
3. Define `execute()` method
4. Add to `AGENT_TOOL_MAP` in tool-registry.ts
5. Register in `agents/index.ts`

---

**Built with Claude Agent SDK for ShortSelect ATS** 🎉
