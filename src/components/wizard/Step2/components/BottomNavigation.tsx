import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PraesidiumWithDetails } from '../types';

interface BottomNavigationProps {
  totalSelected: number;
  selectedStations: string[];
  selectedCustomAddresses: string[];
  praesidiumWithReviere: PraesidiumWithDetails[];
  setSelectedStations: (stations: string[]) => void;
  setSelectedCustomAddresses: (addresses: string[]) => void;
  handleContinue: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  totalSelected,
  selectedStations,
  selectedCustomAddresses,
  praesidiumWithReviere,
  setSelectedStations,
  setSelectedCustomAddresses,
  handleContinue
}) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Stats Summary */}
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {totalSelected}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Ziele ausgewählt
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedStations.length} Stationen • {selectedCustomAddresses.length} Adressen
                </p>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedStations([]);
                  setSelectedCustomAddresses([]);
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Zurücksetzen
              </button>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <button
                onClick={() => {
                  const allIds = praesidiumWithReviere.flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
                  setSelectedStations(allIds);
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Alle auswählen
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={totalSelected === 0}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 shadow-lg ${
              totalSelected > 0
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>Routenberechnung starten</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}; 