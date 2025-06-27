# Step3 - Routenanalyse & Export

Diese Komponente ermöglicht es Benutzern, berechnete Routen zu analysieren und in verschiedenen Formaten zu exportieren.

## Struktur

```
Step3/
├── components/           # UI-Komponenten
│   ├── StationConverter.ts
│   ├── TabNavigation.tsx
│   ├── SummaryTab.tsx
│   ├── TableTab.tsx
│   ├── MapTab.tsx
│   ├── OfflineMapTab.tsx
│   └── ExportTab.tsx
├── hooks/               # Custom Hooks
│   ├── useStep3State.ts
│   └── useStep3RouteCalculation.ts
├── types/               # TypeScript-Typen
│   └── index.ts
├── Step3.tsx           # Hauptkomponente
├── index.ts            # Export-Datei
└── README.md           # Diese Datei
```

## Komponenten

### Hauptkomponente
- **Step3.tsx**: Hauptkomponente, die alle anderen Komponenten zusammenführt

### UI-Komponenten
- **StationConverter.ts**: Utility für die Konvertierung zwischen Station-Typen
- **TabNavigation.tsx**: Tab-Navigation zwischen verschiedenen Ansichten
- **SummaryTab.tsx**: Zusammenfassung der Routen mit Statistiken
- **TableTab.tsx**: Detaillierte Tabelle aller Routen
- **MapTab.tsx**: Interaktive Karte mit allen Routen
- **OfflineMapTab.tsx**: Offline-Karte für die Routen
- **ExportTab.tsx**: Export-Optionen (Excel, PDF, CSV)

### Custom Hooks
- **useStep3State.ts**: Verwaltung des lokalen States (Export-Format, aktiver Tab)
- **useStep3RouteCalculation.ts**: Routenberechnung und -verwaltung

### Typen
- **types/index.ts**: TypeScript-Typdefinitionen

## Verwendung

```tsx
import { Step3 } from '@/components/wizard/Step3';

// In einer anderen Komponente
<Step3 />
```

## Features

- **Automatische Routenberechnung**: Berechnet Routen basierend auf ausgewählten Zielen
- **Mehrere Ansichten**: Zusammenfassung, Tabelle, interaktive Karte, Offline-Karte
- **Export-Funktionen**: Excel, PDF und CSV Export
- **Statistiken**: Detaillierte Statistiken zu Entfernung, Zeit, Kosten
- **Responsive Design**: Funktioniert auf allen Bildschirmgrößen
- **Dark Mode**: Unterstützung für dunkles Theme
- **Barrierefreiheit**: Vollständige Keyboard-Navigation und Screen Reader Support
- **Animationen**: Smooth Transitions mit Framer Motion
- **Fehlerbehandlung**: Robuste Fehlerbehandlung für Routenberechnung
- **Loading States**: Benutzerfreundliche Ladezustände

## Abhängigkeiten

- **XLSX**: Für Excel-Export
- **Framer Motion**: Für Animationen
- **Lucide React**: Für Icons
- **React Hot Toast**: Für Benachrichtigungen
- **MapLibre GL**: Für Karten-Funktionalität 