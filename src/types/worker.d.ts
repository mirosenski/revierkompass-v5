import { RouteResult, Address, Station, CustomAddress } from '@/lib/store/app-store';

export interface RoutingRequest {
  startAddress: Address;
  selectedStationIds: string[];
  selectedCustomAddressIds: string[];
  allStations: Station[];
  customAddresses: CustomAddress[];
}

export type RoutingResponse = 
  | { results: RouteResult[] } 
  | { error: string };

export interface WorkerMessage {
  type: 'calculate' | 'terminate';
  data?: RoutingRequest;
}

export interface WorkerResult {
  type: 'success' | 'error';
  data?: RouteResult[];
  error?: string;
} 