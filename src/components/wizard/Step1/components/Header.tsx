import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  return (
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
  );
}; 