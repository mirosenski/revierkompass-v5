import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { CustomAddress, FormData } from '../types';

interface CustomAddressesProps {
  customAddresses: CustomAddress[];
  selectedCustomAddresses: string[];
  searchQuery: string;
  showAddForm: boolean;
  formData: FormData;
  setShowAddForm: (show: boolean) => void;
  setFormData: (data: FormData) => void;
  handleCustomToggle: (addressId: string) => void;
  handleAddAddress: (e: React.FormEvent) => void;
  handleDeleteAddress: (addressId: string) => void;
}

export const CustomAddresses: React.FC<CustomAddressesProps> = ({
  customAddresses,
  selectedCustomAddresses,
  searchQuery,
  showAddForm,
  formData,
  setShowAddForm,
  setFormData,
  handleCustomToggle,
  handleAddAddress,
  handleDeleteAddress
}) => {
  const filteredAddresses = customAddresses.filter(addr => 
    searchQuery === '' || 
    addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.street.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add Address Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Eigene Adressen verwalten
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          aria-expanded={showAddForm}
          aria-controls="add-address-form"
        >
          <Plus className="h-4 w-4" />
          <span>Neue Adresse</span>
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            id="add-address-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddAddress}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
          >
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Neue Adresse hinzufügen
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name/Bezeichnung
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Büro, Zuhause"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Straße
                </label>
                <input
                  id="street"
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="z.B. Musterstraße 123"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PLZ
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="z.B. 70173"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stadt
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="z.B. Stuttgart"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Hinzufügen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', street: '', zipCode: '', city: '' });
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Custom Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddresses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine eigenen Adressen vorhanden.</p>
            <p className="text-sm">Fügen Sie Ihre erste Adresse hinzu!</p>
          </div>
        ) : (
          filteredAddresses.map((address) => (
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
    </div>
  );
}; 