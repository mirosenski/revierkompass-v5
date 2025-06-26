import { create } from 'zustand'
import { Station } from '@/types/station.types'
import { stationService } from '@/services/api/station.service'

interface StationStore {
  stations: Station[]
  isLoading: boolean
  error: string | null

  loadStations: () => Promise<void>
  getStationsByType: (type: 'praesidium' | 'revier') => Station[]
  getReviereByPraesidium: (praesidiumId: string) => Station[]
  getPraesidiumById: (id: string) => Station | undefined
}

export const useStationStore = create<StationStore>((set, get) => ({
  stations: [],
  isLoading: false,
  error: null,

  loadStations: async () => {
    if (get().stations.length > 0 || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const data = await stationService.getAllStations()
      set({ stations: data, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  getStationsByType: (type) => get().stations.filter((s) => s.type === type),

  getReviereByPraesidium: (praesidiumId) =>
    get().stations.filter((s) => s.parentId === praesidiumId),

  getPraesidiumById: (id) =>
    get().stations.find((s) => s.id === id && s.type === 'praesidium')
}))
