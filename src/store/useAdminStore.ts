import { create } from 'zustand'
import { Station } from '@/types/station.types'
import { stationService } from '@/services/api/station.service'
import { adminStationService } from '@/services/api/admin-station.service'

interface AdminStore {
  stations: Station[]
  isLoading: boolean
  error: string | null

  loadStations: () => Promise<void>
  createStation: (
    station: Omit<Station, 'id' | 'lastModified'>
  ) => Promise<void>
  updateStation: (id: string, updates: Partial<Station>) => Promise<void>
  deleteStation: (id: string) => Promise<void>
  toggleStationActive: (id: string) => Promise<void>
  bulkUpdateStations: (
    updates: Array<{ id: string; changes: Partial<Station> }>
  ) => Promise<void>
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stations: [],
  isLoading: false,
  error: null,

  loadStations: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await stationService.getAllStations()
      set({ stations: data, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  createStation: async (station) => {
    set({ isLoading: true, error: null })
    try {
      const created = await adminStationService.createStation(station)
      set({ stations: [...get().stations, created], isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  updateStation: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await adminStationService.updateStation(id, updates)
      set({
        stations: get().stations.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  deleteStation: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await adminStationService.deleteStation(id)
      set({
        stations: get().stations.filter((s) => s.id !== id),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  toggleStationActive: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await adminStationService.toggleStationActive(id)
      set({
        stations: get().stations.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },

  bulkUpdateStations: async (updates) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await adminStationService.bulkUpdateStations(updates)
      set({
        stations: get().stations.map((s) => {
          const change = updated.find((u) => u.id === s.id)
          return change ? change : s
        }),
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },
}))
