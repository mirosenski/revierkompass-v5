import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { AddressData } from '../types';

interface AddressConfirmationProps {
  startAddress: AddressData | null;
}

export const AddressConfirmation: React.FC<AddressConfirmationProps> = ({ startAddress }) => {
  if (!startAddress) return null;

  return (
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
            {startAddress.fullAddress}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Koordinaten: {startAddress.coordinates.lat.toFixed(6)}, {startAddress.coordinates.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}; 