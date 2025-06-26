# Architektur IST-Zustand

## 1. Tech Stack (aktuell)
- **Framework:** React mit TypeScript
- **State Management:** Teilweise lokaler State (useState, useEffect), kein globaler Store wie Zustand oder Redux im Einsatz
- **Routing:** React Router v6
- **Styling:** TailwindCSS
- **API Layer:** fetch (direkt in Komponenten), keine zentrale API-Logik
- **Testing:** (nicht oder nur rudimentär vorhanden)
- **Build Tool:** Vite

---

## 2. Verzeichnisstruktur (aktuell)
```plaintext
src/
  components/
    wizard/
      Step1AddressInputSimple.tsx
      Step2TabSystemSimple.tsx
      Step2TabSystem.tsx
      Step3PremiumExport.tsx
    admin/
      (noch nicht oder nur rudimentär vorhanden)
    map/
      (optional, z.B. MapView.tsx)
  lib/
    store/
      app-store.ts (nur für UI-State, kein Daten-Store)
  pages/
    wizard.tsx
    (admin/ fehlt oder ist leer)
  data/
    polizeistationen.json (statische Daten)
```

---

## 3. Datenfluss (aktuell)
- **Frontend lädt Polizeistationen** direkt aus `/data/polizeistationen.json` (statisch, kein Backend-API)
- **Keine Trennung** zwischen Präsidien und Revieren auf Datenebene (meist nur ein Array mit allen Stationen)
- **Kein echtes CRUD:** Daten werden nicht dynamisch verändert, sondern sind fest im JSON hinterlegt
- **Kein Admin-Panel:** Es gibt keine Oberfläche zur Bearbeitung der Daten

---

## 4. State Management (aktuell)
- **useState/useEffect** in Komponenten für Filter, Auswahl, UI-Zustand
- **app-store.ts:** Nur für Wizard-Step und UI-Status, keine zentrale Verwaltung der Stationsdaten
- **Kein persistenter oder globaler Daten-Store**

---

## 5. Komponentenstruktur (aktuell)
```plaintext
WizardContainer.tsx
  ├─ Step1AddressInputSimple.tsx
  ├─ Step2TabSystemSimple.tsx / Step2TabSystem.tsx
  └─ Step3PremiumExport.tsx
```
- **Step2TabSystemSimple/Step2TabSystem:** Enthält die Logik für das Dropdown und die Filterung der Polizeistationen
- **Keine Hierarchie:** Präsidien und Reviere werden nicht als verschachtelte Struktur angezeigt
- **Map-Komponente:** Optional, zeigt ausgewählte Stationen auf der Karte

---

## 6. API-Design (aktuell)
- **Keine echte API:** Daten werden aus statischer JSON-Datei geladen
- **Kein Auth, kein Backend, kein Caching**

---

## 7. Sicherheit & Auth (aktuell)
- **Nicht vorhanden** (keine Authentifizierung, keine Rollen)

---

## 8. Performance & Caching (aktuell)
- **Kein Caching:** Daten werden bei jedem Laden neu aus JSON geladen
- **Performance:** Für kleine Datenmengen ausreichend, aber nicht skalierbar

---

## 9. Testing (aktuell)
- **Nicht oder nur rudimentär vorhanden**

---

## 10. Zusammenfassung
- Die aktuelle Architektur ist einfach, aber nicht skalierbar.
- Es gibt keine Trennung zwischen statischen und dynamischen Daten.
- Kein Admin-Panel, keine API, keine Authentifizierung.
- State Management ist rein lokal und UI-bezogen.
- Für Prototypen und kleine Demos geeignet, aber nicht für produktive, große Anwendungen. 