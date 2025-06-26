# Aufgabe: TypeScript-Interfaces & Datenstruktur für Polizeistationen

## Ziel
Lege eine zentrale TypeScript-Datei an, die die Datenstruktur für Polizeistationen, Präsidien und Reviere klar und erweiterbar abbildet. Die Typen sollen die Grundlage für alle weiteren Datenoperationen im Projekt bilden.

## Anforderungen

1. **Datei anlegen:**  
   Lege die Datei `src/types/station.types.ts` an (falls der Ordner nicht existiert, erstelle ihn).

2. **Interfaces definieren:**  
   - Definiere ein zentrales Interface `Station` mit allen relevanten Feldern:
     - `id: string`
     - `name: string`
     - `type: "praesidium" | "revier"`
     - `parentId?: string` // Für Reviere: ID des zugehörigen Präsidiums
     - `city: string`
     - `address: string`
     - `coordinates: [number, number]` // [lat, lng]
     - `telefon: string`
     - `notdienst24h: boolean`
     - `isActive: boolean` // Sichtbarkeit im Frontend/Admin
     - `lastModified: Date` // Für Audit-Logs und Änderungsverfolgung

3. **Dokumentation:**  
   - Kommentiere die Felder kurz, damit die Bedeutung klar ist.

## Hinweise
- Die Typen sollen als Grundlage für alle Datenoperationen im Frontend und Backend dienen.
- Keine Implementierung von Logik, nur Typdefinitionen!
- Keine weiteren Schritte (wie API, Store, Komponenten) in dieser Aufgabe – nur die Typen!

---

**Ergebnis:**  
Nach Ausführung dieser Aufgabe existiert eine zentrale, dokumentierte Datei `src/types/station.types.ts` mit allen benötigten Interfaces für die weitere Entwicklung. 