import { useEffect, useRef, useState, useCallback } from 'react';
import { RouteResult } from '@/lib/store/app-store';
import type { RoutingRequest, WorkerResult } from '@/types/worker';

interface UseRoutingWorkerReturn {
  routes: RouteResult[] | null;
  isCalculating: boolean;
  error: string | null;
  calculateRoutes: (request: RoutingRequest) => void;
  clearError: () => void;
}

export const useRoutingWorker = (): UseRoutingWorkerReturn => {
  const [routes, setRoutes] = useState<RouteResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker>();

  // Worker initialisieren
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/routing.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event: MessageEvent<WorkerResult>) => {
        if (typeof performance !== 'undefined') {
          performance.mark('worker-response');
        }
        if (event.data.type === 'error') {
          console.error('Worker-Fehler:', event.data.error);
          setError(event.data.error || 'Unbekannter Worker-Fehler');
        } else {
          setRoutes(event.data.data || []);
        }
        setIsCalculating(false);
        if (typeof performance !== 'undefined') {
          performance.mark('calculation-end');
          performance.measure('total-calculation', 'calculation-start', 'calculation-end');
          performance.measure('spinner-duration', 'spinner-show', 'worker-response');
        }
      };

      workerRef.current.onerror = (workerError) => {
        console.error('Worker-Fehler:', workerError);
        setError('Worker-Initialisierung fehlgeschlagen');
        setIsCalculating(false);
        if (typeof performance !== 'undefined') {
          performance.mark('worker-response');
          performance.mark('calculation-end');
          performance.measure('total-calculation', 'calculation-start', 'calculation-end');
          performance.measure('spinner-duration', 'spinner-show', 'worker-response');
        }
      };

    } catch (error) {
      console.error('Worker-Initialisierung fehlgeschlagen:', error);
      setError('Worker wird nicht unterstützt');
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculateRoutes = useCallback((request: RoutingRequest) => {
    if (!workerRef.current) {
      setError('Worker nicht verfügbar');
      return;
    }

    setIsCalculating(true);
    setError(null);
    setRoutes(null);
    if (typeof performance !== 'undefined') {
      performance.mark('calculation-start');
    }

  try {
    workerRef.current.postMessage(request);
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht an Worker:', error);
    setError('Fehler bei der Worker-Kommunikation');
    setIsCalculating(false);
    if (typeof performance !== 'undefined') {
      performance.mark('worker-response');
      performance.mark('calculation-end');
      performance.measure('total-calculation', 'calculation-start', 'calculation-end');
      performance.measure('spinner-duration', 'spinner-show', 'worker-response');
    }
  }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    routes,
    isCalculating,
    error,
    calculateRoutes,
    clearError
  };
}; 