import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import toast from 'react-hot-toast';

// Components
import { ErrorBoundary } from '../../ui/ErrorBoundary';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { GridView } from './components/GridView';
import { ListView } from './components/ListView';
import { MapView } from './components/MapView';
import { CustomAddresses } from './components/CustomAddresses';
import { QuickPreview } from './components/QuickPreview';
import { BottomNavigation } from './components/BottomNavigation';

// Hooks
import { useStep2State } from './hooks/useStep2State';
import { useStep2Data } from './hooks/useStep2Data';
import { useStep2Handlers } from './hooks/useStep2Handlers';

const Step2: React.FC = () => {
  // Store-Hooks
  const { selectedStations, setSelectedStations, selectedCustomAddresses, setSelectedCustomAddresses } = useWizardStore();
  const { setWizardStep } = useAppStore();

  // Local state
  const {
    activeView,
    setActiveView,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showAddForm,
    setShowAddForm,
    expandedPraesidien,
    setExpandedPraesidien,
    showQuickPreview,
    setShowQuickPreview,
    lastSelectedId,
    setLastSelectedId,
    formData,
    setFormData,
    resetStates
  } = useStep2State();

  // Data processing
  const {
    stations,
    customAddresses,
    praesidiumWithReviere,
    filteredPraesidien,
    totalSelected
  } = useStep2Data(searchQuery, expandedPraesidien, selectedStations);

  // Event handlers
  const {
    togglePraesidiumWithReviere,
    togglePraesidiumExpansion,
    handleStationToggle,
    handleCustomToggle,
    handleAddAddress,
    handleDeleteAddress,
    handleContinue
  } = useStep2Handlers(
    selectedStations,
    setSelectedStations,
    selectedCustomAddresses,
    setSelectedCustomAddresses,
    setExpandedPraesidien,
    setLastSelectedId,
    formData,
    setFormData,
    setShowAddForm,
    praesidiumWithReviere
  );

  // Reset-Handler
  useEffect(() => {
    const handleGlobalReset = () => resetStates();
    window.addEventListener('revierkompass:reset', handleGlobalReset);
    return () => {
      window.removeEventListener('revierkompass:reset', handleGlobalReset);
    };
  }, [resetStates]);

  useEffect(() => {
    setSearchQuery('');
  }, []);

  const handleReset = () => {
    resetStates();
    toast.success('Neustart durchgeführt - alle Einstellungen zurückgesetzt');
  };

  return (
    <ErrorBoundary>
      <div 
        className="space-y-6"
        role="main"
        aria-label="Ziele auswählen für Routenberechnung"
      >
        {/* Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeView={activeView}
          setActiveView={setActiveView}
          showQuickPreview={showQuickPreview}
          setShowQuickPreview={setShowQuickPreview}
          totalSelected={totalSelected}
        />

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedStations={selectedStations}
          selectedCustomAddresses={selectedCustomAddresses}
        >
          {activeTab === 'stations' && (
            <motion.div
              key="stations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              role="tabpanel"
              id="panel-stations"
              aria-label="Polizeistationen"
            >
              {activeView === 'grid' && (
                <GridView
                  filteredPraesidien={filteredPraesidien}
                  selectedStations={selectedStations}
                  expandedPraesidien={expandedPraesidien}
                  togglePraesidiumWithReviere={togglePraesidiumWithReviere}
                  togglePraesidiumExpansion={togglePraesidiumExpansion}
                  handleStationToggle={handleStationToggle}
                />
              )}
              {activeView === 'list' && (
                <ListView
                  filteredPraesidien={filteredPraesidien}
                  selectedStations={selectedStations}
                  togglePraesidiumWithReviere={togglePraesidiumWithReviere}
                  handleStationToggle={handleStationToggle}
                />
              )}
              {activeView === 'map' && <MapView />}
            </motion.div>
          )}

          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              role="tabpanel"
              id="panel-custom"
              aria-label="Eigene Adressen"
            >
              <CustomAddresses
                customAddresses={customAddresses}
                selectedCustomAddresses={selectedCustomAddresses}
                searchQuery={searchQuery}
                showAddForm={showAddForm}
                formData={formData}
                setShowAddForm={setShowAddForm}
                setFormData={setFormData}
                handleCustomToggle={handleCustomToggle}
                handleAddAddress={handleAddAddress}
                handleDeleteAddress={handleDeleteAddress}
              />
            </motion.div>
          )}
        </TabNavigation>

        {/* Quick Preview */}
        <QuickPreview
          showQuickPreview={showQuickPreview}
          setShowQuickPreview={setShowQuickPreview}
          selectedStations={selectedStations}
          setSelectedStations={setSelectedStations}
          selectedCustomAddresses={selectedCustomAddresses}
          stations={stations}
        />

        {/* Bottom Navigation */}
        <BottomNavigation
          totalSelected={totalSelected}
          selectedStations={selectedStations}
          selectedCustomAddresses={selectedCustomAddresses}
          praesidiumWithReviere={praesidiumWithReviere}
          setSelectedStations={setSelectedStations}
          setSelectedCustomAddresses={setSelectedCustomAddresses}
          handleContinue={handleContinue}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Step2; 