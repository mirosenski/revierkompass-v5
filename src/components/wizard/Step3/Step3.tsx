import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { useWizardStore } from '@/store/useWizardStore';

// Components
import { TabNavigation } from './components/TabNavigation';
import { SummaryTab } from './components/SummaryTab';
import { TableTab } from './components/TableTab';
import { MapTab } from './components/MapTab';
import { OfflineMapTab } from './components/OfflineMapTab';
import { ExportTab } from './components/ExportTab';
import Step3Spinner from './components/Step3Spinner';

// Hooks
import { useStep3State } from './hooks/useStep3State';
import { useStep3RouteCalculation } from './hooks/useStep3RouteCalculation';

// Local NoSelectionWarning component
const NoSelectionWarning: React.FC = () => (
  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p>Keine Ziele ausgewählt.</p>
    <p className="text-sm">Bitte wählen Sie Stationen oder Adressen in Schritt 2 aus.</p>
  </div>
);

export const Step3: React.FC = () => {
  const { wizard: { startAddress } } = useAppStore();
  const { selectedStations, selectedCustomAddresses } = useWizardStore();

  // Local state
  const {
    exportFormat,
    setExportFormat,
    activeTab,
    setActiveTab
  } = useStep3State();

  // Route calculation
  const {
    routeResults,
    isCalculating,
    error
  } = useStep3RouteCalculation();

  // Check if we have the required data
  if (!startAddress) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine Startadresse ausgewählt.</p>
        <p className="text-sm">Bitte geben Sie eine Startadresse in Schritt 1 ein.</p>
      </div>
    );
  }

  if (!selectedStations?.length && !selectedCustomAddresses?.length) {
    return <NoSelectionWarning />;
  }

  const results = routeResults || [];
  const startCoordinates = startAddress?.coordinates || { lat: 0, lng: 0 };

  if (isCalculating) {
    return <Step3Spinner text="Routen werden berechnet..." />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            id="panel-summary"
            aria-label="Zusammenfassung"
          >
            <SummaryTab results={results} isCalculating={isCalculating} />
          </motion.div>
        );

      case 'table':
        return (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            id="panel-table"
            aria-label="Detaillierte Tabelle"
          >
            <TableTab results={results} />
          </motion.div>
        );

      case 'map':
        return (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            id="panel-map"
            aria-label="Interaktive Karte"
          >
            <MapTab 
              routeResults={results}
              startAddress={startAddress.fullAddress}
              startCoordinates={startCoordinates}
            />
          </motion.div>
        );

      case 'offline-map':
        return (
          <motion.div
            key="offline-map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            id="panel-offline-map"
            aria-label="Offline-Karte"
          >
            <OfflineMapTab 
              routeResults={results}
              startAddress={startAddress.fullAddress}
              startCoordinates={startCoordinates}
            />
          </motion.div>
        );

      case 'export':
        return (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            id="panel-export"
            aria-label="Export-Optionen"
          >
            <ExportTab 
              results={results}
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Routenanalyse & Export
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analysieren Sie Ihre Routen und exportieren Sie die Ergebnisse
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Step3; 