#!/bin/bash

echo "🚀 RevierKompass wird gestartet..."
echo "📍 Adressen-Startseite wird automatisch geladen"
echo ""

# Stoppe alle laufenden Vite-Prozesse
echo "🛑 Stoppe laufende Server..."
pkill -f "vite" || true
sleep 2

# Lösche den Browser-Cache (optional)
echo "🧹 Lösche Browser-Cache..."
rm -rf node_modules/.vite-temp || true

# Starte den Entwicklungsserver
echo "⚡ Starte Entwicklungsserver..."
npm run dev

echo ""
echo "✅ RevierKompass läuft auf http://localhost:5173 (oder höherem Port)"
echo "🎯 Die Anwendung startet immer mit der Adressen-Startseite!" 