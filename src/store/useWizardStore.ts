import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WizardStoreState {
  selectedReviereIds: string[];
  selectedStations: string[];
  resetAll: () => void;
}

const useWizardStore = create<WizardStoreState>()(
  persist(
    (set) => ({
      selectedReviereIds: [],
      selectedStations: [],
      resetAll: () => set({
        selectedReviereIds: [],
        selectedStations: [],
      }),
    }),
    {
      name: 'wizard-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useWizardStore };
export type { WizardStoreState }; 