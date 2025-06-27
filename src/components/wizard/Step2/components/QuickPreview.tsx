import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Station } from '../types';

interface QuickPreviewProps {
  showQuickPreview: boolean;
  setShowQuickPreview: (show: boolean) => void;
  selectedStations: string[];
  setSelectedStations: (stations: string[]) => void;
  selectedCustomAddresses: string[];
  stations: Station[];
}

export const QuickPreview: React.FC<QuickPreviewProps> = ({
  showQuickPreview,
  setShowQuickPreview,
  selectedStations,
  setSelectedStations,
  selectedCustomAddresses,
  stations
}) => {
  return (
    <AnimatePresence>
      {showQuickPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm z-40"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Ausgewählte Ziele</h3>
            <button
              onClick={() => setShowQuickPreview(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {selectedStations.length === 0 && selectedCustomAddresses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Noch keine Auswahl getroffen</p>
            ) : (
              selectedStations.map(id => {
                const station = stations.find(s => s.id === id);
                return station ? (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">{station.name}</span>
                    <button
                      onClick={() => {
                        const newSelectedStations = selectedStations.filter(s => s !== id);
                        setSelectedStations(newSelectedStations);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ) : null;
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 