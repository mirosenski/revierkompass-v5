# 🛠️ Detaillierte Refactoring-Aufgaben

## 📋 Übersicht
Diese Datei enthält die detaillierten Aufgaben für das Refactoring der Wizard-Komponenten von lokalem State zu Store-basierter Architektur.

---

## 🔄 Phase 1: Step2 Refactoring

### Schritt 1.1: Step2 - Daten-Loading migrieren
**Komponente:** `components/wizard/Step2TabSystemSimple.tsx`

**Task:** 
```typescript
// Veralteter Code:
const [stations] = useState<Station[]>([
  // Hier steht der Hardcoded Array mit Demo-Daten
  { id: 1, name: "Station 1", type: "base", position: [50.1, 8.4] },
  // ...weitere Stationen
]);

// Neuer Code:
const { stations, loadStations, isLoading, error } = useStationStore();

useEffect(() => {
  loadStations();
}, []);
```

**Erwartung:**
- Store-basiertes Laden der Stationsdaten
- Loading-UI: `{isLoading && <LoadingSpinner />}`
- Fehler-UI: `{error && <ErrorMessage>{error}</ErrorMessage>}`

**Test-Case:**
- [ ] Beim Mount werden Stationsdaten geladen
- [ ] Loading-UI erscheint während des Ladens
- [ ] Fehler-UI bei API-Fehlern

---

### Schritt 1.2: Step2 - Selection-State migrieren
**Komponente:** `components/wizard/Step2TabSystemSimple.tsx`

**Task:**
```typescript
// Veralteter Code:
const [selectedStations, setSelectedStations] = useState<string[]>([]);

// Neuer Code:
const { selectedStations, setSelectedStations } = useWizardStore();
```

**Erwartung:**
- Auswahl wird im Store gespeichert statt lokal
- Auswahl ist über mehrere Komponenten hinweg verfügbar
- Props für Stationsauswahl werden nicht mehr benötigt

**Test-Case:**
- [ ] Auswahl wird im Store persistiert
- [ ] Auswahl ist in anderen Komponenten verfügbar
- [ ] Typ-Checks funktionieren: `if (!selectedStations) return <Loading />`

---

### Schritt 1.3: Step2 - Custom Addresses migrieren
**Komponente:** `components/wizard/Step2TabSystemSimple.tsx`

**Task:**
```typescript
// Veralteter Code:
const handleAddCustomAddress = (address: CustomAddress) => {
  const addresses = JSON.parse(localStorage.getItem('revierkompass_custom_addresses') || '[]');
  addresses.push(address);
  localStorage.setItem('revierkompass_custom_addresses', JSON.stringify(addresses));
  setCustomAddresses(addresses);
};

// Neuer Code:
const { customAddresses, addCustomAddress } = useAppStore();

const handleAddCustomAddress = (address: CustomAddress) => {
  addCustomAddress(address);
};
```

**Erwartung:**
- Custom Addresses werden im Store verwaltet
- Keine direkten localStorage-Operationen mehr in der Komponente
- Einheitliche Handhabung von Adressdaten

**Test-Case:**
- [ ] Adressen werden im Store gespeichert
- [ ] Keine localStorage-Aufrufe mehr in der Komponente
- [ ] Typ-Checks für `customAddresses` funktionieren

---

## 🔄 Phase 2: Step3 Refactoring

### Schritt 2.1: Step3 - Store-Daten nutzen
**Komponente:** `components/wizard/Step3PremiumExport.tsx`

**Task:**
```typescript
// Veralteter Code:
const [routeResults, setRouteResults] = useState<RouteResult[]>([
  // Demo-Routen
  { id: 1, distance: 150, duration: 45, stations: ["Station 1", "Station 2"] },
  // ...weitere Demo-Routen
]);

// Neuer Code:
const { selectedStations, selectedCustomAddresses } = useWizardStore();
const { startAddress } = useAppStore();

// Entferne den routeResults State
```

**Erwartung:**
- Komponente nutzt aktuelle Daten aus Stores
- Keine hardcoded Demo-Daten mehr
- Daten werden aus den zentralen Stores abgerufen

**Test-Case:**
- [ ] Store-Daten werden korrekt gelesen
- [ ] Keine Demo-Daten mehr vorhanden
- [ ] Checks funktionieren: `if (!selectedStations?.length) return <NoSelectionWarning />`

---

### Schritt 2.2: Step3 - Echte Routenberechnung
**Komponente:** `components/wizard/Step3PremiumExport.tsx`

**Task:**
```typescript
// Veralteter Code:
useEffect(() => {
  // Generiert Demo-Routen
  const demoResults = generateDemoRoutes();
  setRouteResults(demoResults);
}, []);

// Neuer Code:
const { selectedStations, selectedCustomAddresses } = useWizardStore();
const { startAddress } = useAppStore();
const [routeResults, setRouteResults] = useState<RouteResult[] | null>(null);
const [isCalculating, setIsCalculating] = useState(false);

const calculateRoutes = async () => {
  try {
    setIsCalculating(true);
    const destinations = [
      ...selectedStations.map(id => ({ type: 'station', id })),
      ...selectedCustomAddresses.map(addr => ({ type: 'custom', id: addr.id }))
    ];
    
    const routes = await routeService.calculateRoutes({
      start: startAddress,
      destinations
    });
    
    setRouteResults(routes);
  } catch (error) {
    console.error("Routenberechnung fehlgeschlagen:", error);
    // Zeige Fehlermeldung
  } finally {
    setIsCalculating(false);
  }
};

// Aufruf bei Änderungen der relevanten Daten
useEffect(() => {
  if (startAddress && (selectedStations.length > 0 || selectedCustomAddresses.length > 0)) {
    calculateRoutes();
  }
}, [startAddress, selectedStations, selectedCustomAddresses]);
```

**Erwartung:**
- Echte Routenberechnung über API
- Dynamische Updates bei Änderungen der Auswahl
- Loading-Status während der Berechnung

**Test-Case:**
- [ ] API-Calls werden korrekt ausgeführt
- [ ] Loading-Status wird angezeigt
- [ ] Fehlerbehandlung funktioniert
- [ ] Dynamische Updates bei Datenänderungen

---

## 🔄 Phase 3: Admin-Integration

### Schritt 3.1: Admin-Integration - Admin-Komponenten-Scaffold
**Komponente:** `components/admin/AdminStationManagement.tsx` (neu erstellen)

**Task:**
```typescript
// Neue Datei erstellen:
import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';

const AdminStationManagement: React.FC = () => {
  const { 
    stations, 
    isLoading, 
    error, 
    loadStations, 
    createStation, 
    updateStation, 
    deleteStation 
  } = useAdminStore();
  
  const [newStation, setNewStation] = useState<Partial<Station>>({});
  
  useEffect(() => {
    loadStations();
  }, []);
  
  const handleCreate = async () => {
    try {
      await createStation(newStation);
      setNewStation({});
    } catch (error) {
      console.error("Erstellung fehlgeschlagen:", error);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="admin-station-management">
      <h2>Stationen verwalten</h2>
      
      <div className="create-form">
        <h3>Neue Station erstellen</h3>
        <input 
          type="text" 
          placeholder="Name" 
          value={newStation.name || ''}
          onChange={e => setNewStation(prev => ({...prev, name: e.target.value}))}
        />
        <input 
          type="number" 
          placeholder="Lat" 
          value={newStation.position?.[0] || ''}
          onChange={e => setNewStation(prev => ({...prev, position: [Number(e.target.value), prev.position?.[1] || 0]}))}
        />
        <input 
          type="number" 
          placeholder="Lng" 
          value={newStation.position?.[1] || ''}
          onChange={e => setNewStation(prev => ({...prev, position: [prev.position?.[0] || 0, Number(e.target.value)]}))}
        />
        <select 
          value={newStation.type || ''}
          onChange={e => setNewStation(prev => ({...prev, type: e.target.value as StationType}))}
        >
          <option value="">Typ wählen</option>
          <option value="base">Basis</option>
          <option value="checkpoint">Checkpoint</option>
          <option value="custom">Benutzerdefiniert</option>
        </select>
        <button onClick={handleCreate}>Erstellen</button>
      </div>
      
      <div className="station-list">
        <h3>Bestehende Stationen</h3>
        {stations.map(station => (
          <div key={station.id} className="station-item">
            <span>{station.name} ({station.type})</span>
            <div>
              <button onClick={() => {/* Edit-Logik */}}>Bearbeiten</button>
              <button onClick={() => deleteStation(station.id)}>Löschen</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStationManagement;
```

**Erwartung:**
- Grundlegende Admin-Komponente zum Verwalten von Stationen
- Formular zum Erstellen neuer Stationen
- Liste bestehender Stationen mit Lösch-Button
- Integration mit `useAdminStore`

**Test-Case:**
- [ ] Komponente wird korrekt gerendert
- [ ] Stationen werden geladen und angezeigt
- [ ] Neue Stationen können erstellt werden
- [ ] Stationen können gelöscht werden
- [ ] Loading- und Error-States funktionieren

---

## 🔄 Workflow-Tipp:
1. **Task 1.1** an die AI senden
2. **Rückmeldung prüfen** (Code + Erklärung)
3. **Test schreiben** (z.B. mit Jest/React Testing Library)
4. **Nächsten Task** erst dann senden

## 📋 Checkliste für jede Aufgabe

### Vor der Implementierung:
- [ ] Aktuelle Komponente analysiert
- [ ] Store-Imports vorbereitet
- [ ] Backup der aktuellen Implementierung

### Während der Implementierung:
- [ ] Code schrittweise ersetzt
- [ ] TypeScript-Fehler behoben
- [ ] Console-Logs für Debugging hinzugefügt

### Nach der Implementierung:
- [ ] Komponente funktioniert ohne Fehler
- [ ] Store-Daten werden korrekt geladen
- [ ] Loading-States funktionieren
- [ ] Fehlerbehandlung implementiert
- [ ] Tests geschrieben/aktualisiert

---

## 🚀 Nächste Schritte

1. **Schritt 1.1** mit Codex implementieren
2. **Tests schreiben** für die migrierte Komponente
3. **Code-Review** durchführen
4. **Schritt 1.2** beginnen
5. **Iterativ fortfahren** bis alle Schritte abgeschlossen

---

**Status:** 📋 Aufgaben definiert  
**Nächster Schritt:** 🚀 Implementierung von Schritt 1.1 beginnen 