import { Station } from '@/types/station.types'
import { mockStations } from './mock-data'

export interface AdminStationService {
  createStation: (
    station: Omit<Station, 'id' | 'lastModified'>
  ) => Promise<Station>
  updateStation: (id: string, updates: Partial<Station>) => Promise<Station>
  deleteStation: (id: string) => Promise<boolean>
  toggleStationActive: (id: string) => Promise<Station>
  bulkUpdateStations: (
    updates: Array<{ id: string; changes: Partial<Station> }>
  ) => Promise<Station[]>
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
const randomDelay = () => delay(100 + Math.random() * 200)

let stations: Station[] = mockStations.map((s) => ({ ...s }))

const generateId = () =>
  `station_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const validateParent = (parentId: string | undefined) => {
  if (!parentId) return false
  return stations.some((s) => s.id === parentId && s.type === 'praesidium')
}

export const adminStationService: AdminStationService = {
  async createStation(station) {
    await randomDelay()
    if (station.type === 'revier' && !validateParent(station.parentId)) {
      throw new Error('Invalid parentId for Revier')
    }
    const newStation: Station = {
      ...station,
      id: generateId(),
      lastModified: new Date(),
    }
    stations = [...stations, newStation]
    return { ...newStation }
  },

  async updateStation(id, updates) {
    await randomDelay()
    const index = stations.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Station not found')
    const current = stations[index]
    if (
      (updates.type === 'revier' || current.type === 'revier') &&
      updates.parentId !== undefined &&
      !validateParent(updates.parentId)
    ) {
      throw new Error('Invalid parentId for Revier')
    }
    const updated: Station = {
      ...current,
      ...updates,
      lastModified: new Date(),
    }
    stations = [
      ...stations.slice(0, index),
      updated,
      ...stations.slice(index + 1),
    ]
    return { ...updated }
  },

  async deleteStation(id) {
    await randomDelay()
    const index = stations.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Station not found')
    stations = [...stations.slice(0, index), ...stations.slice(index + 1)]
    return true
  },

  async toggleStationActive(id) {
    await randomDelay()
    const index = stations.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Station not found')
    const updated = {
      ...stations[index],
      isActive: !stations[index].isActive,
      lastModified: new Date(),
    }
    stations = [
      ...stations.slice(0, index),
      updated,
      ...stations.slice(index + 1),
    ]
    return { ...updated }
  },

  async bulkUpdateStations(updates) {
    await randomDelay()
    const results: Station[] = []
    for (const { id, changes } of updates) {
      const index = stations.findIndex((s) => s.id === id)
      if (index === -1) throw new Error(`Station not found: ${id}`)
      if (
        (changes.type === 'revier' || stations[index].type === 'revier') &&
        changes.parentId !== undefined &&
        !validateParent(changes.parentId)
      ) {
        throw new Error('Invalid parentId for Revier')
      }
      const updated: Station = {
        ...stations[index],
        ...changes,
        lastModified: new Date(),
      }
      stations[index] = updated
      results.push({ ...updated })
    }
    return results
  },
}
