---
description: Autonome App-Entwicklung - Plant alles upfront, dann 24h+ ohne Unterbrechung
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, TodoWrite, AskUserQuestion, mcp__playwright__*, mcp__supabase__*
argument-hint: [app-description]
model: claude-opus-4-5-20251101
---

# 🍳 COOK MODE: $ARGUMENTS

**Ziel:** Komplette App bauen ohne Unterbrechung. User kann 24h+ weggehen.

Lies den vollständigen Skill:
@.claude/skills/cooking/SKILL.md

## Ablauf

1. **Discovery** - Alle Fragen JETZT klären
2. **Planning** - Feature-Liste + Reihenfolge
3. **Cooking** - Features als Background-Tasks (kein User-Input!)
4. **Serving** - Final Report

## Starten

Analysiere "$ARGUMENTS" und starte mit Phase 1: Discovery.
