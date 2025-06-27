# Step2 - Ziele auswählen

Diese Komponente ermöglicht es Benutzern, Polizeistationen und eigene Adressen für die Routenberechnung auszuwählen.

## Struktur

```
Step2/
├── components/           # UI-Komponenten
│   ├── ErrorBoundary.tsx
│   ├── Header.tsx
│   ├── TabNavigation.tsx
│   ├── GridView.tsx
│   ├── ListView.tsx
│   ├── MapView.tsx
│   ├── CustomAddresses.tsx
│   ├── QuickPreview.tsx
│   └── BottomNavigation.tsx
├── hooks/               # Custom Hooks
│   ├── useStep2State.ts
│   ├── useStep2Data.ts
│   └── useStep2Handlers.ts
├── types/               # TypeScript-Typen
│   └── index.ts
├── Step2.tsx           # Hauptkomponente
├── index.ts            # Export-Datei
└── README.md           # Diese Datei
```

## Komponenten

### Hauptkomponente
- **Step2.tsx**: Hauptkomponente, die alle anderen Komponenten zusammenführt

### UI-Komponenten
- **ErrorBoundary.tsx**: Fehlerbehandlung für die gesamte Komponente
- **Header.tsx**: Header mit Suchleiste und Ansicht-Umschalter
- **TabNavigation.tsx**: Tab-Navigation zwischen Stationen und eigenen Adressen
- **GridView.tsx**: Raster-Ansicht für Polizeistationen
- **ListView.tsx**: Listen-Ansicht für Polizeistationen
- **MapView.tsx**: Platzhalter für Karten-Ansicht
- **CustomAddresses.tsx**: Verwaltung eigener Adressen
- **QuickPreview.tsx**: Schnellvorschau der ausgewählten Ziele
- **BottomNavigation.tsx**: Bottom-Navigation mit Statistiken und Weiter-Button

### Custom Hooks
- **useStep2State.ts**: Verwaltung des lokalen States
- **useStep2Data.ts**: Datenverarbeitung und -filterung
- **useStep2Handlers.ts**: Event-Handler für Benutzerinteraktionen

### Typen
- **types/index.ts**: TypeScript-Typdefinitionen

## Verwendung

```tsx
import { Step2 } from '@/components/wizard/Step2';

// In einer anderen Komponente
<Step2 />
```

## Features

- **Responsive Design**: Funktioniert auf allen Bildschirmgrößen
- **Dark Mode**: Unterstützung für dunkles Theme
- **Barrierefreiheit**: Vollständige Keyboard-Navigation und Screen Reader Support
- **Animationen**: Smooth Transitions mit Framer Motion
- **Suchfunktion**: Filterung nach Namen, Stadt oder Revier
- **Mehrere Ansichten**: Grid, Liste und Karte (Platzhalter)
- **Eigene Adressen**: Hinzufügen und Verwalten eigener Adressen
- **Schnellvorschau**: Übersicht der ausgewählten Ziele
- **Bulk-Aktionen**: Alle auswählen/zurücksetzen 