# Git Branch Management - Dokumentation

## 📋 Übersicht

Diese Dokumentation beschreibt die Skripte und Tools zur Verwaltung von Git-Branches, insbesondere das automatische Holen aller Remote-Branches als lokale Branches.

## 🚀 Verfügbare Skripte

### 1. Python-Skript (`fetch_branches.py`)
**Empfohlen für die meisten Anwendungsfälle**

```bash
python3 fetch_branches.py
```

### 2. Bash-Skript (`fetch_all_branches.sh`)
**Alternative für Unix/Linux-Systeme**

```bash
chmod +x fetch_all_branches.sh
./fetch_all_branches.sh
```

## 📁 Dateien

| Datei | Beschreibung | Sprache |
|-------|-------------|---------|
| `fetch_branches.py` | Hauptskript (Python) | Python 3 |
| `fetch_all_branches.sh` | Alternative (Bash) | Bash |
| `GIT_BRANCH_DOKUMENTATION.md` | Diese Dokumentation | Markdown |

## 🔧 Installation und Setup

### Voraussetzungen

1. **Git Repository**: Sie müssen sich in einem Git-Repository befinden
2. **Python 3**: Für das Python-Skript (meist bereits installiert)
3. **Bash**: Für das Bash-Skript (auf Unix/Linux-Systemen verfügbar)

### Setup

```bash
# Navigieren Sie zum Projektverzeichnis
cd /path/to/your/git/repository

# Machen Sie das Bash-Skript ausführbar (optional)
chmod +x fetch_all_branches.sh
```

## 📖 Verwendung

### Option 1: Python-Skript (Empfohlen)

```bash
python3 fetch_branches.py
```

**Vorteile:**
- ✅ Plattformunabhängig
- ✅ Detaillierte Fehlerbehandlung
- ✅ Übersichtliche Ausgabe mit Emojis
- ✅ Automatische Prüfung auf bereits existierende Branches

### Option 2: Bash-Skript

```bash
./fetch_all_branches.sh
```

**Vorteile:**
- ✅ Keine Python-Abhängigkeit
- ✅ Schnelle Ausführung
- ✅ Native Shell-Integration

### Option 3: Manuelle Befehle

Falls die Skripte nicht funktionieren, können Sie die Befehle manuell ausführen:

```bash
# 1. Alle Remote-Branches holen
git fetch --all

# 2. Remote-Branches anzeigen
git branch -r

# 3. Lokale Branches erstellen (Beispiele)
git checkout -b branch-name origin/branch-name

# 4. Zurück zum main Branch
git checkout main
```

## 🚀 Produktive Git-Branch-Arbeit

Nach dem Ausführen der Skripte haben Sie alle Remote-Branches lokal verfügbar und können produktiv zwischen ihnen wechseln.

### **Verfügbare Branches:**
Nach dem Skript-Ausführen haben Sie typischerweise **14 lokale Branches** verfügbar:

1. `main` (aktueller Branch)
2. `codex/add-jest-for-testing-in-backend`
3. `codex/create-backend/env.example-with-placeholders`
4. `codex/create-init-scripts-directory-or-update-docker-compose`
5. `codex/erstelle-api-service-layer-mit-mock-daten`
6. `codex/erstelle-typescript-interfaces-für-polizeistationen`
7. `codex/erstelle-typescript-interfaces-für-stationen`
8. `codex/implement-station-import-and-routes`
9. `codex/implementiere-admin-api-service`
10. `codex/migriere-selectedstations-state-zu-usewizardstore`
11. `codex/refactor-shared-offline-map-logic`
12. `codex/remove-redundant-pnpm-install-calls`
13. `codex/state-management-und-ladeanzeige-hinzufügen`
14. `codex/zentrales-state-management-mit-zustand-einrichten`

### **Produktive Git-Befehle:**

```bash
# 1. Aktuellen Branch anzeigen
git branch

# 2. Zu einem spezifischen Feature-Branch wechseln
git checkout codex/zentrales-state-management-mit-zustand-einrichten

# 3. Status des aktuellen Branches anzeigen
git status

# 4. Änderungen im aktuellen Branch anzeigen
git diff

# 5. Commit-Historie des aktuellen Branches anzeigen
git log --oneline -10

# 6. Zurück zum main Branch
git checkout main

# 7. Alle Branches mit Status anzeigen
git branch -v

# 8. Remote-Status aller Branches anzeigen
git branch -vv
```

### **Workflow-Beispiele:**

#### **Beispiel 1: Feature-Branch erkunden**
```bash
# Zu einem Feature-Branch wechseln
git checkout codex/erstelle-api-service-layer-mit-mock-daten

# Änderungen anzeigen
git status
git diff

# Commit-Historie anzeigen
git log --oneline -5

# Zurück zum main
git checkout main
```

#### **Beispiel 2: Branch vergleichen**
```bash
# Unterschiede zwischen main und Feature-Branch anzeigen
git diff main..codex/zentrales-state-management-mit-zustand-einrichten

# Oder umgekehrt
git diff codex/zentrales-state-management-mit-zustand-einrichten..main
```

#### **Beispiel 3: Branch-Status überprüfen**
```bash
# Alle Branches mit letztem Commit anzeigen
git branch -v

# Branches mit Remote-Tracking anzeigen
git branch -vv

# Nur Remote-Branches anzeigen
git branch -r
```

### **Nützliche Git-Aliase (optional):**

```bash
# Git-Aliase konfigurieren
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --decorate"

# Dann können Sie kürzere Befehle verwenden:
git co codex/zentrales-state-management-mit-zustand-einrichten
git st
git lg -10
```

### **Best Practices für produktive Arbeit:**

1. **Immer Status prüfen**: `git status` vor dem Branch-Wechsel
2. **Änderungen committen**: Uncommitted Änderungen können Branch-Wechsel verhindern
3. **Main aktuell halten**: Regelmäßig `git pull origin main` auf main
4. **Branches synchronisieren**: `git fetch --all` für neue Remote-Branches
5. **Feature-Branches isoliert halten**: Arbeiten Sie nur an einem Feature pro Branch

## 📊 Funktionsweise

### Python-Skript (`fetch_branches.py`)

1. **Repository-Prüfung**: Überprüft, ob Sie sich in einem Git-Repository befinden
2. **Remote-Fetch**: Holt alle Remote-Referenzen mit `git fetch --all`
3. **Branch-Analyse**: Listet alle verfügbaren Remote-Branches auf
4. **Duplikat-Prüfung**: Prüft, welche Branches bereits lokal existieren
5. **Branch-Erstellung**: Erstellt nur die fehlenden lokalen Branches
6. **Status-Report**: Zeigt eine Zusammenfassung der Aktionen

### Bash-Skript (`fetch_all_branches.sh`)

1. **Remote-Fetch**: Holt alle Remote-Referenzen
2. **Branch-Auflistung**: Zeigt verfügbare Remote-Branches
3. **Branch-Erstellung**: Erstellt lokale Branches für alle Remote-Branches
4. **Existenz-Prüfung**: Überspringt bereits existierende Branches
5. **Main-Branch-Rückkehr**: Wechselt zurück zum main Branch

## 📈 Ausgabe-Beispiel

```
🚀 Starte das Holen aller Remote-Branches...

🔄 Hole alle Remote-Referenzen...

📋 Verfügbare Remote-Branches:
  📌 codex/add-jest-for-testing-in-backend
  📌 codex/create-backend/env.example-with-placeholders
  📌 codex/erstelle-api-service-layer-mit-mock-daten
  📌 main

🔧 Erstelle lokale Branches für 4 Remote-Branches...

  ⚠️  Branch 'codex/add-jest-for-testing-in-backend' existiert bereits lokal
  ✅ Branch 'codex/erstelle-api-service-layer-mit-mock-daten' erfolgreich erstellt
  ⚠️  Branch 'main' existiert bereits lokal

🔄 Wechsle zurück zum main Branch...

📊 Übersicht aller lokalen Branches:
  codex/add-jest-for-testing-in-backend
  codex/erstelle-api-service-layer-mit-mock-daten
  * main

✅ Fertig!
   📈 1 neue Branches erstellt
   📋 3 Branches bereits vorhanden
   📊 Insgesamt 4 lokale Branches
```

## 🛠️ Fehlerbehebung

### Häufige Probleme

#### 1. "Kein Git-Repository gefunden"
```bash
# Stellen Sie sicher, dass Sie sich im richtigen Verzeichnis befinden
pwd
ls -la | grep .git
```

#### 2. "Permission denied"
```bash
# Machen Sie das Bash-Skript ausführbar
chmod +x fetch_all_branches.sh
```

#### 3. "Python nicht gefunden"
```bash
# Installieren Sie Python 3
sudo apt-get install python3  # Ubuntu/Debian
brew install python3          # macOS
```

#### 4. "Git-Befehle funktionieren nicht"
```bash
# Überprüfen Sie die Git-Installation
git --version
which git
```

#### 5. "Branch-Wechsel funktioniert nicht"
```bash
# Prüfen Sie uncommitted Änderungen
git status

# Änderungen stashen (temporär speichern)
git stash

# Dann Branch wechseln
git checkout branch-name

# Änderungen wiederherstellen (optional)
git stash pop
```

### Debug-Modus

Fügen Sie `-v` oder `--verbose` zu den Git-Befehlen hinzu:

```bash
git fetch --all -v
git branch -r -v
```

## 🔄 Nach der Ausführung

### Branch-Verwaltung

```bash
# Alle lokalen Branches anzeigen
git branch

# Zu einem spezifischen Branch wechseln
git checkout branch-name

# Branch-Status überprüfen
git status

# Remote-Branches anzeigen
git branch -r
```

### Branch-Operationen

```bash
# Neuen Branch erstellen
git checkout -b new-branch-name

# Branch löschen (lokal)
git branch -d branch-name

# Branch löschen (Remote)
git push origin --delete branch-name
```

## 📝 Best Practices

### 1. Regelmäßige Synchronisation
```bash
# Täglich oder vor wichtigen Arbeiten
python3 fetch_branches.py
```

### 2. Branch-Naming Convention
- Verwenden Sie aussagekräftige Namen
- Nutzen Sie Präfixe für Kategorien (z.B. `feature/`, `bugfix/`, `hotfix/`)
- Vermeiden Sie Leerzeichen in Branch-Namen

### 3. Branch-Cleanup
```bash
# Regelmäßig alte Branches bereinigen
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

### 4. Produktive Workflows
```bash
# Feature-Branch erstellen und wechseln
git checkout -b feature/neue-funktion

# Änderungen committen
git add .
git commit -m "Feat: Neue Funktion hinzugefügt"

# Feature-Branch pushen
git push origin feature/neue-funktion

# Zurück zum main und aktualisieren
git checkout main
git pull origin main
```

## 🔧 Konfiguration

### Git-Konfiguration

```bash
# Benutzer-Informationen setzen
git config --global user.name "Ihr Name"
git config --global user.email "ihre.email@example.com"

# Standard-Branch setzen
git config --global init.defaultBranch main
```

### Skript-Konfiguration

Die Skripte sind so konzipiert, dass sie ohne zusätzliche Konfiguration funktionieren. Sie können jedoch angepasst werden:

- **Python-Skript**: Bearbeiten Sie die Variablen in `fetch_branches.py`
- **Bash-Skript**: Modifizieren Sie die Befehle in `fetch_all_branches.sh`

## 📚 Zusätzliche Ressourcen

### Git-Dokumentation
- [Git Official Documentation](https://git-scm.com/doc)
- [Git Branching](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell)
- [Git Fetch](https://git-scm.com/docs/git-fetch)

### Python-Dokumentation
- [Python subprocess](https://docs.python.org/3/library/subprocess.html)
- [Python os module](https://docs.python.org/3/library/os.html)

### Bash-Dokumentation
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [Shell Scripting Tutorial](https://www.shellscript.sh/)

## 🤝 Beitragen

### Verbesserungsvorschläge

1. **Issues melden**: Erstellen Sie ein Issue für Bugs oder Feature-Requests
2. **Code beitragen**: Forken Sie das Repository und erstellen Sie Pull Requests
3. **Dokumentation verbessern**: Helfen Sie bei der Verbesserung dieser Dokumentation

### Entwicklung

```bash
# Repository klonen
git clone <repository-url>
cd <repository-name>

# Branch für Feature erstellen
git checkout -b feature/improvement

# Änderungen committen
git add .
git commit -m "Verbesserung: Beschreibung der Änderung"

# Push zum Remote
git push origin feature/improvement
```

## 📄 Lizenz

Diese Skripte sind Open Source und stehen unter der MIT-Lizenz zur Verfügung.

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie diese Dokumentation
2. Schauen Sie in die Fehlerbehebung-Sektion
3. Erstellen Sie ein Issue im Repository
4. Kontaktieren Sie das Entwicklungsteam

---

**Letzte Aktualisierung**: $(date)
**Version**: 1.0.0
**Autor**: Development Team 