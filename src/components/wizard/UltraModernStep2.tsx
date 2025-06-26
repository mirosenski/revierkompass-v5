// UltraModernStep2.tsx (Komplett überarbeitet)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, MapPin, ChevronDown, Search,
  LayoutGrid, LayoutList, Plus, Mic, Command, CheckCircle2, Trash2, Users, ArrowRight
} from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import ModernNavigation from '../ModernNavigation';
import toast from 'react-hot-toast';

const UltraModernStep2: React.FC = () => {
  // States
  const [activeView, setActiveView] = useState<'grid' | 'map' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'stations' | 'custom'>('stations');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedPraesidien, setExpandedPraesidien] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  // Store-Hooks
  const { stations, getStationsByType, getReviereByPraesidium, loadStations } = useStationStore();
  const { selectedStations, setSelectedStations, selectedCustomAddresses, setSelectedCustomAddresses, setStep } = useWizardStore();
  const { customAddresses, addCustomAddress, deleteCustomAddress, setWizardStep } = useAppStore();
  
  // Load stations on mount
  useEffect(() => {
    console.log('🔄 Lade Stationen...');
    loadStations();
  }, [loadStations]);
  
  // Präsidien mit Revieren
  const praesidien = getStationsByType('praesidium');
  const praesidiumWithReviere = praesidien.map(praesidium => ({
    ...praesidium,
    reviere: getReviereByPraesidium(praesidium.id),
    isExpanded: expandedPraesidien.has(praesidium.id)
  }));

  // Debug: Log wenn Stationen geladen sind
  useEffect(() => {
    console.log('📊 Stationen geladen:', stations.length);
    console.log('📊 Präsidien:', praesidien.length);
    console.log('📊 Ausgewählte Stationen:', selectedStations.length);
    console.log('📊 Ausgewählte Custom Addresses:', selectedCustomAddresses.length);
  }, [stations, praesidien, selectedStations, selectedCustomAddresses]);

  // Toggle für Präsidium mit allen Revieren
  const togglePraesidiumWithReviere = (praesidiumId: string) => {
    const praesidium = praesidiumWithReviere.find(p => p.id === praesidiumId);
    if (!praesidium) return;

    const reviereIds = praesidium.reviere.map(r => r.id);
    const allIds = [praesidiumId, ...reviereIds];
    
    // Prüfen ob bereits alle ausgewählt sind
    const allSelected = allIds.every(id => selectedStations.includes(id));
    
    if (allSelected) {
      setSelectedStations(selectedStations.filter(id => !allIds.includes(id)));
    } else {
      setSelectedStations([...selectedStations.filter(id => !allIds.includes(id)), ...allIds]);
    }
  };

  // Einzelne Station umschalten
  const handleStationToggle = (stationId: string) => {
    if (selectedStations.includes(stationId)) {
      setSelectedStations(selectedStations.filter(id => id !== stationId));
    } else {
      setSelectedStations([...selectedStations, stationId]);
    }
  };

  // Toggle Dropdown für Präsidium
  const togglePraesidiumExpansion = (praesidiumId: string) => {
    const newExpanded = new Set(expandedPraesidien);
    if (newExpanded.has(praesidiumId)) {
      newExpanded.delete(praesidiumId);
    } else {
      newExpanded.add(praesidiumId);
    }
    setExpandedPraesidien(newExpanded);
  };

  // Custom Address Toggle
  const handleCustomToggle = (addressId: string) => {
    if (selectedCustomAddresses.includes(addressId)) {
      setSelectedCustomAddresses(selectedCustomAddresses.filter(id => id !== addressId));
    } else {
      setSelectedCustomAddresses([...selectedCustomAddresses, addressId]);
    }
  };

  // Add Custom Address
  const handleAddAddress = () => {
    if (!formData.name.trim() || !formData.street.trim() || !formData.zipCode.trim() || !formData.city.trim()) {
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
  };

  // Delete Custom Address
  const handleDeleteAddress = (addressId: string) => {
    deleteCustomAddress(addressId);
    const updated = selectedCustomAddresses.filter(id => id !== addressId);
    setSelectedCustomAddresses(updated);
    toast.success('Adresse gelöscht');
  };

  // Voice Commands
  const handleVoiceCommand = (command: string) => {
    console.log("Voice command:", command);
    toast.success(`Sprachbefehl erkannt: ${command}`);
  };

  // Command Handler
  const handleCommand = (command: string) => {
    if (command.startsWith('selectPraesidium:')) {
      const praesidiumId = command.split(':')[1];
      togglePraesidiumWithReviere(praesidiumId);
    } else if (command === 'selectAllStuttgart') {
      const stuttgartPraesidien = praesidiumWithReviere.filter(p => 
        p.city.toLowerCase().includes('stuttgart')
      );
      const allIds = stuttgartPraesidien.flatMap(p => [
        p.id, 
        ...p.reviere.map(r => r.id)
      ]);
      setSelectedStations([...new Set([...selectedStations, ...allIds])]);
    }
    setShowCommandPalette(false);
  };

  // Weiter zum nächsten Schritt
  const handleContinue = () => {
    console.log('🚀 Continue-Button geklickt');
    console.log('📊 selectedStations:', selectedStations);
    console.log('📊 selectedCustomAddresses:', selectedCustomAddresses);
    
    const totalSelected = selectedStations.length + selectedCustomAddresses.length;
    console.log('📊 Total selected:', totalSelected);
    
    if (totalSelected === 0) {
      console.log('❌ Keine Ziele ausgewählt');
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      return;
    }
    
    console.log('✅ Weiterleitung zu Step 3');
    toast.success(`${totalSelected} Ziele ausgewählt`);
    setWizardStep(3); // Korrigiert für korrekte Navigation
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs = [
    {
      id: 'stations',
      label: 'Polizeistationen',
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

  const totalSelected = selectedStations.length + selectedCustomAddresses.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header mit Such- und Ansichts-Optionen */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Suche nach Präsidien, Revieren oder Adressen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 ring-blue-500 transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Switcher */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 rounded-md transition-all ${
                activeView === 'grid' 
                  ? 'bg-white dark:bg-gray-800 shadow text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Rasteransicht"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-md transition-all ${
                activeView === 'list' 
                  ? 'bg-white dark:bg-gray-800 shadow text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Listenansicht"
            >
              <LayoutList className="h-5 w-5" />
            </button>
          </div>
          
          {/* Voice Command Button */}
          <button
            onClick={() => handleVoiceCommand('test')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Sprachsteuerung"
          >
            <Mic className="h-5 w-5" />
            <span className="hidden sm:inline">Sprachsteuerung</span>
          </button>
          
          {/* Command Palette Button */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Befehle (⌘ + K)"
          >
            <Command className="h-5 w-5" />
            <span className="hidden sm:inline">Befehle</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        <div className="flex border-b border-gray-200 dark:border-gray-700">
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Präsidien Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {praesidiumWithReviere
                    .filter(p => 
                      searchQuery === '' || 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((praesidium) => (
                      <motion.div
                        key={praesidium.id}
                        className={`praesidium-card p-6 rounded-xl border transition-all duration-200 ${
                          selectedStations.includes(praesidium.id) 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Präsidium Header - Klick auf Chevron öffnet Dropdown, Klick auf Karte wählt alle */}
                        <div className="flex justify-between items-start mb-4">
                          <div 
                            className="flex items-center space-x-3 cursor-pointer" 
                            onClick={() => togglePraesidiumWithReviere(praesidium.id)}
                          >
                            <Building className="h-6 w-6 text-blue-600" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {praesidium.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {praesidium.city}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className={`h-6 w-6 transition-colors ${
                              selectedStations.includes(praesidium.id) 
                                ? 'text-blue-500' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePraesidiumExpansion(praesidium.id);
                              }}
                              className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                            >
                              <ChevronDown 
                                className={`h-5 w-5 text-gray-400 transition-transform ${
                                  expandedPraesidien.has(praesidium.id) ? 'rotate-180' : ''
                                }`} 
                              />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {praesidium.reviere.length} Reviere verfügbar
                        </div>
                        
                        {/* Reviere-Liste (expandierbar) */}
                        <AnimatePresence>
                          {expandedPraesidien.has(praesidium.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 space-y-2"
                            >
                              {praesidium.reviere.map(revier => (
                                <div 
                                  key={revier.id}
                                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                    selectedStations.includes(revier.id)
                                      ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStationToggle(revier.id);
                                  }}
                                >
                                  <span className="text-sm">{revier.name}</span>
                                  <CheckCircle2 className={`h-5 w-5 transition-colors ${
                                    selectedStations.includes(revier.id) 
                                      ? 'text-blue-500' 
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`} />
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'custom' && (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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

                {/* Custom Addresses */}
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
                          className={`address-card p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                            selectedCustomAddresses.includes(address.id) 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                          onClick={() => handleCustomToggle(address.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-6 w-6 text-green-600" />
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
                            <CheckCircle2 className={`h-6 w-6 transition-colors ${
                              selectedCustomAddresses.includes(address.id) 
                                ? 'text-green-500' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} />
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating Action Panel */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: isPanelOpen ? 0 : 240 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 240 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-t-3xl shadow-2xl z-50 border-t border-gray-200 dark:border-gray-700"
      >
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 cursor-grab active:cursor-grabbing" />
        
        {/* Quick Stats */}
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSelected}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Ziele ausgewählt
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {isPanelOpen ? 'Verstecken' : 'Details'}
            </button>
          </div>
        </div>
        
        {/* Expandable Selection Preview */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div 
              className="px-6 pb-6 max-h-96 overflow-y-auto"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                Ausgewählte Ziele:
              </h3>
              <div className="space-y-2">
                {selectedStations.map(id => {
                  const station = stations.find(s => s.id === id);
                  return station ? (
                    <div key={id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">{station.name}</span>
                      <button 
                        onClick={() => handleStationToggle(id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })}
                {selectedCustomAddresses.map(id => {
                  const address = customAddresses.find(a => a.id === id);
                  return address ? (
                    <div key={id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">{address.name}</span>
                      <button 
                        onClick={() => handleCustomToggle(id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Moderne Navigation */}
      <ModernNavigation totalSelected={totalSelected} onContinue={handleContinue} />

      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <CommandDialog 
            isOpen={showCommandPalette} 
            onClose={() => setShowCommandPalette(false)}
            onCommand={handleCommand}
            praesidien={praesidiumWithReviere}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Command Dialog Komponente
interface CommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
  praesidien: any[];
}

const CommandDialog: React.FC<CommandDialogProps> = ({ isOpen, onClose, onCommand, praesidien }) => {
  const [search, setSearch] = useState('');
  
  // Keyboard shortcut: Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCommands = praesidien.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b dark:border-gray-700 p-4">
          <input
            type="text"
            placeholder="Suche Befehle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
            autoFocus
          />
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1">Schnellaktionen</div>
            <div className="space-y-1">
              <CommandItem 
                icon={<MapPin className="h-4 w-4" />}
                label="Alle in Stuttgart auswählen"
                onSelect={() => onCommand('selectAllStuttgart')}
              />
            </div>
            
            <div className="text-xs text-gray-500 px-2 py-1 mt-4">Präsidien</div>
            <div className="space-y-1">
              {filteredCommands.map(cmd => (
                <CommandItem
                  key={cmd.id}
                  icon={<Building className="h-4 w-4" />}
                  label={`${cmd.name} (${cmd.city})`}
                  onSelect={() => onCommand(`selectPraesidium:${cmd.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Command Item Komponente
interface CommandItemProps {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({ icon, label, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="flex items-center w-full px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
    >
      {icon}
      <span className="ml-2 flex-1 text-left">{label}</span>
      <kbd className="text-xs text-gray-400">⌘{label.charAt(0).toUpperCase()}</kbd>
    </button>
  );
};

export default UltraModernStep2;