import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, MapPin } from 'lucide-react';
import { TabConfig } from '../types';

interface TabNavigationProps {
  activeTab: 'stations' | 'custom';
  setActiveTab: (tab: 'stations' | 'custom') => void;
  selectedStations: string[];
  selectedCustomAddresses: string[];
  children: React.ReactNode;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  selectedStations,
  selectedCustomAddresses,
  children
}) => {
  const tabs: TabConfig[] = [
    {
      id: 'stations',
      label: 'Stationen',
      icon: Building,
      count: selectedStations.length
    },
    {
      id: 'custom',
      label: 'Eigene Adressen',
      icon: MapPin,
      count: selectedCustomAddresses.length
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
      <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Ziel-Kategorien">
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
              {tab.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
}; 