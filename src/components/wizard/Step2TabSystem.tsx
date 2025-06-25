import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Plus, Edit2, Trash2, Building, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { useAuthStore } from '@/lib/store/auth-store';
import AddressStorageChoice from '@/components/address/AddressStorageChoice';
import toast from 'react-hot-toast';

interface Station {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  email: string;
  type: 'Präsidium' | 'Revier';
  city: string;
  district: string;
  openingHours: string;
  emergency24h: boolean;
}

interface CustomAddress {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  createdAt: Date;
  isSelected: boolean;
}

const Step2TabSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stations' | 'custom'>('stations');
  const [stations, setStations] = useState<Station[]>([]);
  const [customAddresses, setCustomAddresses] = useState<CustomAddress[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [selectedCustom, setSelectedCustom] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Custom address form
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [storageType, setStorageType] = useState<'temporary' | 'permanent' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    zipCode: '',
    city: ''
  });

  const { setWizardStep } = useAppStore();

  // Load data on mount
  useEffect(() => {
    loadStations();
    loadCustomAddresses();
  }, []);

  const loadStations = async () => {
    try {
      const response = await fetch('/data/polizeistationen.json');
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Fehler beim Laden der Polizeistationen:', error);
      toast.error('Fehler beim Laden der Polizeistationen');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomAddresses = () => {
    try {
      const saved = localStorage.getItem('revierkompass_custom_addresses');
      if (saved) {
        const addresses = JSON.parse(saved).map((addr: any) => ({
          ...addr,
          createdAt: new Date(addr.createdAt)
        }));
        setCustomAddresses(addresses);
      }
    } catch (error) {
      console.error('Fehler beim Laden der eigenen Adressen:', error);
    }
  };

  const saveCustomAddresses = (addresses: CustomAddress[]) => {
    localStorage.setItem('revierkompass_custom_addresses', JSON.stringify(addresses));
    setCustomAddresses(addresses);
  };

  const handleStationToggle = (stationId: string) => {
    setSelectedStations(prev => 
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  const handleCustomToggle = (addressId: string) => {
    setSelectedCustom(prev => 
      prev.includes(addressId)
        ? prev.filter(id => id !== addressId)
        : [...prev, addressId]
    );
  };

  const handleAddAddress = async () => {
    if (!formData.name.trim() || !formData.street.trim() || !formData.zipCode.trim() || !formData.city.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (!storageType) {
      toast.error('Bitte wählen Sie eine Speicher-Option');
      return;
    }

    const coordinates = {
      lat: 48.7758 + (Math.random() - 0.5) * 0.5,
      lng: 9.1829 + (Math.random() - 0.5) * 0.5
    };

    if (storageType === 'temporary') {
      // Store temporarily in localStorage
      const newAddress: CustomAddress = {
        id: Date.now().toString(),
        ...formData,
        coordinates,
        createdAt: new Date(),
        isSelected: false
      };

      const updatedAddresses = [...customAddresses, newAddress];
      saveCustomAddresses(updatedAddresses);
      
      toast.success('Adresse temporär gespeichert');
    } else {
      // Submit for permanent storage (anonymous submission)
      try {
        const response = await fetch('/api/addresses/anonymous', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            coordinates
          }),
        });

        if (response.ok) {
          toast.success('Adresse zur Überprüfung eingereicht');
        } else {
          // Fallback to temporary storage if API fails
          const newAddress: CustomAddress = {
            id: Date.now().toString(),
            ...formData,
            coordinates,
            createdAt: new Date(),
            isSelected: false
          };

          const updatedAddresses = [...customAddresses, newAddress];
          saveCustomAddresses(updatedAddresses);
          
          toast.success('Adresse temporär gespeichert (Fallback)');
        }
      } catch (error) {
        console.error('Error submitting address:', error);
        // Fallback to temporary storage
        const newAddress: CustomAddress = {
          id: Date.now().toString(),
          ...formData,
          coordinates,
          createdAt: new Date(),
          isSelected: false
        };

        const updatedAddresses = [...customAddresses, newAddress];
        saveCustomAddresses(updatedAddresses);
        
        toast.success('Adresse temporär gespeichert (Fallback)');
      }
    }
    
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    setStorageType(null);
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: CustomAddress) => {
    setFormData({
      name: address.name,
      street: address.street,
      zipCode: address.zipCode,
      city: address.city
    });
    setEditingAddress(address.id);
    setShowAddForm(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    const updatedAddresses = customAddresses.map(addr =>
      addr.id === editingAddress
        ? { ...addr, ...formData }
        : addr
    );

    saveCustomAddresses(updatedAddresses);
    
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    setEditingAddress(null);
    setShowAddForm(false);
    toast.success('Adresse erfolgreich aktualisiert');
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = customAddresses.filter(addr => addr.id !== addressId);
    saveCustomAddresses(updatedAddresses);
    setSelectedCustom(prev => prev.filter(id => id !== addressId));
    toast.success('Adresse gelöscht');
  };

  const handleContinue = () => {
    const totalSelected = selectedStations.length + selectedCustom.length;
    if (totalSelected === 0) {
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      return;
    }
    
    toast.success(`${totalSelected} Ziele ausgewählt`);
    setWizardStep(3);
  };

  const filteredStations = (stations || []).filter(station =>
    cityFilter === '' || station.city.toLowerCase().includes(cityFilter.toLowerCase())
  );

  const cities = [...new Set((stations || []).map(s => s.city))].sort();

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
      count: selectedCustom.length
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
                {/* City Filter */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stadt filtern:
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Alle Städte ({stations.length})</option>
                    {cities.map(city => {
                      const count = stations.filter(s => s.city === city).length;
                      return (
                        <option key={city} value={city}>
                          {city} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Stations Grid */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Polizeistationen werden geladen...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredStations.map((station) => (
                      <motion.div
                        key={station.id}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedStations.includes(station.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => handleStationToggle(station.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {station.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {station.address}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {station.city} • {station.type}
                            </p>
                          </div>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedStations.includes(station.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedStations.includes(station.id) && (
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
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
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setStorageType(null);
                      setEditingAddress(null);
                      setFormData({ name: '', street: '', zipCode: '', city: '' });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Neue Adresse</span>
                  </button>
                </div>

                {/* Add/Edit Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                    >
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {editingAddress ? 'Adresse bearbeiten' : 'Neue Adresse hinzufügen'}
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

                      {/* Storage Choice Component */}
                      {!editingAddress && (
                        <div className="mt-6">
                          <AddressStorageChoice
                            onStorageTypeSelect={setStorageType}
                            selectedType={storageType || undefined}
                          />
                        </div>
                      )}

                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                          disabled={!editingAddress && !storageType}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            (!editingAddress && !storageType)
                              ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {editingAddress ? 'Aktualisieren' : 'Hinzufügen'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setEditingAddress(null);
                            setStorageType(null);
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
                <div className="space-y-3 max-h-96 overflow-y-auto">
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
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 border rounded-xl transition-all duration-200 ${
                          selectedCustom.includes(address.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => handleCustomToggle(address.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedCustom.includes(address.id)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {selectedCustom.includes(address.id) && (
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                    <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                                  </svg>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {address.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {address.street}, {address.zipCode} {address.city}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={handleContinue}
          disabled={selectedStations.length + selectedCustom.length === 0}
          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          <span>Weiter zu Schritt 3</span>
          <ArrowRight className="h-5 w-5" />
          {(selectedStations.length + selectedCustom.length > 0) && (
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
              {selectedStations.length + selectedCustom.length} ausgewählt
            </span>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default Step2TabSystem;