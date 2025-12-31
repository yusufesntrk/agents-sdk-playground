# Config Push

Pusht alle neuen/geänderten Skills, Agents und Commands zum zentralen claude-config Repo.

## Ablauf

1. **Hole neueste Version um Konflikte zu vermeiden:**
```bash
cd ~/claude-config && git pull
```

2. **Skills/Agents/Commands kopieren:**
```bash
cp -r .claude/skills/* ~/claude-config/skills/ 2>/dev/null
cp -r .claude/agents/* ~/claude-config/agents/ 2>/dev/null
cp -r .claude/commands/* ~/claude-config/commands/ 2>/dev/null
cp .claude/ui-patterns.md ~/claude-config/ 2>/dev/null
```

3. **Zeige was sich geändert hat:**
```bash
cd ~/claude-config && git status --short
```

4. **Committe und pushe:**
```bash
cd ~/claude-config && git add . && git commit -m "Update from PROJEKTNAME" && git push
```

**WICHTIG:**
- Das Ziel-Repo ist IMMER `~/claude-config/` (GitHub: yusufesntrk/claude-config)
- NICHT das aktuelle Projekt-Repo!
- **CLAUDE.md wird NICHT synchronisiert** - jedes Projekt hat seine eigene
- Skills/Agents/Commands werden überschrieben (gleichnamige Dateien = neuere Version gewinnt)
