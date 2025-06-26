# 📋 Schritt 5: Komponenten-Refactoring Plan

## 🎯 Ziel
Refactoriere die bestehenden Wizard-Komponenten, um die neuen Stores zu nutzen und eine saubere Architektur zu implementieren.

## 📁 Aktuelle Komponenten-Struktur

### `components/wizard/` Ordner
- `WizardContainer.tsx` - Haupt-Container mit Step-Navigation
- `Step1AddressInputSimple.tsx` - Adress-Eingabe (170 Zeilen)
- `Step2TabSystemSimple.tsx` - Ziel-Auswahl (506 Zeilen) 
- `Step3PremiumExport.tsx` - Export & Ergebnisse (726 Zeilen)
- `Step1AddressInput.tsx` - Alternative Version (201 Zeilen)
- `Step2TabSystem.tsx` - Alternative Version (633 Zeilen)

## 🔍 Aktuelle Datenverwaltung Analyse

### ✅ Step1 (Adress-Eingabe) - Bereits optimal
```typescript
// ✅ Bereits Store-basiert!
const { setStartAddress, setWizardStep, wizard } = useAppStore();
// Nutzt useAppStore für Wizard-State
```

**Status:** Keine Änderung nötig - bereits optimal implementiert

### ❌ Step2 (Ziel-Auswahl) - Hauptproblem
```typescript
// ❌ Lokaler State + localStorage
const [stations] = useState<Station[]>([...]); // Hardcoded Demo-Daten
const [customAddresses, setCustomAddresses] = useState<CustomAddress[]>([]);
const [selectedStations, setSelectedStations] = useState<string[]>([]);

// ❌ Direkte localStorage-Manipulation
localStorage.setItem('revierkompass_custom_addresses', JSON.stringify(addresses));
```

**Probleme:**
- Hardcoded Demo-Stationen statt echte API-Daten
- Lokaler State statt Store-basiert
- Direkte localStorage-Manipulation
- Keine Trennung zwischen public/admin Stores

### ❌ Step3 (Export) - Demo-Daten Problem
```typescript
// ❌ Lokaler State + Demo-Daten
const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
// Generiert Demo-Routen ohne echte Daten
```

**Probleme:**
- Demo-Routen statt echte Berechnung
- Keine Verbindung zu ausgewählten Zielen
- Lokaler State

## 🚀 Refactoring-Ziele

### Step2: Ziel-Auswahl
```typescript
// ALT: Lokaler State
const [stations] = useState<Station[]>([...]);
const [selectedStations, setSelectedStations] = useState<string[]>([]);

// NEU: Store-basiert
const { stations, loadStations, getStationsByType } = useStationStore();
const { selectedStations, setSelectedStations } = useWizardStore();
```

### Step3: Export
```typescript
// ALT: Demo-Daten
const [routeResults, setRouteResults] = useState<RouteResult[]>([]);

// NEU: Store-basiert
const { selectedStations, selectedCustomAddresses } = useWizardStore();
const { startAddress } = useAppStore();
// Echte Routenberechnung basierend auf Store-Daten
```

## 📋 Migrations-Plan

### Phase 1: Step2 Refactoring (Priorität 1)

#### 1.1 Daten-Loading migrieren
```typescript
// ALT: Hardcoded in Komponente
const [stations] = useState<Station[]>([...]);

// NEU: Store-basiert
const { stations, loadStations, isLoading } = useStationStore();
useEffect(() => { loadStations(); }, []);
```

#### 1.2 Selection-State migrieren
```typescript
// ALT: Lokaler State
const [selectedStations, setSelectedStations] = useState<string[]>([]);

// NEU: Wizard-Store
const { selectedStations, setSelectedStations } = useWizardStore();
```

#### 1.3 Custom Addresses migrieren
```typescript
// ALT: localStorage direkt
localStorage.setItem('revierkompass_custom_addresses', ...);

// NEU: App-Store
const { customAddresses, addCustomAddress, deleteCustomAddress } = useAppStore();
```

### Phase 2: Step3 Refactoring (Priorität 2)

#### 2.1 Echte Daten verwenden
```typescript
// Aus Stores lesen statt Demo-Daten
const { selectedStations, selectedCustomAddresses } = useWizardStore();
const { startAddress } = useAppStore();
```

#### 2.2 Routenberechnung implementieren
```typescript
// Echte API-Calls basierend auf Store-Daten
const calculateRoutes = async () => {
  const routes = await routeService.calculateRoutes({
    start: startAddress,
    destinations: [...selectedStations, ...selectedCustomAddresses]
  });
};
```

### Phase 3: Admin-Integration (Priorität 3)

#### 3.1 Admin-Komponenten erstellen
- Admin-Station-Management
- Admin-Store Integration
- Admin-spezifische Features

## 🧪 Test-Strategie

### 1. Unit-Tests für Stores
- `useStationStore` Tests
- `useWizardStore` Tests
- `useAppStore` Tests

### 2. Integration-Tests
- Wizard-Flow von Step1 → Step2 → Step3
- Store-Interaktionen
- Daten-Persistierung

### 3. E2E-Tests
- Komplette Benutzer-Journey
- Admin-Features (falls implementiert)

## 🗑️ Dependencies zu entfernen

1. **Direkte localStorage-Aufrufe** in Step2
2. **Hardcoded Demo-Daten** in Step2 und Step3
3. **Lokale State-Management** für globale Daten
4. **Props-Drilling** (falls vorhanden)

## 📈 Vorteile der Migration

### 1. Zentrale Datenverwaltung
- Alle Daten in Stores
- Einheitliche Datenstruktur
- Bessere Wartbarkeit

### 2. Bessere Testbarkeit
- Stores sind isoliert testbar
- Mocking von Store-Daten möglich
- Unit-Tests für Business-Logik

### 3. Wiederverwendbarkeit
- Stores können in anderen Komponenten genutzt werden
- Keine Code-Duplikation
- Modulare Architektur

### 4. Admin-Integration
- Saubere Trennung zwischen public/admin
- Admin-spezifische Features möglich
- Erweiterbare Architektur

### 5. Performance
- Optimierte Re-Renders durch Store-Struktur
- Reduzierte Komponenten-Updates
- Bessere Memory-Management

## 🔄 Implementierungs-Reihenfolge

### Schritt 1: Step2 Refactoring
1. `useStationStore` Integration
2. `useWizardStore` für Selection-State
3. `useAppStore` für Custom Addresses
4. Tests schreiben

### Schritt 2: Step3 Refactoring
1. Store-Daten verwenden
2. Echte Routenberechnung
3. Export-Funktionalität anpassen
4. Tests erweitern

### Schritt 3: Admin-Integration
1. Admin-Komponenten erstellen
2. `useAdminStore` Integration
3. Admin-spezifische Features
4. E2E-Tests

## ⚠️ Risiken und Mitigation

### Risiko 1: Breaking Changes
**Mitigation:** Schrittweise Migration mit Feature-Flags

### Risiko 2: Performance-Probleme
**Mitigation:** Store-Optimierung und Memoization

### Risiko 3: Datenverlust
**Mitigation:** Backup-Mechanismen und Migration-Tests

## 📊 Erfolgs-Metriken

- [ ] Alle Wizard-Komponenten nutzen Stores
- [ ] Keine direkten localStorage-Aufrufe mehr
- [ ] Unit-Tests für alle Stores vorhanden
- [ ] Integration-Tests funktionieren
- [ ] Admin-Integration implementiert
- [ ] Performance verbessert
- [ ] Code-Duplikation reduziert

## 🎯 Nächste Schritte

1. **Phase 1 starten:** Step2 Refactoring implementieren
2. **Tests schreiben:** Unit-Tests für neue Store-Integration
3. **Code-Review:** Refactoring überprüfen
4. **Phase 2:** Step3 Refactoring
5. **Phase 3:** Admin-Integration

---

**Status:** 📋 Planung abgeschlossen  
**Nächster Schritt:** 🚀 Implementierung von Phase 1 beginnen 