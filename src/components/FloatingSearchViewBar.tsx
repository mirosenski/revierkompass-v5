import React from 'react'
import { Search, LayoutGrid, LayoutList, Mic, Command } from 'lucide-react'
import { motion } from 'framer-motion'

interface FloatingSearchViewBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeView: 'grid' | 'map' | 'list'
  setActiveView: (view: 'grid' | 'map' | 'list') => void
  handleVoiceCommand: () => void
  setShowCommandPalette: (show: boolean) => void
}

const FloatingSearchViewBarComponent: React.FC<FloatingSearchViewBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeView,
  setActiveView,
  handleVoiceCommand,
  setShowCommandPalette
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Suchfeld */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Suche nach Präsidien, Revieren oder Adressen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 ring-blue-500 transition-all"
          />
        </div>

        {/* Ansicht-Schalter und Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveView('grid')}
              aria-label="Rasteransicht"
              aria-pressed={activeView === 'grid'}
              className={`p-2 rounded-md transition-all ${
                activeView === 'grid'
                  ? 'bg-white dark:bg-gray-800 shadow text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Rasteransicht"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveView('list')}
              aria-label="Listenansicht"
              aria-pressed={activeView === 'list'}
              className={`p-2 rounded-md transition-all ${
                activeView === 'list'
                  ? 'bg-white dark:bg-gray-800 shadow text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Listenansicht"
            >
              <LayoutList className="h-5 w-5" />
            </button>
          </div>

          {/* Sprach- und Befehle-Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceCommand}
              className="flex items-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Sprachsteuerung"
            >
              <Mic className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Sprache</span>
            </button>

            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Befehle (⌘ + K)"
            >
              <Command className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">Befehle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const FloatingSearchViewBar = React.memo(FloatingSearchViewBarComponent)
export default FloatingSearchViewBar

