import React from 'react';
import OfflineMapComponent from '../../../map/OfflineMapComponent';
import { RouteResult } from '@/lib/store/app-store';

interface OfflineMapTabProps {
  routeResults: RouteResult[];
  startAddress: string;
  startCoordinates: { lat: number; lng: number };
}

export const OfflineMapTab: React.FC<OfflineMapTabProps> = ({ routeResults, startAddress, startCoordinates }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="h-[600px]">
        <OfflineMapComponent 
          routeResults={routeResults}
          startAddress={startAddress}
          startCoordinates={startCoordinates}
        />
      </div>
    </div>
  );
}; 