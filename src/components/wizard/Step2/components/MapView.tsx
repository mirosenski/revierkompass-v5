import React from 'react';
import { Map as MapIcon } from 'lucide-react';

export const MapView: React.FC = () => {
  return (
    <div className="relative h-[600px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Kartenansicht kommt bald</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Interaktive Karte mit allen Präsidien und Revieren
          </p>
        </div>
      </div>
    </div>
  );
}; 