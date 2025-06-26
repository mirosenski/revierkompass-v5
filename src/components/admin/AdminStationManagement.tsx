import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAdminStore } from '@/store/useAdminStore'
import { Station, StationType } from '@/types/station.types'

const AdminStationManagement: React.FC = () => {
  const {
    stations,
    isLoading,
    error,
    loadStations,
    createStation,
    deleteStation,
    updateStation,
  } = useAdminStore()

  const [newStation, setNewStation] = useState<Partial<Station>>({})
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Station>>({})

  useEffect(() => {
    loadStations()
  }, [loadStations])

  const handleCreate = async () => {
    try {
      if (!newStation.name || !newStation.coordinates?.[0] || !newStation.coordinates?.[1]) {
        toast.error('Bitte füllen Sie alle erforderlichen Felder aus')
        return
      }

      await createStation({
        ...newStation,
        coordinates: [newStation.coordinates[0], newStation.coordinates[1]],
      } as Station)

      setNewStation({})
      toast.success('Station erfolgreich erstellt')
    } catch (err) {
      console.error('Erstellung fehlgeschlagen:', err)
      toast.error('Fehler bei der Station-Erstellung')
    }
  }

  const handleEdit = (station: Station) => {
    setEditingStation(station)
    setEditFormData({
      name: station.name,
      coordinates: station.coordinates,
      type: station.type,
    })
  }

  const handleUpdate = async () => {
    if (!editingStation) return

    try {
      if (!editFormData.name || !editFormData.coordinates?.[0] || !editFormData.coordinates?.[1]) {
        toast.error('Bitte füllen Sie alle erforderlichen Felder aus')
        return
      }

      await updateStation(editingStation.id, {
        ...editFormData,
        coordinates: [editFormData.coordinates[0], editFormData.coordinates[1]],
        type: editFormData.type || editingStation.type,
      })

      setEditingStation(null)
      toast.success('Station aktualisiert')
    } catch (error) {
      console.error('Update fehlgeschlagen:', error)
      toast.error('Fehler bei der Aktualisierung')
    }
  }

  if (isLoading) return <div className="p-4 text-gray-500">Lade Stationen...</div>
  if (error) return <div className="p-4 text-red-500">Fehler: {error}</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Stationen verwalten
      </h2>

      {/* Create Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Neue Station erstellen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={newStation.name || ''}
            onChange={(e) =>
              setNewStation((prev) => ({ ...prev, name: e.target.value }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Lat"
              value={newStation.coordinates?.[0] || ''}
              onChange={(e) =>
                setNewStation((prev) => ({
                  ...prev,
                  coordinates: [
                    Number(e.target.value),
                    prev.coordinates?.[1] || 0,
                  ],
                }))
              }
              className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
            <input
              type="number"
              placeholder="Lng"
              value={newStation.coordinates?.[1] || ''}
              onChange={(e) =>
                setNewStation((prev) => ({
                  ...prev,
                  coordinates: [
                    prev.coordinates?.[0] || 0,
                    Number(e.target.value),
                  ],
                }))
              }
              className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <select
            value={newStation.type || ''}
            onChange={(e) =>
              setNewStation((prev) => ({
                ...prev,
                type: e.target.value as StationType,
              }))
            }
            className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="">Typ wählen</option>
            <option value="praesidium">Präsidium</option>
            <option value="revier">Revier</option>
          </select>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Erstellen</span>
          </button>
        </div>
      </div>

      {/* Station List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Bestehende Stationen</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {stations.map((station) => (
                <React.Fragment key={station.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">{station.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          station.type === 'praesidium'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        }`}
                      >
                        {station.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(station)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteStation(station.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingStation && editingStation.id === station.id && (
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td colSpan={4} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Name"
                            value={editFormData.name || ''}
                            onChange={(e) =>
                              setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Lat"
                              value={editFormData.coordinates?.[0] || ''}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  coordinates: [Number(e.target.value), prev.coordinates?.[1] || 0],
                                }))
                              }
                              className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                            />
                            <input
                              type="number"
                              placeholder="Lng"
                              value={editFormData.coordinates?.[1] || ''}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  coordinates: [prev.coordinates?.[0] || 0, Number(e.target.value)],
                                }))
                              }
                              className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                            />
                          </div>
                          <select
                            value={editFormData.type || ''}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                type: e.target.value as StationType,
                              }))
                            }
                            className="p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                          >
                            <option value="">Typ wählen</option>
                            <option value="praesidium">Präsidium</option>
                            <option value="revier">Revier</option>
                          </select>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdate}
                              disabled={isLoading}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
                            >
                              {isLoading ? 'Speichern...' : 'Speichern'}
                            </button>
                            <button
                              onClick={() => setEditingStation(null)}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg"
                            >
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminStationManagement
