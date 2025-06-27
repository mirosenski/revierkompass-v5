import React from 'react';
import { BarChart3, Map, WifiOff, Table, Download } from 'lucide-react';
import { Tab } from '../types';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab
}) => {
  const tabs: Tab[] = [
    { id: 'summary', label: 'Zusammenfassung', icon: BarChart3 },
    { id: 'map', label: 'Interaktive Karte', icon: Map },
    { id: 'offline-map', label: 'Offline-Karte', icon: WifiOff },
    { id: 'table', label: 'Detaillierte Tabelle', icon: Table },
    { id: 'export', label: 'Export-Optionen', icon: Download }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
      <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Ergebnis-Kategorien">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-3 py-6 px-4 font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 