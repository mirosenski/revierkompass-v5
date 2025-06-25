import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Check, 
  X, 
  Clock, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingAddress {
  id: string;
  name: string;
  street: string;
  zipCode: string;
  city: string;
  coordinates: { lat: number; lng: number };
  isAnonymous: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
}

const AddressReviewTab: React.FC = () => {
  const [pendingAddresses, setPendingAddresses] = useState<PendingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<PendingAddress | null>(null);

  useEffect(() => {
    loadPendingAddresses();
  }, []);

  const loadPendingAddresses = async () => {
    try {
      setLoading(true);
      
      // Simuliere API-Aufruf (in production würde hier die echte API aufgerufen)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo-Daten für ausstehende Adressen
      const demoAddresses: PendingAddress[] = [
        {
          id: '1',
          name: 'Neue Polizeistation Teststadt',
          street: 'Musterstraße 123',
          zipCode: '70173',
          city: 'Stuttgart',
          coordinates: { lat: 48.7758, lng: 9.1829 },
          isAnonymous: true,
          reviewStatus: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Bürgerbüro Innenstadt',
          street: 'Hauptstraße 45',
          zipCode: '70191',
          city: 'Stuttgart',
          coordinates: { lat: 48.7733, lng: 9.1735 },
          isAnonymous: false,
          reviewStatus: 'pending',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'user1',
            email: 'buerger@example.com'
          }
        },
        {
          id: '3',
          name: 'Polizei Außenstelle',
          street: 'Nebenstraße 67',
          zipCode: '70469',
          city: 'Stuttgart',
          coordinates: { lat: 48.7606, lng: 9.1719 },
          isAnonymous: true,
          reviewStatus: 'pending',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      setPendingAddresses(demoAddresses);
    } catch (error) {
      console.error('Fehler beim Laden der ausstehenden Adressen:', error);
      toast.error('Fehler beim Laden der Adressen');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (addressId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      setReviewingId(addressId);
      
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Entferne die Adresse aus der Liste
      setPendingAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      toast.success(
        action === 'approve' 
          ? 'Adresse erfolgreich genehmigt' 
          : 'Adresse abgelehnt'
      );
      
      setShowNotesModal(false);
      setReviewNotes('');
      setCurrentAddress(null);
    } catch (error) {
      console.error('Fehler beim Überprüfen der Adresse:', error);
      toast.error('Fehler beim Überprüfen der Adresse');
    } finally {
      setReviewingId(null);
    }
  };

  const openNotesModal = (address: PendingAddress) => {
    setCurrentAddress(address);
    setShowNotesModal(true);
    setReviewNotes('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Vor wenigen Minuten';
    } else if (diffInHours < 24) {
      return `Vor ${diffInHours} Stunden`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Vor ${diffInDays} Tag${diffInDays > 1 ? 'en' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Adress-Review
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Überprüfen Sie eingereichte Adressen von Bürgern
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4" />
          <span>{pendingAddresses.length} ausstehend</span>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {pendingAddresses.length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Ausstehend
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                0
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Heute genehmigt
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                0
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Heute abgelehnt
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adress-Liste */}
      {pendingAddresses.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Alle Adressen überprüft
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Derzeit sind keine Adressen zur Überprüfung vorhanden.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAddresses.map((address) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {address.name}
                    </h3>
                    {address.isAnonymous ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <User className="h-3 w-3 mr-1" />
                        Anonym
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        Registriert
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Adresse:</strong> {address.street}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>PLZ/Ort:</strong> {address.zipCode} {address.city}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Koordinaten:</strong> {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        <strong>Eingereicht:</strong> {formatDate(address.createdAt)}
                      </p>
                      {address.user && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Benutzer:</strong> {address.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReview(address.id, 'approve')}
                    disabled={reviewingId === address.id}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {reviewingId === address.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span>Genehmigen</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openNotesModal(address)}
                    disabled={reviewingId === address.id}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Ablehnen</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openNotesModal(address)}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && currentAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Adresse ablehnen
              </h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Möchten Sie eine Begründung für die Ablehnung angeben?
            </p>

            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Begründung (optional)..."
              className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                Abbrechen
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReview(currentAddress.id, 'reject', reviewNotes)}
                disabled={reviewingId === currentAddress.id}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {reviewingId === currentAddress.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span>Ablehnen</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AddressReviewTab;
