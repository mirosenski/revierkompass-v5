# 🚔 Excel-Import Anleitung für RevierKompass Baden-Württemberg

## 📋 Übersicht
Diese Anleitung erklärt, wie KI Codex automatisch eine Excel-Datei mit Polizeistationen Baden-Württembergs verarbeitet und in das RevierKompass-Projekt integriert.

## 📁 Projektstruktur (AKTUELLER STAND)
```
revierkompass-v5/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma ✅ (bereits vorhanden mit PoliceStation Modell)
│   ├── src/
│   │   ├── routes/
│   │   │   └── stations.ts ✅ (bereits vorhanden mit Basis-API)
│   │   └── scripts/
│   │       └── seed.ts ✅ (bereits vorhanden)
│   └── package.json ✅ (bereits vorhanden)
└── public/data/
    └── polizeiReviere.xlsx ✅ (bereits vorhanden)
```

## 🎯 Aufgabe für KI Codex

### Schritt 1: Excel-Datei ist bereits vorhanden
**Excel-Datei bereits gespeichert unter:**
- `public/data/polizeiReviere.xlsx` ✅

### Schritt 2: Excel-Struktur verstehen
Die Excel-Datei sollte folgende Spalten enthalten:
```csv
name,address,city,zipCode,coordinates,type,phone,email,openingHours,isEmergency,zustaendigkeitsbereich,notfall
```

**Beispiel-Zeilen:**
```csv
"Polizeirevier Stuttgart-Mitte","Theodor-Heuss-Straße 11, 70174 Stuttgart","Stuttgart","70174","48.7769268,9.1744498","Revier","0711 8990-3100","","Mo-Fr 8:00-16:00","false","Stuttgart Mitte","false"
"Polizeipräsidium Stuttgart","Hahnemannstraße 1, 70191 Stuttgart","Stuttgart","70191","48.81046,9.18686","Präsidium","0711 8990-0","","24/7","true","Stuttgart","true"
```

### Schritt 3: Automatische Verarbeitung
KI Codex soll folgende Schritte automatisch ausführen:

#### 3.1 Dependencies installieren
```bash
cd backend
npm install xlsx tsx
```

#### 3.2 Import-Script erstellen
**Erstelle:** `backend/src/scripts/import-stations-from-excel.ts`

#### 3.3 Package.json erweitern
**Füge hinzu:**
```json
{
  "scripts": {
    "import-stations:dev": "tsx src/scripts/import-stations-from-excel.ts",
    "import-stations": "tsx src/scripts/import-stations-from-excel.ts"
  }
}
```

#### 3.4 Datenbank-Migration
```bash
cd backend
npx prisma migrate dev --name add-polizeistationen-fields
```

#### 3.5 Excel-Import ausführen
```bash
cd backend
npm run import-stations:dev
```

#### 3.6 Hierarchische API implementieren
**WICHTIG: Erweitere die bestehende `src/routes/stations.ts`**

```typescript
// Neue API-Endpunkte für hierarchische Struktur
GET /api/stations/hierarchical - Präsidien mit zugehörigen Revieren
GET /api/stations/praesidien - Nur Präsidien
GET /api/stations/praesidien/:id/revier - Reviere eines Präsidiums
POST /api/stations/selection - Auswahl-Logik für Präsidien/Reviere
```

**Erwartete Struktur:**
```json
{
  "praesidien": [
    {
      "id": "uuid",
      "name": "Polizeipräsidium Stuttgart",
      "city": "Stuttgart",
      "isEmergency": true,
      "isSelected": false,
      "revier": [
        {
          "id": "uuid",
          "name": "Polizeirevier Stuttgart-Mitte",
          "city": "Stuttgart",
          "isEmergency": false,
          "isSelected": false,
          "parentPraesidium": "uuid"
        },
        {
          "id": "uuid", 
          "name": "Polizeirevier Stuttgart-Bad Cannstatt",
          "city": "Stuttgart",
          "isEmergency": false,
          "isSelected": false,
          "parentPraesidium": "uuid"
        }
      ]
    }
  ]
}
```

**AUSWAHL-LOGIK implementieren:**
```typescript
// POST /api/stations/selection
{
  "action": "select_praesidium", // oder "select_revier", "deselect_revier"
  "praesidiumId": "uuid",        // für Präsidium-Auswahl
  "revierId": "uuid",           // für einzelne Reviere
  "selectAllReviere": true      // automatisch alle Reviere auswählen
}

// Antwort mit aktualisierter Auswahl
{
  "selectedPraesidien": ["uuid1", "uuid2"],
  "selectedReviere": ["uuid3", "uuid4"],
  "autoSelectedReviere": ["uuid5", "uuid6"], // durch Präsidium-Auswahl
  "manuallySelectedReviere": ["uuid7"]       // einzeln ausgewählt
}
```

**AUSWAHL-VERHALTEN:**
- **Präsidium auswählen** → alle zugehörigen Reviere automatisch ausgewählt
- **Einzelnes Revier abwählen** → bleibt abgewählt, auch wenn Präsidium ausgewählt ist
- **Präsidium abwählen** → alle zugehörigen Reviere automatisch abgewählt
- **Einzelnes Revier auswählen** → unabhängig von Präsidium-Auswahl

## 🔧 Verfügbare Scripts (AKTUELLER STAND)

### Standard-Seed (bereits vorhanden)
```bash
cd backend
npm run db:seed
```

### NEU: Excel-Bulk-Import (zu erstellen)
```bash
cd backend
npm run import-stations:dev
```

### Vollständiger Reset + Import
```bash
cd backend
npm run db:setup
```

## 📊 Erwartete Ergebnisse

### Nach erfolgreichem Import:
- **14 Polizeipräsidien** (alle mit `isEmergency: true`, `notfall: true`)
- **495+ Polizeireviere** (aus Excel-Datei)
- **Automatische Email-Generierung** (z.B. `stuttgart-mitte.prev@polizei.bwl.de`)
- **PLZ-Extraktion** aus Adressen
- **Koordinaten-Validierung** für Baden-Württemberg
- **HIERARCHISCHE STRUKTUR**: Präsidien -> zugehörige Reviere

### API-Endpunkte verfügbar:
- `GET /api/stations` - Alle Stationen mit Filtern ✅ (bereits vorhanden)
- `GET /api/stations/hierarchical` - **NEU: Hierarchische Struktur**
- `GET /api/stations/praesidien` - **NEU: Nur Präsidien**
- `GET /api/stations/praesidien/:id/revier` - **NEU: Reviere eines Präsidiums**
- `POST /api/stations/selection` - **NEU: Auswahl-Logik für Präsidien/Reviere**
- `GET /api/stations/selected` - **NEU: Aktuell ausgewählte Stationen**
- `GET /api/stations/emergency` - Nur Notfall-Stationen ✅ (bereits vorhanden)
- `GET /api/stations/stats` - Statistiken ✅ (bereits vorhanden)

## 🚨 Wichtige Hinweise für KI Codex

### 1. Excel-Format prüfen
- Erste Zeile = Spaltenüberschriften
- Koordinaten im Format: `48.7769268,9.1744498`
- PLZ im Format: `70174` (Baden-Württemberg: 70000-98999)

### 2. Fehlerbehandlung
- Ungültige Koordinaten werden mit `{lat: 0, lng: 0}` ersetzt
- Fehlende PLZ werden aus Adresse extrahiert
- Fehlende Emails werden automatisch generiert

### 3. Performance
- Batch-Import in 50er-Gruppen
- Fortschritts-Tracking
- Detaillierte Logs

### 4. Validierung
- PLZ muss aus Baden-Württemberg sein
- Koordinaten müssen in BW-Grenzen liegen
- Pflichtfelder: name, address, city

### 5. Hierarchische Struktur
- **Sortierung nach Präsidien** (nicht nach Städten)
- **Präsidien zuerst**, dann zugehörige Reviere
- **Mapping**: Stadt -> Präsidium (z.B. Stuttgart -> Polizeipräsidium Stuttgart)
- **Gruppierung**: Alle Reviere einer Stadt unter dem entsprechenden Präsidium
- **AUSWAHL-LOGIK**: Präsidium wählen = alle Reviere automatisch ausgewählt
- Aber: Einzelne Reviere können separat ausgewählt/abgewählt werden

## 📝 Beispiel-Prompt für KI Codex

```
Ich habe eine Excel-Datei mit Polizeistationen Baden-Württembergs unter 
public/data/polizeiReviere.xlsx gespeichert. 

Das RevierKompass-Projekt ist bereits vorbereitet mit:
- Prisma-Schema mit PoliceStation Modell (bereits vorhanden)
- Basis API-Routen unter src/routes/stations.ts (bereits vorhanden)
- Seed-Script unter src/scripts/seed.ts (bereits vorhanden)

Bitte führe folgende Schritte aus:
1. Installiere die notwendigen Dependencies (xlsx, tsx)
2. Erstelle Import-Script: backend/src/scripts/import-stations-from-excel.ts
3. Erweitere Package.json mit Import-Scripts
4. Führe die Datenbank-Migration aus
5. Importiere alle Stationen aus der Excel-Datei
6. Implementiere hierarchische API-Struktur nach Präsidien
7. Zeige mir die Import-Statistiken

WICHTIG: Implementiere hierarchische Struktur:
- Sortiere nach Polizeipräsidien (nicht nach Städten)
- Jedes Präsidium soll seine zugehörigen Reviere unter sich haben
- Beispiel: Polizeipräsidium Stuttgart -> darunter alle Stuttgarter Reviere
- AUSWAHL-LOGIK: Präsidium wählen = alle Reviere automatisch ausgewählt
- Aber: Einzelne Reviere können separat ausgewählt/abgewählt werden

Verwende: npm run import-stations:dev
```

## ✅ Erfolgs-Indikatoren

Nach erfolgreichem Import soll KI Codex folgende Ausgabe zeigen:
```
🚔 Importing Polizeistationen from Excel...
📁 File: ../public/data/polizeiReviere.xlsx
📊 Found 509 stations in Excel file
✅ Processed 509 stations
⚠️ Skipped 0 stations
🗑️ Clearing existing stations...
✅ Existing stations cleared
📦 Importing in batches of 50...
📦 Processing batch 1/11...
✅ Batch 1: 50 stations imported
...
🎉 Import completed!
📊 Statistics:
   Total imported: 509
   Errors: 0
   Skipped: 0

📈 By type:
   Präsidium: 14
   Revier: 495

🏗️ Hierarchical API implemented:
   GET /api/stations/hierarchical ✅
   GET /api/stations/praesidien ✅
   GET /api/stations/praesidien/:id/revier ✅
   POST /api/stations/selection ✅
   GET /api/stations/selected ✅

🎯 Selection Logic implemented:
   Präsidium auswählen = alle Reviere automatisch ✅
   Einzelne Reviere separat wählbar ✅
   Abwahl-Logik funktioniert ✅
```

## 🔍 Troubleshooting

### Häufige Probleme:
1. **Excel-Datei nicht gefunden**: Pfad prüfen, Datei ist in `public/data/` ✅
2. **Dependencies fehlen**: `npm install xlsx tsx` ausführen
3. **Datenbank-Fehler**: `npx prisma migrate dev` ausführen
4. **Koordinaten-Fehler**: Format prüfen (48.7769268,9.1744498)
5. **Hierarchische Struktur funktioniert nicht**: Mapping zwischen Stadt und Präsidium prüfen
6. **Auswahl-Logik funktioniert nicht**: Präsidium-Revier-Beziehungen prüfen

### Logs prüfen:
- Import-Logs zeigen Details zu jedem Batch
- Fehler werden detailliert protokolliert
- Statistiken am Ende zeigen Erfolg/Fehler
- Hierarchische API-Endpunkte testen
- Auswahl-Logik mit Präsidien und Revieren testen

## 🎯 Ziel
Nach Ausführung soll das RevierKompass-System alle 509+ Polizeistationen Baden-Württembergs in hierarchischer Struktur enthalten:
- **14 Polizeipräsidien** als Hauptkategorien
- **495+ Polizeireviere** gruppiert unter den entsprechenden Präsidien
- **API-Endpunkte** für hierarchische Navigation
- **AUSWAHL-LOGIK**: Präsidium wählen = alle Reviere automatisch, aber einzeln wählbar 