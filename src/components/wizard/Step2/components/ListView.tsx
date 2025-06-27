import React from 'react';
import { motion } from 'framer-motion';
import { Building, CheckCircle2 } from 'lucide-react';
import { PraesidiumWithDetails } from '../types';

interface ListViewProps {
  filteredPraesidien: PraesidiumWithDetails[];
  selectedStations: string[];
  togglePraesidiumWithReviere: (praesidiumId: string, event?: React.MouseEvent | React.KeyboardEvent) => void;
  handleStationToggle: (stationId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  filteredPraesidien,
  selectedStations,
  togglePraesidiumWithReviere,
  handleStationToggle
}) => {
  return (
    <div className="space-y-4" role="list" aria-label="Polizeistationen Listen-Ansicht">
      {filteredPraesidien.map(praesidium => {
        const isFullySelected = [praesidium.id, ...praesidium.reviere.map(r => r.id)]
          .every(id => selectedStations.includes(id));

        return (
          <motion.div
            key={praesidium.id}
            layout
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all ${
              isFullySelected
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700'
            }`}
            role="listitem"
          >
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              role="button"
              tabIndex={0}
              aria-label={`${praesidium.name}, ${praesidium.reviere.length} Reviere`}
              onClick={(e) => togglePraesidiumWithReviere(praesidium.id, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  togglePraesidiumWithReviere(praesidium.id, e);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {praesidium.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {praesidium.city} • {praesidium.reviere.length} Reviere
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {praesidium.selectedCount > 0 && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {praesidium.selectedCount} ausgewählt
                    </span>
                  )}
                  <CheckCircle2
                    className={`h-6 w-6 transition-all ${
                      isFullySelected
                        ? 'text-blue-500 scale-110'
                        : 'text-gray-300 scale-100'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Reviere in List View */}
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-2" role="region" aria-label={`Reviere von ${praesidium.name}`}>
              {praesidium.reviere.map(revier => (
                <motion.div
                  key={revier.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                    selectedStations.includes(revier.id)
                      ? 'bg-blue-100 dark:bg-blue-800/30'
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                        ? 'text-blue-500'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 