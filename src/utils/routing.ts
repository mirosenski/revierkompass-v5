import { RouteResult, Address, Station, CustomAddress, Coordinates } from '@/lib/store/app-store';

class LRUCache<K, V> {
  private readonly max: number;
  private readonly ttl: number;
  private map = new Map<K, { value: V; expiry: number }>();

  constructor(max: number, ttl: number) {
    this.max = max;
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.map.delete(key);
      return undefined;
    }
    // refresh LRU order
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.max) {
      const firstKey = this.map.keys().next().value;
      if (firstKey !== undefined) {
        this.map.delete(firstKey);
      }
    }
    this.map.set(key, { value, expiry: Date.now() + this.ttl });
  }
}

export interface RouteRequest {
  start: Coordinates;
  end: Coordinates;
}

export interface RouteResponse {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

// In-memory Cache für Worker mit einfachem LRU-Mechanismus
const routeCache = new LRUCache<string, RouteResult[]>(100, 1000 * 60 * 5);

class WorkerRoutingService {
  private readonly OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';
  private readonly OSRM_FALLBACK_URLS = [
    'https://router.project-osrm.org/route/v1/driving',
    'https://osrm.router.place/route/v1/driving',
    'https://routing.openstreetmap.de/routed-car/route/v1/driving'
  ];

  async calculateRoutes(
    startAddress: Address,
    selectedStationIds: string[],
    selectedCustomAddressIds: string[],
    allStations: Station[],
    customAddresses: CustomAddress[]
  ): Promise<RouteResult[]> {
    const cacheKey = JSON.stringify({
      startAddress: `${startAddress.coordinates.lat},${startAddress.coordinates.lng}-${startAddress.fullAddress}`,
      selectedStationIds,
      selectedCustomAddressIds
    });

    // Check cache first
    const cached = routeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results: RouteResult[] = [];
    
    // Create parallel promises for stations
    const stationPromises = selectedStationIds.map(async (stationId) => {
      const station = allStations.find(s => s.id === stationId);
      if (!station) return null;
      
      try {
        const route = await this.calculateSingleRoute(
          startAddress.coordinates,
          station.coordinates
        );

        return this.formatRouteResult(
          station,
          route,
          'station',
          results.length
        );
      } catch (error) {
        console.error(`Error calculating route to station ${station.name}:`, error);
        return this.createFallbackResult(station, startAddress.coordinates, 'station', results.length);
      }
    });

    // Create parallel promises for custom addresses
    const customPromises = selectedCustomAddressIds.map(async (addressId) => {
      const customAddress = customAddresses.find(a => a.id === addressId);
      if (!customAddress?.coordinates) return null;

      try {
        const route = await this.calculateSingleRoute(
          startAddress.coordinates,
          customAddress.coordinates
        );

        return this.formatRouteResult(
          customAddress,
          route,
          'custom',
          results.length
        );
      } catch (error) {
        console.error(`Error calculating route to custom address ${customAddress.name}:`, error);
        return this.createFallbackResult(customAddress, startAddress.coordinates, 'custom', results.length);
      }
    });

    // Execute all promises in parallel
    const settledPromises = await Promise.allSettled([
      ...stationPromises,
      ...customPromises
    ]);

    // Collect successful results
    const calculatedResults = settledPromises
      .filter((result): result is PromiseFulfilledResult<RouteResult> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
      .sort((a, b) => a.distance - b.distance);

    // Cache the results
    routeCache.set(cacheKey, calculatedResults);
    
    return calculatedResults;
  }

  private async calculateSingleRoute(
    start: Coordinates,
    end: Coordinates
  ): Promise<RouteResponse | null> {
    const request: RouteRequest = { start, end };
    
    // Try OSRM with multiple fallback URLs
    for (const osrmUrl of this.OSRM_FALLBACK_URLS) {
      try {
        return await this.calculateWithOSRM(request, osrmUrl);
      } catch (error) {
        console.warn(`OSRM ${osrmUrl} failed:`, error);
        continue;
      }
    }

    // Fallback to direct distance
    const distance = this.calculateDirectDistance(start, end);
    return {
      coordinates: [
        [start.lng, start.lat] as [number, number],
        [end.lng, end.lat] as [number, number]
      ],
      distance: distance * 1000,
      duration: distance * 120 // 2 minutes per km estimate
    };
  }

  private async calculateWithOSRM(request: RouteRequest, baseUrl?: string): Promise<RouteResponse> {
    const { start, end } = request;
    const url = `${baseUrl || this.OSRM_BASE_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration
    };
  }

  private formatRouteResult(
    destination: Station | CustomAddress,
    route: RouteResponse | null,
    type: 'station' | 'custom',
    index: number
  ): RouteResult {
    const base = {
      id: type === 'station' ? `station-${destination.id}` : `custom-${(destination as CustomAddress).id}`,
      destinationId: destination.id,
      destinationName: 'name' in destination ? destination.name : (destination as CustomAddress).name,
      destinationType: type,
      address: 'address' in destination ? destination.address : (destination as CustomAddress).address,
      coordinates: destination.coordinates,
      color: this.generateRouteColor(index),
      routeType: 'Schnellste' as const,
      provider: 'OSRM' as const
    };

    if (route) {
      return {
        ...base,
        distance: route.distance / 1000,
        duration: Math.round(route.duration / 60),
        estimatedFuel: (route.distance / 1000) * 0.095,
        estimatedCost: (route.distance / 1000) * 0.095 * 1.75,
        route: {
          coordinates: route.coordinates,
          distance: route.distance,
          duration: route.duration
        }
      };
    }

    // Fallback if no route found
    const directDistance = 0;
    return {
      ...base,
      distance: directDistance,
      duration: Math.round(directDistance * 2),
      estimatedFuel: directDistance * 0.095,
      estimatedCost: directDistance * 0.095 * 1.75,
      route: {
        coordinates: [
          [destination.coordinates.lng, destination.coordinates.lat],
          [destination.coordinates.lng, destination.coordinates.lat]
        ],
        distance: directDistance * 1000,
        duration: directDistance * 120
      },
      provider: 'Direct' as const
    };
  }

  private createFallbackResult(
    destination: Station | CustomAddress,
    startCoordinates: Coordinates,
    type: 'station' | 'custom',
    index: number
  ): RouteResult {
    const directDistance = this.calculateDirectDistance(
      startCoordinates,
      destination.coordinates
    );

    return {
      id: type === 'station' ? `station-${destination.id}` : `custom-${(destination as CustomAddress).id}`,
      destinationId: destination.id,
      destinationName: 'name' in destination ? destination.name : (destination as CustomAddress).name,
      destinationType: type,
      address: 'address' in destination ? destination.address : (destination as CustomAddress).address,
      distance: directDistance,
      duration: Math.round(directDistance * 2),
      estimatedFuel: directDistance * 0.095,
      estimatedCost: directDistance * 0.095 * 1.75,
      routeType: 'Kürzeste' as const,
      coordinates: destination.coordinates,
      color: this.generateRouteColor(index),
      route: {
        coordinates: [
          [startCoordinates.lng, startCoordinates.lat],
          [destination.coordinates.lng, destination.coordinates.lat]
        ],
        distance: directDistance * 1000,
        duration: directDistance * 120
      },
      provider: 'Direct'
    };
  }

  private generateRouteColor(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  private calculateDirectDistance(start: Coordinates, end: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(end.lat - start.lat);
    const dLng = this.degreesToRadians(end.lng - start.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(start.lat)) * Math.cos(this.degreesToRadians(end.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const workerRoutingService = new WorkerRoutingService();

// Export main calculation function
export const calculateRoutes = (
  startAddress: Address,
  selectedStationIds: string[],
  selectedCustomAddressIds: string[],
  allStations: Station[],
  customAddresses: CustomAddress[]
): Promise<RouteResult[]> => {
  return workerRoutingService.calculateRoutes(
    startAddress,
    selectedStationIds,
    selectedCustomAddressIds,
    allStations,
    customAddresses
  );
}; 
