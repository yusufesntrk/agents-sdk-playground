# Config Pull

Pullt die neuesten Skills, Agents und Commands vom zentralen claude-config Repo ins aktuelle Projekt.

## Ablauf

1. **Hole neueste Version:**
```bash
cd ~/claude-config && git pull
```

2. **Skills/Agents/Commands ins Projekt kopieren:**
```bash
cp -r ~/claude-config/skills/* .claude/skills/ 2>/dev/null
cp -r ~/claude-config/agents/* .claude/agents/ 2>/dev/null
cp -r ~/claude-config/commands/* .claude/commands/ 2>/dev/null
cp ~/claude-config/ui-patterns.md .claude/ 2>/dev/null
```

3. **Zeige was kopiert wurde:**
```bash
ls -la .claude/skills/ .claude/agents/ .claude/commands/
```

**WICHTIG:**
- Das Quell-Repo ist IMMER `~/claude-config/` (GitHub: yusufesntrk/claude-config)
- **CLAUDE.md wird NICHT synchronisiert** - jedes Projekt hat seine eigene
- Existierende Dateien werden überschrieben
