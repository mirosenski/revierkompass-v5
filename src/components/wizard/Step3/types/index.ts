import { RouteResult } from '@/lib/store/app-store';
import { Station as StationType } from '@/types/station.types';
import { Station as AppStoreStation } from '@/lib/store/app-store';

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export interface ExportFormat {
  id: 'excel' | 'pdf' | 'csv';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

export interface SummaryStats {
  totalRoutes: number;
  totalDistance: number;
  totalDuration: number;
  totalFuel: number;
  totalCost: number;
  averageDistance: number;
  averageDuration: number;
}

export interface StationConverter {
  convertStationType: (station: StationType) => AppStoreStation;
}

export interface RouteCalculationResult {
  routeResults: RouteResult[] | null;
  isCalculating: boolean;
  error: string | null;
} 