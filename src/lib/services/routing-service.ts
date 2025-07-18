import { Coordinates, Address, RouteResult, Station, CustomAddress } from '../store/app-store';

export interface RouteRequest {
  start: Coordinates;
  end: Coordinates;
}

export interface RouteResponse {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

class RoutingService {
  // Verbesserte API-URLs mit Fallback-Optionen
  private readonly OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';
  private readonly VALHALLA_BASE_URL = 'https://valhalla1.openstreetmap.de/route';
  private readonly GRAPHHOPPER_BASE_URL = 'https://graphhopper.com/api/1/route';
  
  // Alternative OSRM-Instanzen für Fallback
  private readonly OSRM_FALLBACK_URLS = [
    'https://router.project-osrm.org/route/v1/driving',
    'https://osrm.router.place/route/v1/driving',
    'https://routing.openstreetmap.de/routed-car/route/v1/driving'
  ];

  // Calculate multiple routes from start address to selected destinations
  async calculateMultipleRoutes(
    startAddress: Address,
    selectedStationIds: string[],
    selectedCustomAddressIds: string[],
    allStations: Station[],
    customAddresses: CustomAddress[],
    options?: RequestInit
  ): Promise<RouteResult[]> {
    const results: RouteResult[] = [];
    
    // Create parallel promises for stations
    const stationPromises = selectedStationIds.map(async (stationId) => {
      const station = allStations.find(s => s.id === stationId);
      if (!station) return null;
      
      try {
        const route = await this.calculateSingleRoute(
          startAddress.coordinates,
          station.coordinates,
          options
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
          customAddress.coordinates,
          options
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
    return settledPromises
      .filter((result): result is PromiseFulfilledResult<RouteResult> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
      .sort((a, b) => a.distance - b.distance);
  }

  // Helper method to format route results
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

    // Fallback if no route found - this should not happen in normal flow
    // as calculateSingleRoute always returns a route or throws
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

  // Helper method to create fallback results
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

  // Calculate single route between two points
  async calculateSingleRoute(
    start: Coordinates,
    end: Coordinates,
    options?: RequestInit
  ): Promise<RouteResponse | null> {
    const request: RouteRequest = { start, end };
    
    // Try OSRM with multiple fallback URLs
    for (const osrmUrl of this.OSRM_FALLBACK_URLS) {
      try {
        return await this.calculateWithOSRM(request, osrmUrl, options);
      } catch (error) {
        console.warn(`OSRM ${osrmUrl} failed:`, error);
        continue;
      }
    }

    // Try Valhalla as fallback
    try {
      return await this.calculateWithValhalla(request, options);
    } catch (error) {
      console.warn('Valhalla failed, using direct distance:', error);
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

  // OSRM routing implementation with configurable URL
  private async calculateWithOSRM(request: RouteRequest, baseUrl?: string, options?: RequestInit): Promise<RouteResponse> {
    const { start, end } = request;
    const url = `${baseUrl || this.OSRM_BASE_URL}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Timeout nach 10 Sekunden
      signal: AbortSignal.timeout(10000),
      ...options
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

  // Valhalla routing implementation (alternative)
  private async calculateWithValhalla(request: RouteRequest, options?: RequestInit): Promise<RouteResponse> {
    const { start, end } = request;
    
    const payload = {
      locations: [
        { lat: start.lat, lon: start.lng },
        { lat: end.lat, lon: end.lng }
      ],
      costing: "auto",
      shape_match: "edge_walk",
      format: "json"
    };

    const response = await fetch(this.VALHALLA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Timeout nach 10 Sekunden
      signal: AbortSignal.timeout(10000),
      ...options
    });

    if (!response.ok) {
      throw new Error(`Valhalla API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.trip || !data.trip.legs || data.trip.legs.length === 0) {
      throw new Error('No routes found from Valhalla');
    }

    const leg = data.trip.legs[0];
    
    // Decode Valhalla's polyline to coordinates
    const coordinates = this.decodePolyline(leg.shape);
    
    return {
      coordinates,
      distance: leg.summary.length * 1000, // Convert km to meters
      duration: leg.summary.time
    };
  }

  // Generate unique colors for routes
  private generateRouteColor(index: number): string {
    const colors = [
      '#3B82F6', // blue-500
      '#EF4444', // red-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
      '#EC4899', // pink-500
      '#6366F1'  // indigo-500
    ];
    return colors[index % colors.length];
  }

  // Direct distance calculation (Haversine formula)
  calculateDirectDistance(start: Coordinates, end: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(end.lat - start.lat);
    const dLng = this.degreesToRadians(end.lng - start.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(start.lat)) * 
      Math.cos(this.degreesToRadians(end.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Decode polyline (simplified implementation)
  private decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      points.push([lng / 1e5, lat / 1e5]);
    }

    return points;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const routingService = new RoutingService();
