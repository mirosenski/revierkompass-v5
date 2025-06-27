import { useCallback } from 'react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import { PraesidiumWithDetails } from '../types';
import toast from 'react-hot-toast';

export const useStep2Handlers = (
  selectedStations: string[],
  setSelectedStations: (stations: string[]) => void,
  selectedCustomAddresses: string[],
  setSelectedCustomAddresses: (addresses: string[]) => void,
  setExpandedPraesidien: (setter: (prev: Set<string>) => Set<string>) => void,
  setLastSelectedId: (id: string | null) => void,
  formData: { name: string; street: string; zipCode: string; city: string },
  setFormData: (data: { name: string; street: string; zipCode: string; city: string }) => void,
  setShowAddForm: (show: boolean) => void,
  praesidiumWithReviere: PraesidiumWithDetails[]
) => {
  const { addCustomAddress, deleteCustomAddress, setWizardStep } = useAppStore();

  const togglePraesidiumWithReviere = useCallback((praesidiumId: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    const praesidium = praesidiumWithReviere.find(p => p.id === praesidiumId);
    if (!praesidium) return;

    const reviereIds = praesidium.reviere.map(r => r.id);
    const allIds = [praesidiumId, ...reviereIds];
    const allSelected = allIds.every(id => selectedStations.includes(id));

    if (event?.ctrlKey || event?.metaKey) {
      const newSelectedStations = allSelected 
        ? selectedStations.filter(id => !allIds.includes(id))
        : [...new Set([...selectedStations, ...allIds])];
      setSelectedStations(newSelectedStations);
    } else {
      const newSelectedStations = allSelected 
        ? selectedStations.filter(id => !allIds.includes(id))
        : [...new Set([...selectedStations, ...allIds])];
      setSelectedStations(newSelectedStations);
    }
    setLastSelectedId(praesidiumId);
  }, [praesidiumWithReviere, selectedStations, setSelectedStations, setLastSelectedId]);

  const togglePraesidiumExpansion = useCallback((praesidiumId: string) => {
    setExpandedPraesidien(prev => {
      const newSet = new Set(prev);
      newSet.has(praesidiumId) ? newSet.delete(praesidiumId) : newSet.add(praesidiumId);
      return newSet;
    });
  }, [setExpandedPraesidien]);

  const handleStationToggle = useCallback((stationId: string) => {
    const newSelectedStations = selectedStations.includes(stationId) 
      ? selectedStations.filter(id => id !== stationId)
      : [...selectedStations, stationId];
    setSelectedStations(newSelectedStations);
  }, [selectedStations, setSelectedStations]);

  const handleCustomToggle = useCallback((addressId: string) => {
    const newSelectedCustomAddresses = selectedCustomAddresses.includes(addressId)
      ? selectedCustomAddresses.filter(id => id !== addressId)
      : [...selectedCustomAddresses, addressId];
    setSelectedCustomAddresses(newSelectedCustomAddresses);
  }, [selectedCustomAddresses, setSelectedCustomAddresses]);

  const handleAddAddress = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.street || !formData.zipCode || !formData.city) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    addCustomAddress(formData);
    setFormData({ name: '', street: '', zipCode: '', city: '' });
    setShowAddForm(false);
    toast.success('Adresse erfolgreich hinzugefügt');
  }, [formData, addCustomAddress, setFormData, setShowAddForm]);

  const handleDeleteAddress = useCallback((addressId: string) => {
    deleteCustomAddress(addressId);
    const newSelectedCustomAddresses = selectedCustomAddresses.filter(id => id !== addressId);
    setSelectedCustomAddresses(newSelectedCustomAddresses);
    toast.success('Adresse gelöscht');
  }, [deleteCustomAddress, selectedCustomAddresses, setSelectedCustomAddresses]);

  const handleContinue = useCallback(() => {
    const totalSelected = selectedStations.length + selectedCustomAddresses.length;
    if (totalSelected === 0) {
      toast.error('Bitte wählen Sie mindestens ein Ziel aus');
      return;
    }
    setWizardStep(3);
  }, [selectedStations.length, selectedCustomAddresses.length, setWizardStep]);

  return {
    togglePraesidiumWithReviere,
    togglePraesidiumExpansion,
    handleStationToggle,
    handleCustomToggle,
    handleAddAddress,
    handleDeleteAddress,
    handleContinue
  };
};
 