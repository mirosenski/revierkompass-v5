import { Station } from '@/types/station.types'
import { mockStations } from './mock-data'

export const stationService = {
  getAllStations: async (): Promise<Station[]> => {
    return mockStations
  },
  getStationById: async (id: string): Promise<Station | null> => {
    const station = mockStations.find((s) => s.id === id)
    return station ?? null
  },
  getStationsByType: async (
    type: 'praesidium' | 'revier'
  ): Promise<Station[]> => {
    return mockStations.filter((s) => s.type === type)
  },
  getReviereByPraesidium: async (praesidiumId: string): Promise<Station[]> => {
    return mockStations.filter((s) => s.parentId === praesidiumId)
  },
}
