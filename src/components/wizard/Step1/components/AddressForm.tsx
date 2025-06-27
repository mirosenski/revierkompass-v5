import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface AddressFormProps {
  address: string;
  onAddressChange: (address: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onAddressChange,
  onSubmit
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Startadresse
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="z.B. Schlossplatz 1, 70173 Stuttgart"
            className="block w-full px-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <span>Adresse bestätigen</span>
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </form>
    </motion.div>
  );
}; 