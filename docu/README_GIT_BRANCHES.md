# Git Branch Management Tools

## 🚀 Schnellstart

**Alle Remote-Branches zu lokalen Branches holen:**

```bash
# Python-Skript (empfohlen)
python3 fetch_branches.py

# Oder Bash-Skript
chmod +x fetch_all_branches.sh
./fetch_all_branches.sh
```

## 📁 Dateien

- `fetch_branches.py` - Python-Skript (Hauptskript)
- `fetch_all_branches.sh` - Bash-Skript (Alternative)
- `GIT_BRANCH_DOKUMENTATION.md` - Vollständige Dokumentation
- `README_GIT_BRANCHES.md` - Diese Datei

## ✨ Features

- 🔄 Automatisches Holen aller Remote-Branches
- 📋 Übersichtliche Ausgabe mit Emojis
- ⚠️ Intelligente Duplikat-Erkennung
- ✅ Detaillierte Statusberichte
- 🔧 Plattformunabhängig (Python) oder Native (Bash)

## 📖 Verwendung

1. **In ein Git-Repository wechseln**
2. **Skript ausführen**: `python3 fetch_branches.py`
3. **Fertig!** Alle Remote-Branches sind jetzt lokal verfügbar

## 📊 Beispiel-Ausgabe

```
🚀 Starte das Holen aller Remote-Branches...

📋 Verfügbare Remote-Branches:
  📌 codex/add-jest-for-testing-in-backend
  📌 codex/erstelle-api-service-layer-mit-mock-daten
  📌 main

🔧 Erstelle lokale Branches für 3 Remote-Branches...

  ⚠️  Branch 'codex/add-jest-for-testing-in-backend' existiert bereits lokal
  ✅ Branch 'codex/erstelle-api-service-layer-mit-mock-daten' erfolgreich erstellt
  ⚠️  Branch 'main' existiert bereits lokal

✅ Fertig!
   📈 1 neue Branches erstellt
   📋 2 Branches bereits vorhanden
```

## 📚 Weitere Informationen

Für detaillierte Informationen, Fehlerbehebung und Best Practices siehe:
**[GIT_BRANCH_DOKUMENTATION.md](GIT_BRANCH_DOKUMENTATION.md)**

---

**Version**: 1.0.0 | **Autor**: Development Team 