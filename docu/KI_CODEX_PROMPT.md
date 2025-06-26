# 🚀 Direkter Prompt für KI Codex

## 📋 Kopiere diesen Text und sende ihn an KI Codex:

```
Ich habe eine Excel-Datei mit Polizeistationen Baden-Württembergs unter 
public/data/polizeiReviere.xlsx gespeichert. 

Das RevierKompass-Projekt ist bereits vorbereitet mit:
- Prisma-Schema mit PoliceStation Modell (bereits vorhanden)
- Basis API-Routen unter src/routes/stations.ts (bereits vorhanden)
- Seed-Script unter src/scripts/seed.ts (bereits vorhanden)

Bitte führe folgende Schritte aus:
1. Installiere die notwendigen Dependencies: npm install xlsx tsx
2. Erstelle ein Import-Script: backend/src/scripts/import-stations-from-excel.ts
3. Füge Package.json Scripts hinzu: "import-stations:dev": "tsx src/scripts/import-stations-from-excel.ts"
4. Führe die Datenbank-Migration aus: npx prisma migrate dev --name add-polizeistationen-fields
5. Importiere alle Stationen aus der Excel-Datei: npm run import-stations:dev
6. Implementiere hierarchische API-Endpunkte in src/routes/stations.ts
7. Zeige mir die Import-Statistiken

WICHTIG: Implementiere eine hierarchische Struktur in der API:
- Sortiere nach Polizeipräsidien (nicht nach Städten)
- Jedes Präsidium soll seine zugehörigen Reviere unter sich haben
- Beispiel: Polizeipräsidium Stuttgart -> darunter alle Stuttgarter Reviere
- Polizeipräsidium Mannheim -> darunter alle Mannheimer Reviere
- etc.

AUSWAHL-LOGIK implementieren:
- Wenn ein Präsidium ausgewählt wird → automatisch alle zugehörigen Reviere mit auswählen
- Aber: Man kann auch einzelne Reviere separat auswählen/abwählen
- Beispiel: Präsidium Stuttgart auswählen = alle Stuttgarter Reviere automatisch ausgewählt
- Aber: Man kann einzelne Reviere wie "Stuttgart-Mitte" separat abwählen

Die Excel-Datei enthält ~509 Polizeistationen (14 Präsidien + 495 Reviere) mit Spalten:
name, address, city, zipCode, coordinates, type, phone, email, openingHours, isEmergency, zustaendigkeitsbereich, notfall

Erwartete Ausgabe:
- 14 Polizeipräsidien (isEmergency: true, notfall: true)
- 495+ Polizeireviere (isEmergency: false, notfall: false)
- Automatische Email-Generierung
- PLZ-Extraktion aus Adressen
- Koordinaten-Validierung für Baden-Württemberg
- HIERARCHISCHE STRUKTUR: Präsidien -> Reviere
- AUSWAHL-LOGIK: Präsidium = alle Reviere, aber auch einzeln wählbar

Erstelle die fehlenden Scripts und erweitere die bestehenden API-Routen.
```

## 🎯 Was KI Codex tun soll:

1. **Dependencies installieren** - `npm install xlsx tsx`
2. **Import-Script erstellen** - `backend/src/scripts/import-stations-from-excel.ts`
3. **Package.json erweitern** - Import-Scripts hinzufügen
4. **Datenbank migrieren** - `npx prisma migrate dev`
5. **Excel importieren** - `npm run import-stations:dev`
6. **Hierarchische API implementieren** - Präsidien -> Reviere Struktur
7. **Auswahl-Logik implementieren** - Präsidium = alle Reviere, aber einzeln wählbar
8. **Ergebnis zeigen** - Import-Statistiken anzeigen

## ✅ Erfolg erwartet:
- 509+ Stationen in der Datenbank
- API-Endpunkte funktionsfähig
- Alle BW-Polizeistationen verfügbar
- **HIERARCHISCHE STRUKTUR**: Präsidien mit zugehörigen Revieren
- **AUSWAHL-LOGIK**: Präsidium wählen = alle Reviere, aber einzeln wählbar

## 📁 Excel-Datei bereits vorhanden unter:
`public/data/polizeiReviere.xlsx` 