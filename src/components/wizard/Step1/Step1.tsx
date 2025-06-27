import React from 'react';
import { toast } from 'react-hot-toast';

// Components
import { Header } from './components/Header';
import { AddressForm } from './components/AddressForm';
import { DemoAddresses } from './components/DemoAddresses';
import { AddressConfirmation } from './components/AddressConfirmation';

// Hooks
import { useStep1State } from './hooks/useStep1State';

const Step1: React.FC = () => {
  const {
    address,
    startAddress,
    handleAddressChange,
    handleFormSubmit,
    handleDemoAddress
  } = useStep1State();

  const onSubmit = (e: React.FormEvent) => {
    const success = handleFormSubmit(e);
    if (success) {
      toast.success('Adresse erfolgreich geocodiert!');
    } else {
      toast.error('Bitte geben Sie eine Adresse ein');
    }
  };

  const onDemoAddressSelect = (demoAddress: string) => {
    const success = handleDemoAddress(demoAddress);
    if (success) {
      toast.success('Adresse erfolgreich geocodiert!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Header />

      {/* Address Input Form */}
      <AddressForm
        address={address}
        onAddressChange={handleAddressChange}
        onSubmit={onSubmit}
      />

      {/* Demo Addresses */}
      <DemoAddresses onDemoAddressSelect={onDemoAddressSelect} />

      {/* Current Address Display */}
      <AddressConfirmation startAddress={startAddress} />
    </div>
  );
};

export default Step1; 