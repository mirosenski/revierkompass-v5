/** @jest-environment jsdom */
import { useAppStore } from '../../src/lib/store/app-store';
import { useWizardStore } from '../../src/store/useWizardStore';

describe('resetAll', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      wizard: {
        currentStep: 2,
        startAddress: null,
        selectedCities: ['A'],
        selectedStations: ['1'],
        selectedCustomAddresses: ['x'],
        routeResults: []
      },
      customAddresses: [{
        id: '1',
        name: 'Name',
        street: '',
        zipCode: '',
        city: '',
        address: '',
        createdAt: new Date(),
        isSelected: false
      }]
    } as any);
    useWizardStore.setState({
      selectedReviereIds: ['a'],
      selectedStations: ['1'],
    } as any);
  });

  test('clears both stores', () => {
    // ensure values are set
    expect(useWizardStore.getState().selectedReviereIds).toEqual(['a']);

    useAppStore.getState().resetAll();

    expect(useAppStore.getState().wizard.currentStep).toBe(1);
    expect(useWizardStore.getState().selectedReviereIds).toEqual([]);
  });
});
