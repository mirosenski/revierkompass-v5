# Offline-Karten Integration für RevierKompass v2.0

## 🗺️ Übersicht
RevierKompass v2.0 verfügt nun über eine vollständige Offline-Karten-Integration, die speziell für den Einsatz in Baden-Württemberg optimiert ist. Diese Implementierung ermöglicht es Behörden und Einsatzkräften, auch ohne Internetverbindung vollständig funktionsfähige Karten und Routing-Services zu nutzen.

## 🎯 Ziele und Probleme gelöst

### Ursprüngliche Problematik:
- ❌ Abhängigkeit von externen Diensten (MapLibre, OSRM, Valhalla)
- ❌ CORS-Fehler bei Valhalla-API
- ❌ Schlechte Performance bei schwacher Internetverbindung
- ❌ Keine Regionalkarten oder Offline-Daten für Baden-Württemberg
- ❌ Fehlende echte Routing-Profile für verschiedene Einsatzarten
- ❌ Keine Unterstützung für alternative Routen
- ❌ Fehlende NBAN-Daten Integration

### Implementierte Lösungen:
- ✅ Lokaler Map-Server (TileServer GL) mit BW-spezifischem Kartenausschnitt
- ✅ Eigenes Valhalla/OSRM-Routing-Backend mit spezialisierten Profilen
- ✅ Offline-Routing mit Baden-Württemberg-Daten (PBF)
- ✅ Alternative Routen mit verschiedenen Einsatz-Profilen
- ✅ NBAN-Daten Integration (Sicherheitszonen, Schulwege)
- ✅ Reaktive Karte mit Offline-Fallback
- ✅ Online/Offline-Umschaltung mit Network API
- ✅ Service Worker für Kachel-Caching

## 🏗️ Architektur

### Backend-Komponenten

#### 1. Docker-Container-Setup (`docker-compose-tiles.yml`)
```yaml
services:
  - postgres: PostgreSQL mit PostGIS für Geodaten
  - tileserver: TileServer GL für Kachel-Dienst
  - osrm-backend: OSRM für Standard-Routing
  - valhalla: Valhalla für erweiterte Routing-Profile
  - nominatim: Offline-Geocoding für Baden-Württemberg
  - redis: Caching für bessere Performance
```

#### 2. Routing-Service (`OfflineMapService.ts`)
- **Multi-Backend-Support**: Valhalla (primär) mit OSRM-Fallback
- **Spezialisierte Profile**:
  - `emergency_fast`: Einsatzfahrten mit hoher Geschwindigkeit
  - `police_patrol`: Standard-Polizeistreifen
  - `pedestrian_safe`: Sichere Fußwege
  - `bicycle_patrol`: Fahrrad-Streifen
  - `public_transport`: ÖPNV-Routen

#### 3. API-Endpunkte (`/api/maps/*`)
```
GET  /capabilities      - Offline-Fähigkeiten prüfen
GET  /styles           - Verfügbare Kartenstile
GET  /tiles/:style/:z/:x/:y - Kachel-Proxy
POST /route            - Routen berechnen
POST /route/alternatives - Alternative Routen
GET  /profiles         - Routing-Profile
GET  /geocode          - Adress-Geocoding
GET  /nban             - NBAN-Zonen-Daten
```

### Frontend-Komponenten

#### 1. Offline-Map-Service (`offline-map-service.ts`)
- **Network-Monitoring**: Automatische Online/Offline-Erkennung
- **Intelligentes Caching**: Kacheln, Routen und Geocoding-Ergebnisse
- **Service Worker Integration**: Für erweiterte Offline-Funktionalität
- **Fallback-Strategien**: Bei Ausfall einzelner Services

#### 2. OfflineMapComponent (`OfflineMapComponent.tsx`)
- **Erweiterte Kartenkontrollen**: Stil-Auswahl, Offline-Panel
- **Kachel-Preloading**: Für definierten Bereich und Zoom-Level
- **NBAN-Layer-Integration**: Sicherheitszonen, Schulwege, Sperrgebiete
- **Route-Profile-Umschaltung**: Live-Neuberechnung mit verschiedenen Profilen

#### 3. Service Worker (`sw-maps.js`)
- **Cache-First für Kacheln**: Optimale Performance
- **Network-First für Routing**: Aktuelle Daten bevorzugt
- **Background-Sync**: Für offline-generierte Anfragen
- **Push-Notifications**: Für Offline-Paket-Updates

## 📍 NBAN-Daten Integration

### Unterstützte Zonen-Typen:
- **security_zone**: Sicherheitszonen (Bahnhöfe, Flughäfen)
- **school_zone**: Schulwege und -umgebungen
- **restricted_area**: Sperrgebiete und Zufahrtsbeschränkungen

### Darstellung:
- **Farbkodierung**: Rot (Sicherheit), Gelb (Schule), Lila (Beschränkt)
- **Transparenz**: 30% für Übersichtlichkeit
- **Interaktiv**: Klickbare Informationen

## 🚗 Routing-Profile im Detail

### Emergency Fast (Einsatzfahrt)
```javascript
costing_options: {
  auto: {
    maneuver_penalty: 5,      // Niedrige Abbiegestrafen
    use_highways: 1.0,        // Autobahnen bevorzugen
    use_tolls: 1.0,          // Mautstraßen nutzen
    top_speed: 150           // Einsatzfahrzeug-Geschwindigkeit
  }
}
```

### Police Patrol (Standard)
```javascript
costing_options: {
  auto: {
    maneuver_penalty: 10,     // Moderate Abbiegestrafen
    use_highways: 0.8,        // Autobahnen eingeschränkt
    use_tolls: 0.9,          // Maut meist meiden
    top_speed: 130           // Standard-Geschwindigkeit
  }
}
```

### Pedestrian Safe (Fußweg)
```javascript
costing_options: {
  pedestrian: {
    walking_speed: 4.0,       // 4 km/h Gehgeschwindigkeit
    sidewalk_factor: 1.5,     // Gehwege bevorzugen
    alley_factor: 0.1,        // Gassen meiden
    step_penalty: 30          // Treppen-Strafen
  }
}
```

## 🔧 Installation und Setup

### 1. Backend-Setup
```bash
cd backend/
docker-compose -f docker-compose-tiles.yml up -d
```

### 2. Daten-Download (Baden-Württemberg)
```bash
# OpenStreetMap-Daten für BW
wget https://download.geofabrik.de/europe/germany/baden-wuerttemberg-latest.osm.pbf
mv baden-wuerttemberg-latest.osm.pbf data/bw-data.osm.pbf

# MBTiles für Offline-Kacheln
# Diese würden normalerweise von OpenMapTiles oder MapTiler erstellt
```

### 3. Frontend-Integration
```typescript
import { offlineMapService } from '@/lib/services/offline-map-service';

// Service initialisieren
await offlineMapService.initialize();

// Offline-Fähigkeiten prüfen
const capabilities = await offlineMapService.checkCapabilities();

// Kacheln für Offline-Nutzung vorladen
await offlineMapService.preloadTiles(
  'bw-police',
  { north: 49.0, south: 47.5, east: 10.5, west: 7.5 },
  8,
  16
);
```

## 📱 Benutzeroberfläche

### Offline-Status-Anzeige
- **Grün (Online)**: Vollständige Funktionalität
- **Rot (Offline)**: Lokale Services aktiv
- **Gelb (Eingeschränkt)**: Teilweise verfügbar

### Karten-Steuerung
- **Stil-Auswahl**: BW Basic, BW Police, BW Satellite
- **Offline-Panel**: Kachel-Download, Cache-Verwaltung
- **Route-Profile**: Live-Umschaltung zwischen Einsatz-Modi

### NBAN-Visualisierung
- **Layered Approach**: Ein-/ausschaltbare Ebenen
- **Kontext-Information**: Popup mit Details zu Beschränkungen
- **Echtzeit-Updates**: Bei verfügbarer Internetverbindung

## 🔄 Offline-Workflow

### 1. Vorbereitung (Online)
1. Gewünschten Bereich in der Karte anzeigen
2. "Kacheln für Offline-Nutzung laden" auswählen
3. Warten auf Download-Abschluss (Progress-Anzeige)
4. NBAN-Daten werden automatisch mit gespeichert

### 2. Offline-Betrieb
1. Automatische Erkennung des Offline-Status
2. Umschaltung auf lokale Dienste
3. Cached Kacheln und Routing-Daten verwenden
4. Eingeschränkte Funktionalität mit Hinweisen

### 3. Rückkehr Online
1. Automatische Synchronisation
2. Update der NBAN-Daten
3. Neue Routing-Anfragen an aktuelle Services
4. Background-Update des Caches

## 🔒 Sicherheit und Datenschutz

### Lokale Datenhaltung
- **Keine externen Calls**: Alle Daten lokal verfügbar
- **Verschlüsselter Cache**: Sensitive Daten geschützt
- **Audit-Logging**: Vollständige Nachverfolgung

### Datenquellen
- **OpenStreetMap**: Open Data, keine Lizenzprobleme
- **NBAN-Integration**: Behördliche Datenquellen
- **Qualitätskontrolle**: Regelmäßige Updates und Validierung

## 📊 Performance-Optimierungen

### Caching-Strategien
- **Cache-First**: Kacheln (sofortige Anzeige)
- **Network-First**: Routing (aktuelle Daten)
- **Stale-While-Revalidate**: NBAN-Daten

### Daten-Minimierung
- **Bereichsbezogener Download**: Nur relevante Gebiete
- **Zoom-Level-Optimierung**: 8-16 für optimale Balance
- **Kompression**: Moderne Formate (WebP, Protobuf)

### Background-Synchronisation
- **Service Worker**: Für unterbrechungsfreie Updates
- **Queue-Management**: Offline-Anfragen sammeln
- **Priority-Handling**: Kritische Requests bevorzugen

## 🚀 Erweiterte Features

### Multi-Profile-Routing
```typescript
const alternatives = await offlineMapService.calculateAlternativeRoutes(
  start,
  end,
  ['emergency_fast', 'police_patrol', 'pedestrian_safe']
);
```

### Geofencing mit NBAN
- **Automatische Warnungen**: Bei Einfahrt in Sicherheitszonen
- **Route-Anpassung**: Umgehung von Sperrgebieten
- **Zeit-basierte Beschränkungen**: Schulzeiten berücksichtigen

### Offline-Paket-Generierung
- **Admin-Interface**: Für Paket-Erstellung
- **ZIP-Download**: Für komplette Offline-Installation
- **Update-Mechanismus**: Delta-Updates für Effizienz

## 🔧 Wartung und Updates

### Regelmäßige Tasks
1. **OSM-Daten-Update**: Monatlich neue BW-Daten
2. **NBAN-Synchronisation**: Wöchentlich behördliche Updates
3. **Cache-Bereinigung**: Automatische Garbage Collection
4. **Performance-Monitoring**: Metriken und Optimierungen

### Monitoring-Endpoints
```
GET /api/maps/health     - Service-Gesundheit
GET /api/maps/metrics    - Performance-Metriken
GET /api/maps/cache-info - Cache-Statistiken
```

## 📋 Troubleshooting

### Häufige Probleme

#### Kacheln werden nicht geladen
1. Service Worker Status prüfen: `navigator.serviceWorker.ready`
2. Cache-Größe überprüfen: `offlineMapService.clearOfflineCache()`
3. Netzwerk-Konnektivität testen

#### Routing funktioniert nicht
1. Backend-Services prüfen: `/api/maps/capabilities`
2. Fallback auf OSRM aktiviert?
3. PBF-Daten korrekt geladen?

#### NBAN-Daten fehlen
1. Bounds-Parameter korrekt gesetzt?
2. Berechtigung für NBAN-Zugriff vorhanden?
3. Cache-Update durchführen

## 🎯 Zukunftspläne

### Geplante Erweiterungen
- **3D-Terrain-Darstellung**: Für komplexere Einsatzszenarien
- **Augmented Reality**: AR-Navigation für Fußeinsätze
- **Machine Learning**: Optimierte Routing-Vorhersagen
- **Edge Computing**: Verteilte Offline-Pakete

### Integration-Möglichkeiten
- **Leitstellen-Systeme**: Direktanbindung an bestehende Software
- **Mobile Apps**: React Native Port für Smartphones
- **IoT-Geräte**: Embedded-Lösungen für Fahrzeuge

---

## 📞 Support und Dokumentation

### Technische Kontakte
- **Backend-Services**: Siehe `backend/README.md`
- **Frontend-Integration**: Siehe Inline-Dokumentation
- **API-Referenz**: OpenAPI-Spezifikation verfügbar

### Weitere Ressourcen
- **OpenStreetMap**: [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
- **MapLibre GL**: [https://maplibre.org/](https://maplibre.org/)
- **Valhalla**: [https://valhalla.readthedocs.io/](https://valhalla.readthedocs.io/)
- **OSRM**: [http://project-osrm.org/](http://project-osrm.org/)

---

*Diese Offline-Karten-Integration stellt sicher, dass RevierKompass v2.0 auch unter schwierigen Netzwerkbedingungen oder in komplett offline-Szenarien vollständig funktionsfähig bleibt und dabei höchste Standards für Genauigkeit, Performance und Benutzerfreundlichkeit erfüllt.*
