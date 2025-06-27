import React from 'react';
import { Search, Grid3X3, List, Map as MapIcon } from 'lucide-react';
import { ViewType } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  showQuickPreview: boolean;
  setShowQuickPreview: (show: boolean) => void;
  totalSelected: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeView,
  setActiveView,
  showQuickPreview,
  setShowQuickPreview,
  totalSelected
}) => {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ziele auswählen
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Wählen Sie Polizeistationen und eigene Adressen für die Routenberechnung
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Suche nach Präsidien, Revieren oder Städten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500"
          aria-label="Suche nach Stationen und Adressen"
        />
      </div>

      {/* View Switcher */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
        <div className="flex flex-wrap items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm" role="group" aria-label="Ansicht wechseln">
          {[
            { view: 'grid' as ViewType, icon: Grid3X3, label: 'Raster' },
            { view: 'list' as ViewType, icon: List, label: 'Liste' },
            { view: 'map' as ViewType, icon: MapIcon, label: 'Karte' }
          ].map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                activeView === view
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-pressed={activeView === view}
              aria-label={`${label}-Ansicht`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center mt-2 sm:mt-0">
          <button
            onClick={() => setShowQuickPreview(!showQuickPreview)}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md border ${
              showQuickPreview
                ? 'bg-blue-500 text-white border-blue-600 shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-lg'
            }`}
            aria-pressed={showQuickPreview}
            aria-label="Vorschau der ausgewählten Ziele"
          >
            <span className="text-sm sm:text-base">Vorschau</span>
            {totalSelected > 0 && (
              <span className="ml-1 sm:ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-medium shadow-sm">
                {totalSelected}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 