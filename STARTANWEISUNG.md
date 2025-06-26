# 🚀 RevierKompass - Startanweisung

## Schnellstart

Die Anwendung startet **immer** mit der Adressen-Startseite!

### Option 1: Automatisches Start-Script (Empfohlen)
```bash
./start-dev.sh
```

### Option 2: Manueller Start
```bash
npm run dev
```

## Was passiert beim Start?

1. ✅ **Adressen-Startseite wird automatisch geladen**
2. ✅ **Wizard Schritt 1 (Adresse eingeben) ist aktiv**
3. ✅ **Alle vorherigen Sitzungen werden zurückgesetzt**
4. ✅ **Anwendung ist bereit für neue Routenberechnungen**

## Browser-Zugriff

Nach dem Start öffne deinen Browser und gehe zu:
- `http://localhost:5173` (oder höherem Port, falls 5173 belegt ist)

## Features der Startseite

- 📍 **Adresse eingeben**: Startadresse für Routenberechnung
- 🚀 **Demo-Adressen**: Schnelle Tests mit vordefinierten Adressen
- 🎯 **Automatische Weiterleitung**: Nach Adresseingabe zu Schritt 2
- 🌙 **Dark Mode**: Automatische Theme-Erkennung

## Troubleshooting

### Anwendung startet nicht mit Adressen-Startseite?
1. Browser-Cache leeren (Strg+F5)
2. Anwendung neu starten: `./start-dev.sh`
3. Prüfe die Browser-Konsole auf Fehler

### Port bereits belegt?
- Vite wählt automatisch den nächsten freien Port
- Schaue in der Terminal-Ausgabe nach der korrekten URL

## Support

Bei Problemen:
1. Prüfe die Terminal-Ausgabe
2. Schaue in die Browser-Konsole (F12)
3. Starte die Anwendung neu mit `./start-dev.sh` 