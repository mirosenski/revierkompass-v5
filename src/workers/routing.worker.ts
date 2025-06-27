import { calculateRoutes } from '../utils/routing';
import type { RoutingRequest, WorkerResult } from '../types/worker';

// Worker message handler
self.onmessage = async (event: MessageEvent<RoutingRequest>) => {
  try {
    const { startAddress, selectedStationIds, selectedCustomAddressIds, allStations, customAddresses } = event.data;
    
    // Parallele Berechnung mit Promise.all
    const results = await calculateRoutes(
      startAddress, 
      selectedStationIds, 
      selectedCustomAddressIds,
      allStations, 
      customAddresses
    );

    const response: WorkerResult = {
      type: 'success',
      data: results
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResult = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    };
    
    self.postMessage(response);
  }
};

// Error handler
self.onerror = (error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const response: WorkerResult = {
    type: 'error',
    error: `Worker error: ${errorMessage}`
  };
  
  self.postMessage(response);
}; 