import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Building, 
  Users, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Filter,
  Save,
  X,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store/auth-store';
import toast from 'react-hot-toast';
import AddressReviewTab from './AddressReviewTab';

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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stations' | 'addresses'>('stations');
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Präsidium' | 'Revier'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  
  const { user } = useAuthStore();

  const tabs = [
    { id: 'stations', label: 'Polizeistationen', icon: Building },
    { id: 'addresses', label: 'Adress-Review', icon: CheckCircle }
  ] as const;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<Station>();

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, []);

  // Filter stations when search/filter criteria change
  useEffect(() => {
    let filtered = stations;

    if (searchTerm) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (cityFilter) {
      filtered = filtered.filter(station => station.city === cityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(station => station.type === typeFilter);
    }

    setFilteredStations(filtered);
  }, [stations, searchTerm, cityFilter, typeFilter]);

  const loadStations = async () => {
    try {
      const response = await fetch('/data/polizeistationen.json');
      const data = await response.json();
      
      // Transformiere die deutschen Feldnamen in die erwartete englische Struktur
      const transformedStations = data.polizeistationen.map((station: any) => ({
        id: station.id,
        name: station.name,
        address: station.adresse,
        coordinates: station.koordinaten,
        phone: station.telefon,
        email: station.email,
        type: station.typ,
        city: station.stadt,
        district: station.zustaendigkeitsbereich,
        openingHours: station.oeffnungszeiten,
        emergency24h: station.notfall
      }));
      
      setStations(transformedStations);
      setFilteredStations(transformedStations);
    } catch (error) {
      console.error('Fehler beim Laden der Polizeistationen:', error);
      toast.error('Fehler beim Laden der Polizeistationen');
      // Fallback: Setze leeres Array um Fehler zu vermeiden
      setStations([]);
      setFilteredStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = (data: Station) => {
    const newStation: Station = {
      ...data,
      id: `station_${Date.now()}`,
      coordinates: {
        lat: 48.7758 + (Math.random() - 0.5) * 0.5,
        lng: 9.1829 + (Math.random() - 0.5) * 0.5
      }
    };

    const updatedStations = [...stations, newStation];
    setStations(updatedStations);
    
    // In production, this would save to backend
    toast.success('Polizeistation erfolgreich hinzugefügt');
    setShowAddForm(false);
    reset();
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setShowAddForm(true);
    
    // Fill form with station data
    Object.keys(station).forEach(key => {
      setValue(key as keyof Station, station[key as keyof Station]);
    });
  };

  const handleUpdateStation = (data: Station) => {
    if (!editingStation) return;

    const updatedStations = stations.map(station =>
      station.id === editingStation.id
        ? { ...station, ...data }
        : station
    );

    setStations(updatedStations);
    toast.success('Polizeistation erfolgreich aktualisiert');
    setShowAddForm(false);
    setEditingStation(null);
    reset();
  };

  const handleDeleteStation = (stationId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Polizeistation löschen möchten?')) {
      const updatedStations = stations.filter(station => station.id !== stationId);
      setStations(updatedStations);
      toast.success('Polizeistation gelöscht');
    }
  };

  const onSubmit = (data: Station) => {
    if (editingStation) {
      handleUpdateStation(data);
    } else {
      handleAddStation(data);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingStation(null);
    reset();
  };

  const cities = [...new Set(stations.map(s => s.city))].sort();

  const stats = {
    total: stations.length,
    praesidien: stations.filter(s => s.type === 'Präsidium').length,
    reviere: stations.filter(s => s.type === 'Revier').length,
    emergency24h: stations.filter(s => s.emergency24h).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-2xl shadow-lg">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Polizeistationen in Baden-Württemberg verwalten
            </p>
          </div>
        </div>
        
        {user && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2 inline-flex items-center space-x-2">
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm text-indigo-800 dark:text-indigo-200">
              Angemeldet als: <span className="font-semibold">{user.username}</span>
            </span>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-1"
      >
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'stations' && (
        <>
          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gesamtstationen</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.praesidien}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Präsidien</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.reviere}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reviere</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.emergency24h}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">24h Notdienst</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Stationen durchsuchen..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
              />
            </div>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Alle Städte</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Präsidium' | 'Revier')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Alle Typen</option>
              <option value="Präsidium">Präsidien</option>
              <option value="Revier">Reviere</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Neue Station</span>
          </button>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredStations.length} von {stations.length} Stationen angezeigt
        </div>
      </motion.div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingStation ? 'Station bearbeiten' : 'Neue Station hinzufügen'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        {...register('name', { required: 'Name ist erforderlich' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. Polizeipräsidium Stuttgart"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Typ *
                      </label>
                      <select
                        {...register('type', { required: 'Typ ist erforderlich' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Typ auswählen</option>
                        <option value="Präsidium">Präsidium</option>
                        <option value="Revier">Revier</option>
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adresse *
                      </label>
                      <input
                        {...register('address', { required: 'Adresse ist erforderlich' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. Heslacher Tunnel 1, 70173 Stuttgart"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stadt *
                      </label>
                      <input
                        {...register('city', { required: 'Stadt ist erforderlich' })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. Stuttgart"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bezirk
                      </label>
                      <input
                        {...register('district')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. Stuttgart"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Telefon
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. 0711 8990-0"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        E-Mail
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. stuttgart.pp@polizei.bwl.de"
                      />
                    </div>

                    {/* Opening Hours */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Öffnungszeiten
                      </label>
                      <input
                        {...register('openingHours')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="z.B. Mo-Fr 8:00-18:00"
                      />
                    </div>

                    {/* Emergency 24h */}
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('emergency24h')}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          24-Stunden Notdienst verfügbar
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Form Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingStation ? 'Aktualisieren' : 'Hinzufügen'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
          <h3 className="text-xl font-bold">Polizeistationen verwalten</h3>
          <p className="text-indigo-100 mt-1">
            Hier können Sie alle Polizeistationen bearbeiten und verwalten
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Stationen werden geladen...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Typ</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Stadt</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Adresse</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Telefon</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">24h</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredStations.map((station, index) => (
                  <motion.tr
                    key={station.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {station.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        station.type === 'Präsidium'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      }`}>
                        {station.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {station.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {station.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {station.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {station.emergency24h ? (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStation(station)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStation(station.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredStations.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Polizeistationen gefunden.</p>
                {(searchTerm || cityFilter || typeFilter !== 'all') && (
                  <p className="text-sm mt-2">
                    Versuchen Sie, Ihre Filter zu ändern oder eine neue Station hinzuzufügen.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
        </>
      )}

      {/* Address Review Tab */}
      {activeTab === 'addresses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AddressReviewTab />
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;