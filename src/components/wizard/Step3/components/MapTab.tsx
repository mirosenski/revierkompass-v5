import React from 'react';
import InteractiveMap from '../../../map/InteractiveMap';
import { RouteResult } from '@/lib/store/app-store';

interface MapTabProps {
  routeResults: RouteResult[];
  startAddress: string;
  startCoordinates: { lat: number; lng: number };
}

export const MapTab: React.FC<MapTabProps> = ({ routeResults, startAddress, startCoordinates }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="h-[600px]">
        <InteractiveMap 
          routeResults={routeResults}
          startAddress={startAddress}
          startCoordinates={startCoordinates}
        />
      </div>
    </div>
  );
}; 