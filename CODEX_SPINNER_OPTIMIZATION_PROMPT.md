# CODEX AGENT AI PROMPT: Spinner & Berechnungsoptimierung

## 🎯 AUFGABE
Analysiere und optimiere die Spinner-Performance und Routenberechnungsgeschwindigkeit in der React-Anwendung, um eine nahtlose User Experience zu gewährleisten.

## 📋 ANALYSE-BEREICHE

### 1. SPINNER-PERFORMANCE OPTIMIERUNG
**Ziel**: Spinner nur so lange anzeigen wie nötig, ohne Berechnung zu verlangsamen

**Zu analysierende Komponenten**:
- `src/components/wizard/Step3/components/Step3Spinner.tsx`
- `src/components/wizard/Step3/hooks/useStep3RouteCalculation.ts`
- `src/hooks/useRoutingWorker.ts`
- Alle Loading-States in Step3-Komponenten

**Spezifische Fragen**:
- Wann wird der Spinner angezeigt/versteckt?
- Gibt es unnötige Re-Renders während der Berechnung?
- Ist der Spinner-Übergang flüssig oder ruckelt er?
- Werden Loading-States korrekt synchronisiert?

### 2. BERECHNUNGSBESCHLEUNIGUNG
**Ziel**: Maximale Beschleunigung der Routenberechnung

**Zu analysierende Bereiche**:
- `src/lib/services/routing-service.ts`
- `src/workers/routing.worker.ts`
- `src/utils/routing.ts`
- API-Call-Optimierungen
- Caching-Strategien

**Spezifische Fragen**:
- Können API-Calls weiter parallelisiert werden?
- Ist das Caching optimal implementiert?
- Gibt es Bottlenecks in der Datenverarbeitung?
- Können Berechnungen vorgeladen werden?

## 🔍 DETAILLIERTE ANALYSE-ANFORDERUNGEN

### A) SPINNER-TIMING ANALYSE
```typescript
// Analysiere diese Bereiche:
1. useEffect Dependencies in useStep3RouteCalculation
2. State-Transitions zwischen isCalculating States
3. Worker-Response-Handling
4. Fallback-Mechanismus Timing
5. Toast-Benachrichtigungen Timing
```

### B) PERFORMANCE-METRIKEN ERFASSEN
```typescript
// Implementiere Performance-Monitoring:
performance.mark('calculation-start');
performance.mark('spinner-show');
performance.mark('worker-response');
performance.mark('calculation-end');
performance.measure('total-calculation', 'calculation-start', 'calculation-end');
performance.measure('spinner-duration', 'spinner-show', 'worker-response');
```

### C) RENDERING-OPTIMIERUNGEN
```typescript
// Prüfe auf:
1. Unnötige Re-Renders während Berechnung
2. Memoization-Opportunities
3. Component-Splitting für bessere Performance
4. React.memo() Anwendung
5. useMemo() und useCallback() Optimierungen
```

## 🚀 OPTIMIERUNGS-VORSCHLÄGE ERWARTET

### 1. SPINNER-OPTIMIERUNGEN
- **Debouncing**: Verzögerte Spinner-Anzeige für kurze Berechnungen
- **Progressive Loading**: Stufenweise Anzeige von Ergebnissen
- **Skeleton Loading**: Bessere UX während Berechnung
- **Optimistic Updates**: Sofortige UI-Updates mit Fallback

### 2. BERECHNUNGS-BESCHLEUNIGUNGEN
- **Preloading**: Routen im Hintergrund vorberechnen
- **Batch-Processing**: Optimierte Chunk-Größen
- **API-Optimierungen**: Request-Bündelung, Connection-Pooling
- **Memory-Optimierungen**: Effizientere Datenstrukturen

### 3. WORKER-OPTIMIERUNGEN
- **Worker-Pool**: Mehrere Worker für parallele Verarbeitung
- **Message-Chunking**: Große Datenmengen in Chunks senden
- **Worker-Caching**: Persistentes Caching zwischen Sessions
- **Priority-Queue**: Wichtige Routen zuerst berechnen

## 📊 ERWARTETE AUSGABE

### 1. PERFORMANCE-REPORT
```markdown
## Performance-Analyse

### Aktuelle Metriken:
- Spinner-Anzeigezeit: [X]ms
- Berechnungsdauer: [X]ms
- UI-Blockierung: [X]ms
- Memory-Usage: [X]MB

### Identifizierte Bottlenecks:
1. [Beschreibung + Lösung]
2. [Beschreibung + Lösung]
3. [Beschreibung + Lösung]

### Optimierungs-Potential:
- Spinner: [X]% Verbesserung möglich
- Berechnung: [X]% Beschleunigung möglich
- Memory: [X]% Reduktion möglich
```

### 2. IMPLEMENTIERUNGS-PLAN
```markdown
## Optimierungs-Implementierung

### Phase 1: Spinner-Optimierung (Sofort)
- [ ] Debouncing implementieren
- [ ] Progressive Loading
- [ ] Skeleton Loading

### Phase 2: Berechnungs-Optimierung (Kurzfristig)
- [ ] API-Optimierungen
- [ ] Caching-Verbesserungen
- [ ] Worker-Pool

### Phase 3: Erweiterte Optimierungen (Mittelfristig)
- [ ] Preloading-System
- [ ] Advanced Caching
- [ ] Performance-Monitoring
```

### 3. CODE-OPTIMIERUNGEN
```typescript
// Erwartete Code-Verbesserungen:
1. Optimierte Hook-Implementierung
2. Verbesserte Worker-Kommunikation
3. Effizientere State-Management
4. Performance-Monitoring-Integration
```

## 🎯 SUCCESS-METRIKEN

### ZIELWERTE:
- **Spinner-Dauer**: < 100ms für kurze Berechnungen
- **Berechnungszeit**: 50% Reduktion gegenüber aktueller Implementierung
- **UI-Responsiveness**: 0ms Blockierung während Berechnung
- **Memory-Usage**: 30% Reduktion
- **User Experience**: Nahtlose Übergänge ohne Ruckeln

### MESSBARE VERBESSERUNGEN:
- [ ] Spinner erscheint nur bei Berechnungen > 200ms
- [ ] Progressive Ergebnisanzeige implementiert
- [ ] Worker-Pool für parallele Verarbeitung
- [ ] Intelligent Caching reduziert API-Calls um 70%
- [ ] Performance-Monitoring integriert

## 🔧 TECHNISCHE ANFORDERUNGEN

### COMPATIBILITÄT:
- ✅ React 18+ Support
- ✅ TypeScript-Striktheit
- ✅ Web Worker-Fallback
- ✅ Browser-Kompatibilität (Chrome 63+, Firefox 57+, Safari 11.1+)

### PERFORMANCE-STANDARDS:
- Lighthouse Score: > 90
- Core Web Vitals: Alle im grünen Bereich
- Bundle Size: < 10% Erhöhung
- Memory Leaks: 0

## 📝 ERWARTETE DELIVERABLES

1. **Performance-Analyse-Report** mit detaillierten Metriken
2. **Optimierungs-Implementierung** mit Code-Beispielen
3. **Performance-Monitoring-Setup** für kontinuierliche Überwachung
4. **Testing-Strategie** für Performance-Validierung
5. **Rollback-Plan** für sichere Implementierung

## 🎯 FOKUS-BEREICHE

### PRIORITÄT 1: Spinner-Performance
- Minimale Spinner-Anzeigezeit
- Flüssige Übergänge
- Keine UI-Blockierung

### PRIORITÄT 2: Berechnungs-Beschleunigung
- Maximale Parallelisierung
- Optimiertes Caching
- Effiziente API-Nutzung

### PRIORITÄT 3: User Experience
- Progressive Loading
- Optimistic Updates
- Nahtlose Interaktionen

---

**WICHTIG**: Fokussiere dich auf praktische, sofort umsetzbare Optimierungen, die messbare Performance-Verbesserungen bringen. Vermeide Over-Engineering und halte die Implementierung wartbar. 