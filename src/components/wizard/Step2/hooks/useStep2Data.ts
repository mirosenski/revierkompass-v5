import { useMemo, useEffect } from 'react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import { PraesidiumWithDetails } from '../types';

export const useStep2Data = (
  searchQuery: string,
  expandedPraesidien: Set<string>,
  selectedStations: string[]
) => {
  const { stations, getStationsByType, getReviereByPraesidium, loadStations } = useStationStore();
  const { selectedCustomAddresses } = useWizardStore();
  const { customAddresses } = useAppStore();

  // Stationen laden
  useEffect(() => {
    loadStations();
  }, [loadStations]);

  // Memoized data
  const praesidien = useMemo(() => getStationsByType('praesidium'), [getStationsByType]);
  
  const praesidiumWithReviere = useMemo(() => 
    praesidien.map(praesidium => ({
      ...praesidium,
      reviere: getReviereByPraesidium(praesidium.id),
      isExpanded: expandedPraesidien.has(praesidium.id),
      selectedCount: getReviereByPraesidium(praesidium.id)
        .filter(r => selectedStations.includes(r.id)).length
    })), 
  [praesidien, getReviereByPraesidium, expandedPraesidien, selectedStations]);

  const filteredPraesidien = useMemo(() => 
    praesidiumWithReviere.filter(p => 
      searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    ), 
  [praesidiumWithReviere, searchQuery]);

  const totalSelected = selectedStations.length + selectedCustomAddresses.length;

  return {
    stations,
    customAddresses,
    praesidiumWithReviere,
    filteredPraesidien,
    totalSelected
  };
}; 