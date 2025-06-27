import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, ChevronDown, CheckCircle2 } from 'lucide-react';
import { PraesidiumWithDetails } from '../types';

interface GridViewProps {
  filteredPraesidien: PraesidiumWithDetails[];
  selectedStations: string[];
  expandedPraesidien: Set<string>;
  togglePraesidiumWithReviere: (praesidiumId: string, event?: React.MouseEvent | React.KeyboardEvent) => void;
  togglePraesidiumExpansion: (praesidiumId: string) => void;
  handleStationToggle: (stationId: string) => void;
}

export const GridView: React.FC<GridViewProps> = ({
  filteredPraesidien,
  selectedStations,
  expandedPraesidien,
  togglePraesidiumWithReviere,
  togglePraesidiumExpansion,
  handleStationToggle
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="grid" aria-label="Polizeistationen Grid-Ansicht">
      {filteredPraesidien.map(praesidium => {
        const isFullySelected = [praesidium.id, ...praesidium.reviere.map(r => r.id)]
          .every(id => selectedStations.includes(id));
        const isPartiallySelected = praesidium.selectedCount > 0 && !isFullySelected;

        return (
          <motion.div
            key={praesidium.id}
            layout
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
              isFullySelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                : isPartiallySelected
                ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
            }`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            role="gridcell"
          >
            {/* Selection Indicator */}
            {(isFullySelected || isPartiallySelected) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              >
                {isFullySelected ? '✓' : praesidium.selectedCount}
              </motion.div>
            )}

            {/* Card Content */}
            <div
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-expanded={expandedPraesidien.has(praesidium.id)}
              aria-label={`${praesidium.name}, ${praesidium.reviere.length} Reviere`}
              onClick={(e) => togglePraesidiumWithReviere(praesidium.id, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  togglePraesidiumWithReviere(praesidium.id, e);
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {praesidium.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {praesidium.city}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {praesidium.reviere.length} Reviere
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePraesidiumExpansion(praesidium.id);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={`${expandedPraesidien.has(praesidium.id) ? 'Reviere ausblenden' : 'Reviere anzeigen'} für ${praesidium.name}`}
                >
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      expandedPraesidien.has(praesidium.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Expandable Reviere */}
            <AnimatePresence>
              {expandedPraesidien.has(praesidium.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2"
                  role="region"
                  aria-label={`Reviere von ${praesidium.name}`}
                >
                  {praesidium.reviere.map(revier => (
                    <motion.div
                      key={revier.id}
                      whileHover={{ x: 4 }}
                      className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                        selectedStations.includes(revier.id)
                          ? 'bg-blue-100 dark:bg-blue-800/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStationToggle(revier.id);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selectedStations.includes(revier.id)}
                      aria-label={`${revier.name} ${selectedStations.includes(revier.id) ? 'ausgewählt' : 'nicht ausgewählt'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStationToggle(revier.id);
                        }
                      }}
                    >
                      <span className="text-sm font-medium">{revier.name}</span>
                      <CheckCircle2
                        className={`h-4 w-4 transition-all ${
                          selectedStations.includes(revier.id)
                            ? 'text-blue-500 scale-110'
                            : 'text-gray-300 scale-100'
                        }`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}; 