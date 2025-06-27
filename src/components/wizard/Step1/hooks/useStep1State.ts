import { useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { AddressData } from '../types';

export const useStep1State = () => {
  const [address, setAddress] = useState('');
  const { setStartAddress, setWizardStep, wizard } = useAppStore();

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
  };

  const handleSubmit = (inputAddress: string) => {
    if (!inputAddress.trim()) {
      return false;
    }

    // Simuliere sofortige Geocoding-Ergebnisse (für Demo-Zwecke)
    const coordinates = {
      lat: 48.7758 + (Math.random() - 0.5) * 0.1,
      lng: 9.1829 + (Math.random() - 0.5) * 0.1
    };

    const addressData: AddressData = {
      street: inputAddress.split(',')[0] || inputAddress,
      houseNumber: '',
      zipCode: '70173',
      city: 'Stuttgart',
      fullAddress: inputAddress,
      coordinates,
      accuracy: 95
    };

    setStartAddress(addressData);
    
    // Sofort zu Schritt 2 weiterleiten
    setWizardStep(2);
    
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return handleSubmit(address);
  };

  const handleDemoAddress = (demoAddress: string) => {
    setAddress(demoAddress);
    return handleSubmit(demoAddress);
  };

  return {
    address,
    startAddress: wizard.startAddress as AddressData | null,
    handleAddressChange,
    handleFormSubmit,
    handleDemoAddress
  };
}; 