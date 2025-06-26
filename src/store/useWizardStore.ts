import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WizardStore {
  currentStep: 1 | 2 | 3
  startAddress: string
  selectedPraesidiumId: string | null
  selectedReviereIds: string[]

  setStep: (step: 1 | 2 | 3) => void
  setStartAddress: (address: string) => void
  selectPraesidium: (id: string) => void
  toggleRevier: (id: string) => void
  resetWizard: () => void
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      startAddress: '',
      selectedPraesidiumId: null,
      selectedReviereIds: [],

      setStep: (step) => set({ currentStep: step }),
      setStartAddress: (address) => set({ startAddress: address }),
      selectPraesidium: (id) => set({ selectedPraesidiumId: id }),
      toggleRevier: (id) =>
        set((state) => ({
          selectedReviereIds: state.selectedReviereIds.includes(id)
            ? state.selectedReviereIds.filter((r) => r !== id)
            : [...state.selectedReviereIds, id]
        })),
      resetWizard: () =>
        set({ currentStep: 1, startAddress: '', selectedPraesidiumId: null, selectedReviereIds: [] })
    }),
    {
      name: 'wizard-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        startAddress: state.startAddress,
        selectedPraesidiumId: state.selectedPraesidiumId,
        selectedReviereIds: state.selectedReviereIds
      })
    }
  )
)
