import { useState, useEffect, useMemo, useRef } from 'react';
import { RouteResult } from '@/lib/store/app-store';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import { useStationStore } from '@/store/useStationStore';
import { routingService } from '@/lib/services/routing-service';
import { useRoutingWorker } from '@/hooks/useRoutingWorker';
import { convertStationType } from '../components/StationConverter';
import toast from 'react-hot-toast';

export const useStep3RouteCalculation = () => {
  const { selectedStations, selectedCustomAddresses } = useWizardStore();
  const { wizard: { startAddress }, customAddresses } = useAppStore();
  const { stations } = useStationStore();

  const [routeResults, setRouteResults] = useState<RouteResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCalculatingRef = useRef(false);
  const abortControllerRef = useRef<AbortController>();

  // Worker hook
  const {
    routes: workerRoutes,
    isCalculating: workerIsCalculating,
    error: workerError,
    calculateRoutes: workerCalculateRoutes,
    clearError: clearWorkerError
  } = useRoutingWorker();

  // Memoize converted stations
  const convertedStations = useMemo(
    () => stations.map(convertStationType),
    [stations]
  );

  // Sync worker results with local state
  useEffect(() => {
    if (workerRoutes !== null) {
      setRouteResults(workerRoutes);
      toast.success('Routenberechnung abgeschlossen!');
    }
  }, [workerRoutes]);

  useEffect(() => {
    setIsCalculating(workerIsCalculating);
  }, [workerIsCalculating]);

  useEffect(() => {
    if (workerError) {
      setError(workerError);
      toast.error(workerError);
    }
  }, [workerError]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const calculateRoutes = async () => {
      if (isCalculatingRef.current) return;
      isCalculatingRef.current = true;
      
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setRouteResults(null);
      setIsCalculating(true);
      setError(null);
      clearWorkerError();

      try {
        // Try worker first
        const request = {
          startAddress: startAddress!,
          selectedStationIds: selectedStations || [],
          selectedCustomAddressIds: selectedCustomAddresses || [],
          allStations: convertedStations,
          customAddresses: customAddresses || []
        };

        workerCalculateRoutes(request);
      } catch (error: unknown) {
        // Fallback to original implementation if worker fails
        console.warn('Worker failed, falling back to main thread calculation:', error);
        
        try {
          const routes = await routingService.calculateMultipleRoutes(
            startAddress!,
            selectedStations || [],
            selectedCustomAddresses || [],
            convertedStations,
            customAddresses || [],
            { signal: abortControllerRef.current.signal }
          );

          if (isMounted) {
            setRouteResults(routes as RouteResult[]);
            toast.success('Routenberechnung abgeschlossen!');
          }
        } catch (fallbackError: unknown) {
          if (isMounted && fallbackError instanceof Error && fallbackError.name !== 'AbortError') {
            console.error('Fallback Routenberechnung fehlgeschlagen:', fallbackError);
            setError('Fehler bei der Routenberechnung');
            toast.error('Fehler bei der Routenberechnung');
          }
        } finally {
          if (isMounted) {
            setIsCalculating(false);
          }
        }
      } finally {
        if (isMounted) {
          isCalculatingRef.current = false;
        }
      }
    };

    if (startAddress && (selectedStations?.length || selectedCustomAddresses?.length)) {
      timeoutId = setTimeout(() => void calculateRoutes(), 300);
    }

    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      abortControllerRef.current?.abort();
    };
  }, [startAddress, selectedStations, selectedCustomAddresses, customAddresses, stations, workerCalculateRoutes, clearWorkerError]);

  return { routeResults, isCalculating, error };
};