import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, CheckCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import toast from 'react-hot-toast';

const Step1AddressInput: React.FC = () => {
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { setStartAddress, setWizardStep, wizard } = useAppStore();

  // Demo addresses for quick testing
  const demoAddresses = [
    'Schlossplatz 1, 70173 Stuttgart',
    'Augustinerplatz 2, 79104 Freiburg',
    'Hirschstraße 25, 76133 Karlsruhe',
    'Willy-Brandt-Straße 41, 81829 München'
  ];

  const handleAddressSubmit = async (inputAddress: string) => {
    if (!inputAddress.trim()) {
      toast.error('Bitte geben Sie eine Adresse ein');
      return;
    }

    setIsGeocoding(true);
    
    try {
      // Simuliere Geocoding (in production würde hier ein echter API-Call stattfinden)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo coordinates for Stuttgart area
      const coordinates = {
        lat: 48.7758 + (Math.random() - 0.5) * 0.1,
        lng: 9.1829 + (Math.random() - 0.5) * 0.1
      };

      const addressData = {
        street: inputAddress.split(',')[0] || inputAddress,
        houseNumber: '',
        zipCode: '70173',
        city: 'Stuttgart',
        fullAddress: inputAddress,
        coordinates,
        accuracy: 95
      };

      setStartAddress(addressData);
      toast.success('Adresse erfolgreich geocodiert!');
      
      // Auto-advance to step 2 after short delay
      setTimeout(() => {
        setWizardStep(2);
      }, 1000);
      
    } catch (error) {
      toast.error('Fehler beim Geocodieren der Adresse');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddressSubmit(address);
  };

  const handleDemoAddress = (demoAddress: string) => {
    setAddress(demoAddress);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Startadresse eingeben
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Geben Sie Ihre Startadresse für die Routenberechnung ein
            </p>
          </div>
        </div>
      </motion.div>

      {/* Address Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Startadresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="z.B. Schlossplatz 1, 70173 Stuttgart"
                className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isGeocoding}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isGeocoding || !address.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isGeocoding ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Geocodierung läuft...</span>
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" />
                <span>Adresse geocodieren</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Demo Addresses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Demo-Adressen für schnelle Tests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {demoAddresses.map((demoAddress, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDemoAddress(demoAddress)}
              className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-left"
            >
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {demoAddress}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Current Address Display */}
      {wizard.startAddress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Startadresse bestätigt
              </h3>
              <p className="text-green-700 dark:text-green-300">
                {wizard.startAddress.fullAddress}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Koordinaten: {wizard.startAddress.coordinates.lat.toFixed(6)}, {wizard.startAddress.coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Step1AddressInput;