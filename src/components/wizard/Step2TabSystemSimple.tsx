import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Plus, Edit2, Trash2, Building, ArrowRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { useWizardStore } from '@/store/useWizardStore';
import { useStationStore } from '@/store/useStationStore';
import { toast } from 'react-hot-toast';

interface CustomAddress {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  isSelected: boolean;
}

const Step2TabSystemSimple: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stations' | 'custom'>('stations');
  const { stations, loadStations, isLoading, error, getStationsByType, getReviereByPraesidium } = useStationStore();
  
  // Store-basierte Custom Addresses
  const { customAddresses, addCustomAddress, deleteCustomAddress } = useAppStore();
  const { selectedStations, setSelectedStations, selectedCustomAddresses, setSelectedCustomAddresses } = useWizardStore();
  
  // Akkordeon-Zustand für Präsidien
  const [expandedPraesidien, setExpandedPraesidien] = useState<string[]>([]);
  
  // Custom address form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  const { setWizardStep } = useAppStore();

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Hierarchische Daten vorbereiten
  const praesidien = getStationsByType('praesidium');
  const praesidiumWithReviere = praesidien.map(praesidium => ({
    ...praesidium,
    reviere: getReviereByPraesidium(praesidium.id)
  }));

  // Akkordeon-Handler
  const togglePraesidium = (praesidiumId: string) => {
    setExpandedPraesidien(prev => 
      prev.includes(praesidiumId)
        ? prev.filter(id => id !== praesidiumId)
        : [...prev, praesidiumId]
    );
  };

  const handleStationToggle = (stationId: string) => {
    const updated = selectedStations.includes(stationId)
      ? selectedStations.filter(id => id !== stationId)
      : [...selectedStations, stationId];
    setSelectedStations(updated);
  };

  const handleCustomToggle = (addressId: string) => {
    const updated = selectedCustomAddresses.includes(addressId)
      ? selectedCustomAddresses.filter(id => id !== addressId)
      : [...selectedCustomAddresses, addressId];
    setSelectedCustomAddresses(updated);
  };

  const handleAddAddress = () => {
    if (!formData.name.trim() || !formData.street.trim() || !formData.zipCode.trim() || !formData.city.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    // Store-basiert
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

  const handleDeleteAddress = (addressId: string) => {
    deleteCustomAddress(addressId);
    const updated = selectedCustomAddresses.filter(id => id !== addressId);
    setSelectedCustomAddresses(updated);
    toast.success('Adresse gelöscht');
  };

  const handleContinue = () => {
    const totalSelected = selectedStations.length + selectedCustomAddresses.length;
    if (totalSelected === 0) {
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      return;
    }
    
    toast.success(`${totalSelected} Ziele ausgewählt`);
    setWizardStep(3);
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {isLoading && <div className="loading-indicator">Lade Stationen...</div>}
      {error && <div className="error-message">Fehler: {error}</div>}
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-2xl shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ziele auswählen
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Wählen Sie Polizeistationen und eigene Adressen für die Routenberechnung
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
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
                {/* Präsidien/Reviere Hierarchie */}
                <div className="space-y-4">
                  {praesidiumWithReviere.map((praesidium) => (
                    <div key={praesidium.id} className="praesidium-accordion border rounded-lg overflow-hidden">
                      {/* Akkordeon-Header */}
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        onClick={() => togglePraesidium(praesidium.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{praesidium.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{praesidium.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {praesidium.reviere.length} Reviere
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            expandedPraesidien.includes(praesidium.id) ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>

                      {/* Reviere-Liste */}
                      {expandedPraesidien.includes(praesidium.id) && (
                        <div className="reviere-list border-t bg-gray-50 dark:bg-gray-700">
                          {praesidium.reviere.map((revier) => (
                            <div key={revier.id} className="revier-item flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <input
                                type="checkbox"
                                checked={selectedStations.includes(revier.id)}
                                onChange={() => handleStationToggle(revier.id)}
                                className="mr-3 h-4 w-4 text-blue-600 rounded"
                              />
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white">{revier.name}</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{revier.address}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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

                {/* Custom Addresses List */}
                <div className="space-y-3">
                  {customAddresses.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Noch keine eigenen Adressen vorhanden.</p>
                      <p className="text-sm">Fügen Sie Ihre erste Adresse hinzu!</p>
                    </div>
                  ) : (
                    customAddresses.map((address) => (
                      <motion.div
                        key={address.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedCustomAddresses.includes(address.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handleCustomToggle(address.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {address.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {address.street}, {address.zipCode} {address.city}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedCustomAddresses.includes(address.id)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {selectedCustomAddresses.includes(address.id) && (
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                  <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                                </svg>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <button
          onClick={handleContinue}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span>Weiter zu Schritt 3</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </div>
  );
};

export default Step2TabSystemSimple;