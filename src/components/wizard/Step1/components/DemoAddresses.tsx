import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface DemoAddressesProps {
  onDemoAddressSelect: (address: string) => void;
}

export const DemoAddresses: React.FC<DemoAddressesProps> = ({ onDemoAddressSelect }) => {
  const demoAddresses = [
    'Schlossplatz 1, 70173 Stuttgart',
    'Augustinerplatz 2, 79104 Freiburg',
    'Hirschstraße 25, 76133 Karlsruhe',
    'Willy-Brandt-Straße 41, 81829 München'
  ];

  return (
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
            onClick={() => onDemoAddressSelect(demoAddress)}
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
  );
}; 