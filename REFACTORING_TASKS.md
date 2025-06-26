# 🛠️ REFACTORING_TASKS.md - Aktualisierte Aufgabenliste

## 📋 Übersicht
Diese Datei enthält alle notwendigen Refactoring-Aufgaben basierend auf der vollständigen Codebase-Analyse.

---

## 🔍 AKTUELLE SITUATION - VOLLSTÄNDIGE ANALYSE

### ✅ **Was bereits funktioniert:**
- `useStationStore` - Vollständig implementiert mit `getStationsByType` und `getReviereByPraesidium`
- `useWizardStore` - Vollständig implementiert mit Persistierung
- `useAppStore` - Vollständig implementiert mit Custom Addresses Management
- `useAdminStore` - Vollständig implementiert mit CRUD-Operationen
- **Mock-Daten** - Vollständige Hierarchie mit Präsidien und Revieren (parentId-Beziehungen)
- **Backend-API** - Hierarchische Endpoints verfügbar (`/hierarchical`, `/praesidien/:id/revier`)

### ❌ **KRITISCHE PROBLEME IDENTIFIZIERT:**

#### **Problem 1: Step2 zeigt Städte statt Präsidien-Hierarchie**
**Aktuell:** 
```typescript
// ❌ Flache Stadt-Filterung
const cities = [...new Set(stations.map(s => s.city))].sort();
const filteredStations = stations.filter(station =>
  cityFilter === '' || station.city === cityFilter
);
```
**Soll:** Präsidien als Hauptkategorien mit untergeordneten Revieren als Akkordeon

#### **Problem 2: Step2 nutzt lokalen State statt Stores**
**Aktuell:**
```typescript
// ❌ Lokaler State + localStorage
const [customAddresses, setCustomAddresses] = useState<CustomAddress[]>([]);
const saveCustomAddresses = (addresses: CustomAddress[]) => {
  localStorage.setItem('revierkompass_custom_addresses', JSON.stringify(addresses));
  setCustomAddresses(addresses);
};
```

#### **Problem 3: Step3 nutzt komplexe Typ-Konvertierung**
**Aktuell:**
```typescript
// ❌ Komplexe Typ-Konvertierung zwischen verschiedenen Station-Typen
const convertStationType = (station: StationType): AppStoreStation => {
  return {
    id: station.id,
    name: station.name,
    // ... weitere Konvertierung
  };
};
```

#### **Problem 4: Admin zeigt flache Liste statt Hierarchie**
**Aktuell:** Admin zeigt alle Stationen in flacher Tabelle
**Soll:** Hierarchische Darstellung mit Präsidien und zugehörigen Revieren

---

## 🔄 PHASE 1: STEP2 REFACTORING (Priorität 1)

### **Aufgabe 1.1: Step2 - Präsidien/Reviere Hierarchie implementieren**

**Komponente:** `components/wizard/Step2TabSystemSimple.tsx`

**Problem:** Zeigt Städte statt Präsidien-Hierarchie

**Lösung:**
```typescript
// ✅ Neu: Hierarchische Präsidien/Reviere Struktur
const { stations, getStationsByType, getReviereByPraesidium } = useStationStore();

// Präsidien als Hauptkategorien
const praesidien = getStationsByType('praesidium');

// Für jedes Präsidium die zugehörigen Reviere
const praesidiumWithReviere = praesidien.map(praesidium => ({
  ...praesidium,
  reviere: getReviereByPraesidium(praesidium.id)
}));

// Akkordeon-State
const [expandedPraesidien, setExpandedPraesidien] = useState<string[]>([]);

const togglePraesidium = (praesidiumId: string) => {
  setExpandedPraesidien(prev => 
    prev.includes(praesidiumId)
      ? prev.filter(id => id !== praesidiumId)
      : [...prev, praesidiumId]
  );
};
```

**UI-Implementierung:**
```typescript
// Ersetze Stadt-Filter durch Präsidien-Akkordeon
{praesidiumWithReviere.map((praesidium) => (
  <div key={praesidium.id} className="praesidium-accordion border rounded-lg mb-4">
    <div 
      className="praesidium-header flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
      onClick={() => togglePraesidium(praesidium.id)}
    >
      <div className="flex items-center space-x-3">
        <Building className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-semibold text-gray-900">{praesidium.name}</h3>
          <p className="text-sm text-gray-600">{praesidium.city}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          {praesidium.reviere.length} Reviere
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${
          expandedPraesidien.includes(praesidium.id) ? 'rotate-180' : ''
        }`} />
      </div>
    </div>
    
    {/* Reviere als Unterpunkte */}
    {expandedPraesidien.includes(praesidium.id) && (
      <div className="reviere-list border-t bg-gray-50">
        {praesidium.reviere.map((revier) => (
          <div key={revier.id} className="revier-item flex items-center p-3 hover:bg-gray-100">
            <input
              type="checkbox"
              checked={selectedStations.includes(revier.id)}
              onChange={() => handleStationToggle(revier.id)}
              className="mr-3"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900">{revier.name}</span>
              <p className="text-sm text-gray-600">{revier.address}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
))}
```

**Erwartung:**
- Präsidien als Hauptkategorien mit Akkordeon-Funktionalität
- Reviere als expandierbare Unterpunkte
- Checkbox-Auswahl für einzelne Reviere
- Entfernung der Stadt-Filterung

---

### **Aufgabe 1.2: Step2 - Custom Addresses zu Store migrieren**

**Problem:** Lokaler State + localStorage für Custom Addresses

**Lösung:**
```typescript
// ✅ Neu: Store-basiert
const { customAddresses, addCustomAddress, deleteCustomAddress } = useAppStore();
const { selectedCustomAddresses, setSelectedCustomAddresses } = useWizardStore();

// Entferne lokalen State
// const [customAddresses, setCustomAddresses] = useState<CustomAddress[]>([]);
// const [selectedCustom, setSelectedCustom] = useState<string[]>([]);

// Entferne localStorage-Aufrufe
// const saveCustomAddresses = (addresses: CustomAddress[]) => { ... };

const handleAddAddress = () => {
  if (!formData.name.trim() || !formData.street.trim() || !formData.zipCode.trim() || !formData.city.trim()) {
    toast.error('Bitte füllen Sie alle Felder aus');
    return;
  }

  // ✅ Store-basiert
  addCustomAddress({
    name: formData.name,
    street: formData.street,
    zipCode: formData.zipCode,
    city: formData.city
  });
  
  setFormData({ name: '', street: '', zipCode: '', city: '' });
  setShowAddForm(false);
  toast.success('Adresse erfolgreich hinzugefügt');
};

const handleCustomToggle = (addressId: string) => {
  setSelectedCustomAddresses(prev => 
    prev.includes(addressId)
      ? prev.filter(id => id !== addressId)
      : [...prev, addressId]
  );
};

const handleDeleteAddress = (addressId: string) => {
  deleteCustomAddress(addressId);
  setSelectedCustomAddresses(prev => prev.filter(id => id !== addressId));
  toast.success('Adresse gelöscht');
};
```

---

### **Aufgabe 1.3: Step2 - Selection State zu WizardStore migrieren**

**Problem:** Lokaler State für Custom Selection

**Lösung:**
```typescript
// ✅ Neu: WizardStore für alle Selections
const { 
  selectedStations, 
  setSelectedStations,
  selectedCustomAddresses,
  setSelectedCustomAddresses 
} = useWizardStore();

// Entferne lokalen State
// const [selectedCustom, setSelectedCustom] = useState<string[]>([]);

// Aktualisiere Tab-Count
const tabs = [
  {
    id: 'stations',
    label: 'Polizeistationen',
    icon: Building,
    count: selectedStations.length
  },
  {
    id: 'custom',
    label: 'Eigene Adressen',
    icon: MapPin,
    count: selectedCustomAddresses.length // ✅ Store-basiert
  }
];

// Aktualisiere Continue-Logic
const handleContinue = () => {
  const totalSelected = selectedStations.length + selectedCustomAddresses.length;
  if (totalSelected === 0) {
    toast.error('Bitte wählen Sie mindestens ein Ziel aus');
    return;
  }
  
  toast.success(`${totalSelected} Ziele ausgewählt`);
  setWizardStep(3);
};
```

---

## 🔄 PHASE 2: STEP3 REFACTORING (Priorität 2)

### **Aufgabe 2.1: Step3 - Typ-Konvertierung vereinfachen**

**Problem:** Komplexe Typ-Konvertierung zwischen verschiedenen Station-Typen

**Lösung:**
```typescript
// ✅ Neu: Einheitliche Typen verwenden
// Entferne convertStationType Funktion
// const convertStationType = (station: StationType): AppStoreStation => { ... };

// Nutze direkt die Station-Typen aus useStationStore
const { stations } = useStationStore();

// Vereinfachte Routenberechnung
const calculateRoutes = async () => {
  if (!startAddress || (!selectedStations?.length && !selectedCustomAddresses?.length)) {
    setRouteResults(null);
    return;
  }

  setIsCalculating(true);
  try {
    // ✅ Direkte Verwendung ohne Konvertierung
    const routes = await routingService.calculateMultipleRoutes(
      startAddress,
      selectedStations || [],
      selectedCustomAddresses || [],
      stations, // ✅ Direkt verwenden
      customAddresses || []
    );

    setRouteResults(routes as unknown as RouteResult[]);
    toast.success('Routenberechnung abgeschlossen!');
  } catch (error) {
    console.error('Routenberechnung fehlgeschlagen:', error);
    toast.error('Fehler bei der Routenberechnung');
    setRouteResults(null);
  } finally {
    setIsCalculating(false);
  }
};
```

---

### **Aufgabe 2.2: Step3 - Store-Daten optimal nutzen**

**Problem:** Nicht optimale Nutzung der Store-Daten

**Lösung:**
```typescript
// ✅ Neu: Optimale Store-Nutzung
const { selectedStations, selectedCustomAddresses } = useWizardStore();
const { startAddress, customAddresses } = useAppStore();
const { stations } = useStationStore();

// Validierung verbessern
if (!startAddress) {
  return <NoSelectionWarning message="Bitte geben Sie eine Startadresse ein" />;
}

if (!selectedStations?.length && !selectedCustomAddresses?.length) {
  return <NoSelectionWarning message="Bitte wählen Sie mindestens ein Ziel aus" />;
}

// Bessere Fehlerbehandlung
useEffect(() => {
  if (startAddress && (selectedStations?.length || selectedCustomAddresses?.length)) {
    void calculateRoutes();
  }
}, [startAddress, selectedStations, selectedCustomAddresses, customAddresses, stations]);
```

---

## 🔄 PHASE 3: ADMIN-BEREICH REFACTORING (Priorität 3)

### **Aufgabe 3.1: AdminStationManagement - Hierarchische Darstellung**

**Komponente:** `components/admin/AdminStationManagement.tsx`

**Problem:** Flache Stationsliste statt Hierarchie

**Lösung:**
```typescript
// ✅ Neu: Hierarchische Darstellung
const { stations, getStationsByType, getReviereByPraesidium } = useStationStore();

const praesidien = getStationsByType('praesidium');
const praesidiumWithReviere = praesidien.map(praesidium => ({
  ...praesidium,
  reviere: getReviereByPraesidium(praesidium.id)
}));

// UI: Gruppierte Darstellung
{praesidiumWithReviere.map((praesidium) => (
  <div key={praesidium.id} className="praesidium-group mb-6 border rounded-lg">
    <div className="praesidium-header bg-blue-50 p-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">
            {praesidium.name} (Präsidium)
          </h3>
          <p className="text-sm text-blue-700">{praesidium.city}</p>
        </div>
        <span className="text-sm text-blue-600">
          {praesidium.reviere.length} Reviere
        </span>
      </div>
    </div>
    
    <div className="reviere-subgroup">
      {praesidium.reviere.map((revier) => (
        <div key={revier.id} className="revier-item flex items-center justify-between p-3 border-b last:border-b-0">
          <div>
            <span className="font-medium">{revier.name} (Revier)</span>
            <p className="text-sm text-gray-600">{revier.address}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEdit(revier)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Bearbeiten
            </button>
            <button 
              onClick={() => deleteStation(revier.id)}
              className="text-red-600 hover:text-red-900"
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
))}
```

---

### **Aufgabe 3.2: AdminStationManagement - Parent-Child Beziehungen**

**Problem:** Keine Verwaltung der Parent-Child Beziehungen

**Lösung:**
```typescript
// ✅ Neu: Parent-Child Verwaltung
const [selectedParentPraesidium, setSelectedParentPraesidium] = useState<string>('');

// Beim Erstellen eines Reviers
const handleCreateRevier = async () => {
  if (!selectedParentPraesidium) {
    toast.error('Bitte wählen Sie ein übergeordnetes Präsidium aus');
    return;
  }

  await createStation({
    ...newStation,
    type: 'revier',
    parentId: selectedParentPraesidium // ✅ Wichtig!
  });
};

// UI: Parent-Auswahl
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <input
    type="text"
    placeholder="Name"
    value={newStation.name || ''}
    onChange={(e) => setNewStation(prev => ({ ...prev, name: e.target.value }))}
    className="p-3 rounded-lg border"
  />
  <select
    value={newStation.type || ''}
    onChange={(e) => setNewStation(prev => ({ ...prev, type: e.target.value as StationType }))}
    className="p-3 rounded-lg border"
  >
    <option value="">Typ wählen</option>
    <option value="praesidium">Präsidium</option>
    <option value="revier">Revier</option>
  </select>
  
  {/* Parent-Auswahl nur für Reviere */}
  {newStation.type === 'revier' && (
    <select
      value={selectedParentPraesidium}
      onChange={(e) => setSelectedParentPraesidium(e.target.value)}
      className="p-3 rounded-lg border"
    >
      <option value="">Präsidium wählen</option>
      {praesidien.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )}
</div>
```

---

## 🔄 PHASE 4: STORE-OPTIMIERUNG (Priorität 4)

### **Aufgabe 4.1: Einheitliche Station-Typen**

**Problem:** Verschiedene Station-Typen in verschiedenen Stores

**Lösung:**
```typescript
// ✅ Neu: Einheitlicher Station-Typ verwenden
// In allen Stores: types/station.types.ts verwenden
import { Station } from '@/types/station.types';

// Entferne doppelte Station-Interfaces
// Entferne convertStationType Funktion
// Nutze einheitliche Typen in allen Stores
```

---

### **Aufgabe 4.2: Store-Interaktionen optimieren**

**Problem:** Stores sind nicht optimal aufeinander abgestimmt

**Lösung:**
```typescript
// ✅ Neu: Optimierte Store-Interaktionen
// useWizardStore.ts erweitern
interface WizardStore {
  // ... bestehende Properties
  
  // Neue Methoden für bessere Integration
  selectPraesidiumWithReviere: (praesidiumId: string, reviereIds: string[]) => void;
  clearAllSelections: () => void;
  getSelectedPraesidien: () => string[];
  getSelectedReviere: () => string[];
}

// Implementierung
selectPraesidiumWithReviere: (praesidiumId, reviereIds) => 
  set((state) => ({
    selectedPraesidiumId: praesidiumId,
    selectedStations: [...state.selectedStations, ...reviereIds]
  })),
```

---

## 🧪 TEST-STRATEGIE

### **Unit-Tests für Stores**
```typescript
// useStationStore.test.ts
describe('useStationStore', () => {
  test('getStationsByType filters correctly', () => {
    // Test-Implementation
  });
  
  test('getReviereByPraesidium returns correct reviere', () => {
    // Test-Implementation
  });
});
```

### **Integration-Tests**
```typescript
// Step2.integration.test.ts
describe('Step2 Integration', () => {
  test('praesidium selection expands reviere', () => {
    // Test-Implementation
  });
  
  test('custom address management works with stores', () => {
    // Test-Implementation
  });
});
```

---

## 📋 IMPLEMENTIERUNGS-REIHENFOLGE

### **Woche 1: Step2 Refactoring**
1. **Tag 1-2:** Aufgabe 1.1 (Präsidien/Reviere Hierarchie)
2. **Tag 3-4:** Aufgabe 1.2 (Custom Addresses Migration)
3. **Tag 5:** Aufgabe 1.3 (Selection State Migration)

### **Woche 2: Step3 Refactoring**
1. **Tag 1-2:** Aufgabe 2.1 (Typ-Konvertierung vereinfachen)
2. **Tag 3-4:** Aufgabe 2.2 (Store-Daten optimal nutzen)
3. **Tag 5:** Integration-Tests

### **Woche 3: Admin-Refactoring**
1. **Tag 1-2:** Aufgabe 3.1 (Hierarchische Darstellung)
2. **Tag 3-4:** Aufgabe 3.2 (Parent-Child Beziehungen)
3. **Tag 5:** Admin-Tests

### **Woche 4: Store-Optimierung**
1. **Tag 1-2:** Aufgabe 4.1 (Einheitliche Typen)
2. **Tag 3-4:** Aufgabe 4.2 (Store-Interaktionen)
3. **Tag 5:** E2E-Tests

---

## 🎯 ERFOLGS-METRIKEN

- [ ] Step2 zeigt Präsidien als Hauptkategorien
- [ ] Reviere sind als Akkordeon expandierbar
- [ ] Admin zeigt hierarchische Struktur
- [ ] Alle Custom Addresses sind Store-basiert
- [ ] Step3 nutzt einheitliche Typen
- [ ] Keine localStorage-Aufrufe mehr
- [ ] Keine Typ-Konvertierung mehr
- [ ] Alle Tests bestehen

---

## 🚀 NÄCHSTER SCHRITT

**Sofort beginnen mit:** Aufgabe 1.1 - Step2 Präsidien/Reviere Hierarchie

**Grund:** 
- Dies ist das Kernproblem, das die Benutzererfahrung am meisten beeinträchtigt
- Die Stores sind bereits vollständig implementiert
- Die Mock-Daten haben bereits die korrekte Hierarchie
- Die Backend-API unterstützt bereits hierarchische Endpoints

---

**Status:** 📋 Aufgaben aktualisiert  
**Nächster Schritt:** 🚀 Implementierung von Aufgabe 1.1 beginnen 