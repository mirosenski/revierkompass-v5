import { Station as StationType } from '@/types/station.types';
import { Station as AppStoreStation } from '@/lib/store/app-store';

// Hilfsfunktion zur Konvertierung zwischen Station-Typen
export const convertStationType = (station: StationType): AppStoreStation => {
  return {
    id: station.id,
    name: station.name,
    address: station.address,
    coordinates: {
      lat: station.coordinates[0],
      lng: station.coordinates[1]
    },
    phone: station.telefon,
    email: '', // Nicht verfügbar in station.types.ts
    type: station.type === 'praesidium' ? 'Präsidium' : 'Revier',
    city: station.city,
    district: '', // Nicht verfügbar in station.types.ts
    openingHours: '', // Nicht verfügbar in station.types.ts
    emergency24h: station.notdienst24h
  };
}; 