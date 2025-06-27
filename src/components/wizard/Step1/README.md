# Step1 - Startadresse eingeben

Das Step1-Modul ist eine modulare React-Komponente für die Eingabe und Geocodierung von Startadressen für die Routenberechnung.

## Struktur

```
Step1/
├── components/           # UI-Komponenten
│   ├── AddressConfirmation.tsx
│   ├── AddressForm.tsx
│   ├── DemoAddresses.tsx
│   └── Header.tsx
├── hooks/               # Custom Hooks
│   └── useStep1State.ts
├── types/               # TypeScript-Typen
│   └── index.ts
├── Step1.tsx           # Hauptkomponente
├── index.ts            # Export-Datei
└── README.md           # Diese Datei
```

## Komponenten

### Hauptkomponente
- **Step1.tsx**: Hauptkomponente, die alle Module zusammenführt

### UI-Komponenten
- **AddressConfirmation.tsx**: Bestätigungsanzeige für erfolgreich geocodierte Adressen
- **AddressForm.tsx**: Formular für die Adresseingabe
- **DemoAddresses.tsx**: Demo-Adressen für schnelle Tests
- **Header.tsx**: Header mit Titel und Beschreibung

### Custom Hooks
- **useStep1State.ts**: State-Verwaltung und Business Logic

### Typen
- **types/index.ts**: TypeScript-Interfaces und Typen

## Features

- **Adresseingabe**: Einfache Eingabe von Startadressen
- **Demo-Adressen**: Vordefinierte Adressen für schnelle Tests
- **Geocodierung**: Automatische Koordinatenberechnung (Demo)
- **Validierung**: Überprüfung der Eingaben
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Dark Mode**: Unterstützung für dunkles Design
- **Animationen**: Smooth Transitions mit Framer Motion

## Verwendung

```tsx
import { Step1 } from '@/components/wizard/Step1';

// In einer anderen Komponente
<Step1 />
```

## Abhängigkeiten

- React
- Framer Motion (Animationen)
- Lucide React (Icons)
- React Hot Toast (Benachrichtigungen)
- Zustand Stores (State Management)

## Store-Integration

Die Komponente verwendet folgende Stores:
- `useAppStore`: Für Startadresse und Wizard-Navigation

## Workflow

1. Benutzer gibt eine Adresse ein oder wählt eine Demo-Adresse
2. Adresse wird validiert
3. Geocodierung wird simuliert (Demo-Koordinaten)
4. Adresse wird im Store gespeichert
5. Automatische Weiterleitung zu Step 2

## Hinweise

- Die Geocodierung ist für Demo-Zwecke simuliert
- In der Produktion würde hier ein echter API-Call stattfinden
- Alle Funktionalitäten der ursprünglichen `Step1AddressInputSimple.tsx` wurden beibehalten
- Die modulare Struktur verbessert Wartbarkeit und Testbarkeit 