// UltraModernStep2.tsx (Komplett überarbeitet)
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, MapPin, ChevronDown, Plus, CheckCircle2, Trash2,
  List, Grid3X3, Map as MapIcon, X, Search, ArrowRight
} from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import toast from 'react-hot-toast';

// TypeScript-Typen
interface Station {
  id: string;
  name: string;
  city: string;
  type: string;
}

interface PraesidiumWithDetails extends Station {
  reviere: Station[];
  isExpanded: boolean;
  selectedCount: number;
}

interface CustomAddress {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Etwas ist schief gelaufen
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const UltraModernStep2: React.FC = () => {
  // States
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'map'>('grid');
  const [activeTab, setActiveTab] = useState<'stations' | 'custom'>('stations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPraesidien, setExpandedPraesidien] = useState<Set<string>>(new Set());
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  // Store-Hooks
  const { stations, getStationsByType, getReviereByPraesidium, loadStations } = useStationStore();
  const { selectedStations, setSelectedStations, selectedCustomAddresses, setSelectedCustomAddresses } = useWizardStore();
  const { customAddresses, addCustomAddress, deleteCustomAddress, setWizardStep } = useAppStore();
  
  useEffect(() => {
    console.log('UltraModernStep2: Loading stations...');
    loadStations();
    
    // Reset aller States bei Neustart/Seitenneuladeung
    const resetOnStart = () => {
      console.log('UltraModernStep2: Resetting states on start...');
      setSearchQuery('');
      setActiveView('grid');
      setActiveTab('stations');
      setShowAddForm(false);
      setExpandedPraesidien(new Set());
      setShowQuickPreview(false);
      setLastSelectedId(null);
      setFormData({ name: '', street: '', zipCode: '', city: '' });
      
      // Optional: Auch die Auswahl zurücksetzen
      // setSelectedStations([]);
      // setSelectedCustomAddresses([]);
    };
    
    // Reset beim ersten Laden
    resetOnStart();
    
    // Optional: Reset bei Seitenneuladeung (wenn gewünscht)
    const handleBeforeUnload = () => {
      // Hier könnte man noch zusätzliche Cleanup-Logik hinzufügen
      console.log('UltraModernStep2: Page unloading, cleanup...');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loadStations]);
  
  // PERFORMANCE: Memoized Berechnungen
  const praesidien = useMemo(() => {
    const result = getStationsByType('praesidium');
    console.log('UltraModernStep2: Praesidien loaded:', result.length, result);
    return result;
  }, [getStationsByType]);
  
  const praesidiumWithReviere: PraesidiumWithDetails[] = useMemo(() => {
    const result = praesidien.map(praesidium => ({
      ...praesidium,
      reviere: getReviereByPraesidium(praesidium.id),
      isExpanded: expandedPraesidien.has(praesidium.id),
      selectedCount: getReviereByPraesidium(praesidium.id).filter(r => selectedStations.includes(r.id)).length
    }));
    console.log('UltraModernStep2: PraesidiumWithReviere:', result.length, result);
    return result;
  }, [praesidien, getReviereByPraesidium, expandedPraesidien, selectedStations]);

  // PERFORMANCE: Optimierte Filterung mit Memoization
  const filteredPraesidien = useMemo(() => {
    const result = praesidiumWithReviere.filter(p => 
      searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    console.log('UltraModernStep2: FilteredPraesidien:', result.length, result);
    return result;
  }, [praesidiumWithReviere, searchQuery]);

  // PERFORMANCE: Memoized Tabs
  const tabs = useMemo(() => [
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
  ], [selectedStations.length, selectedCustomAddresses.length]);

  // PERFORMANCE: Callback-Funktionen
  const togglePraesidiumWithReviere = useCallback((praesidiumId: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    const praesidium = praesidiumWithReviere.find(p => p.id === praesidiumId);
    if (!praesidium) return;

    const reviereIds = praesidium.reviere.map(r => r.id);
    const allIds = [praesidiumId, ...reviereIds];
    const allSelected = allIds.every(id => selectedStations.includes(id));

    // Multi-Select mit Strg/Cmd-Taste
    if (event && (event.ctrlKey || event.metaKey)) {
      if (allSelected) {
        setSelectedStations(selectedStations.filter(id => !allIds.includes(id)));
        toast.success(`${praesidium.name} abgewählt`);
      } else {
        setSelectedStations([...new Set([...selectedStations, ...allIds])]);
        toast.success(`${praesidium.name} mit allen Revieren ausgewählt`);
      }
      setLastSelectedId(praesidiumId);
      return;
    }

    // Normales Toggle-Verhalten
    if (allSelected) {
      setSelectedStations(selectedStations.filter(id => !allIds.includes(id)));
      toast.success(`${praesidium.name} abgewählt`);
    } else {
      setSelectedStations([...new Set([...selectedStations, ...allIds])]);
      toast.success(`${praesidium.name} mit allen Revieren ausgewählt`);
    }
  }, [praesidiumWithReviere, selectedStations, setSelectedStations]);

  const togglePraesidiumExpansion = useCallback((praesidiumId: string) => {
    setExpandedPraesidien(prev => {
      const newSet = new Set(prev);
      if (newSet.has(praesidiumId)) {
        newSet.delete(praesidiumId);
      } else {
        newSet.add(praesidiumId);
      }
      return newSet;
    });
  }, []);

  const handleStationToggle = useCallback((stationId: string) => {
    if (selectedStations.includes(stationId)) {
      setSelectedStations(selectedStations.filter(id => id !== stationId));
    } else {
      setSelectedStations([...selectedStations, stationId]);
    }
  }, [selectedStations, setSelectedStations]);

  const handleCustomToggle = useCallback((addressId: string) => {
    if (selectedCustomAddresses.includes(addressId)) {
      setSelectedCustomAddresses(selectedCustomAddresses.filter(id => id !== addressId));
    } else {
      setSelectedCustomAddresses([...selectedCustomAddresses, addressId]);
    }
  }, [selectedCustomAddresses, setSelectedCustomAddresses]);

  const handleAddAddress = useCallback(() => {
    if (!formData.name || !formData.street || !formData.zipCode || !formData.city) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    addCustomAddress({
      name: formData.name,
      street: formData.street,
      zipCode: formData.zipCode,
      city: formData.city
    });
    
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    setShowAddForm(false);
    toast.success('Adresse erfolgreich hinzugefügt');
  }, [formData, addCustomAddress]);

  const handleDeleteAddress = useCallback((addressId: string) => {
    deleteCustomAddress(addressId);
    setSelectedCustomAddresses(selectedCustomAddresses.filter(id => id !== addressId));
    toast.success('Adresse gelöscht');
  }, [deleteCustomAddress, selectedCustomAddresses, setSelectedCustomAddresses]);

  // Berechnete Werte
  const totalSelected = selectedStations.length + selectedCustomAddresses.length;

  const handleContinue = useCallback(() => {
    if (totalSelected === 0) {
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      return;
    }
    setWizardStep(3);
  }, [totalSelected, setWizardStep]);

  // Reset-Funktion für Neustart
  const handleReset = useCallback(() => {
    console.log('UltraModernStep2: Manual reset triggered');
    setSearchQuery('');
    setActiveView('grid');
    setActiveTab('stations');
    setShowAddForm(false);
    setExpandedPraesidien(new Set());
    setShowQuickPreview(false);
    setLastSelectedId(null);
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    
    // Optional: Auch die Auswahl zurücksetzen
    // setSelectedStations([]);
    // setSelectedCustomAddresses([]);
    
    toast.success('Neustart durchgeführt - alle Einstellungen zurückgesetzt');
  }, []);

  // Debug-Log
  console.log('UltraModernStep2: Rendering with filteredPraesidien:', filteredPraesidien.length);

  // Erweiterte Quick Preview
  const QuickPreview = () => (
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
              <>
                {selectedStations.map(id => {
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
                        onClick={() => setSelectedStations(selectedStations.filter(s => s !== id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ) : null;
                })}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="grid" aria-label="Polizeistationen Grid-Ansicht">
      {filteredPraesidien.map((praesidium) => {
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

  // List View Component
  const ListView = () => (
    <div className="space-y-4" role="list" aria-label="Polizeistationen Listen-Ansicht">
      {filteredPraesidien.map((praesidium) => {
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

            {/* Reviere immer sichtbar in List View */}
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

  // Map View Component (Placeholder)
  const MapView = () => (
    <div className="relative h-[600px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Kartenansicht kommt bald</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Interaktive Karte mit allen Präsidien und Revieren
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
        role="main"
        aria-label="Ziele auswählen für Routenberechnung"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          {/* Header */}
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
              
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedStations.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stationen</p>
                </div>
                <div className="h-12 w-px bg-gray-300 dark:bg-gray-700" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedCustomAddresses.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Adressen</p>
                </div>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm" role="group" aria-label="Ansicht wechseln">
                <button
                  onClick={() => setActiveView('grid')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    activeView === 'grid'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={activeView === 'grid'}
                  aria-label="Grid-Ansicht"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>Raster</span>
                </button>
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    activeView === 'list'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={activeView === 'list'}
                  aria-label="Listen-Ansicht"
                >
                  <List className="h-4 w-4" />
                  <span>Liste</span>
                </button>
                <button
                  onClick={() => setActiveView('map')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    activeView === 'map'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={activeView === 'map'}
                  aria-label="Karten-Ansicht"
                >
                  <MapIcon className="h-4 w-4" />
                  <span>Karte</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* Neustart Button */}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white transition-all"
                  aria-label="Neustart - Alle Einstellungen zurücksetzen"
                >
                  <X className="h-4 w-4" />
                  <span>Neustart</span>
                </button>

                {/* Quick Preview Toggle */}
                <button
                  onClick={() => setShowQuickPreview(!showQuickPreview)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                    showQuickPreview
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={showQuickPreview}
                  aria-label="Vorschau der ausgewählten Ziele"
                >
                  <span>Vorschau</span>
                  {totalSelected > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {totalSelected}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label="Ziel-Kategorien">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'stations' | 'custom')}
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
                    {activeView === 'grid' && <GridView />}
                    {activeView === 'list' && <ListView />}
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
                    className="space-y-6"
                    role="tabpanel"
                    id="panel-custom"
                    aria-label="Eigene Adressen"
                  >
                    {/* Add Address Button */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Eigene Adressen verwalten
                      </h3>
                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Neue Adresse</span>
                      </button>
                    </div>

                    {/* Add Form */}
                    <AnimatePresence>
                      {showAddForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                        >
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Neue Adresse hinzufügen
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name/Bezeichnung
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="z.B. Büro, Zuhause"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Straße
                              </label>
                              <input
                                type="text"
                                value={formData.street}
                                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                placeholder="z.B. Musterstraße 123"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                PLZ
                              </label>
                              <input
                                type="text"
                                value={formData.zipCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                                placeholder="z.B. 70173"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Stadt
                              </label>
                              <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="z.B. Stuttgart"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-4">
                            <button
                              onClick={handleAddAddress}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Hinzufügen
                            </button>
                            <button
                              onClick={() => {
                                setShowAddForm(false);
                                setFormData({ name: '', street: '', zipCode: '', city: '' });
                              }}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                              Abbrechen
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Custom Addresses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {customAddresses.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Noch keine eigenen Adressen vorhanden.</p>
                          <p className="text-sm">Fügen Sie Ihre erste Adresse hinzu!</p>
                        </div>
                      ) : (
                        customAddresses
                          .filter(addr => 
                            searchQuery === '' || 
                            addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            addr.street.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((address) => (
                            <motion.div
                              key={address.id}
                              layout
                              className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                                selectedCustomAddresses.includes(address.id) 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-md'
                              }`}
                              onClick={() => handleCustomToggle(address.id)}
                              role="button"
                              tabIndex={0}
                              aria-pressed={selectedCustomAddresses.includes(address.id)}
                              aria-label={`${address.name} ${selectedCustomAddresses.includes(address.id) ? 'ausgewählt' : 'nicht ausgewählt'}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleCustomToggle(address.id);
                                }
                              }}
                              whileHover={{ y: -4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {/* Selection Indicator */}
                              {selectedCustomAddresses.includes(address.id) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                                >
                                  ✓
                                </motion.div>
                              )}

                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {address.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {address.street}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {address.zipCode} {address.city}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAddress(address.id);
                                  }}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 transition-colors"
                                  aria-label={`${address.name} löschen`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Preview */}
          <QuickPreview />
        </div>

        {/* Moderne Sticky Bottom Navigation */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Stats Summary */}
              <div className="flex items-center space-x-6">
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
                      toast.success('Auswahl zurückgesetzt');
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
                      toast.success('Alle Stationen ausgewählt');
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
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 shadow-lg ${
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
      </div>
    </ErrorBoundary>
  );
};

export default UltraModernStep2;

// Wrapper-Komponente für Error Boundary
export const StationSelectionWrapper: React.FC = () => {
  return (
    <ErrorBoundary>
      <UltraModernStep2 />
    </ErrorBoundary>
  );
};