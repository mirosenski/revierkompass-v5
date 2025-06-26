import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, Building } from 'lucide-react'

interface FloatingActionMenuProps {
  totalSelected: number
  onContinue: () => void
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ totalSelected, onContinue }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AnimatePresence>
      <motion.div className="fixed bottom-6 right-6 z-50">
        {isOpen && totalSelected === 0 && (
          <motion.div className="absolute bottom-20 right-0 space-y-3">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg"
            >
              <Building className="h-4 w-4" />
              <span className="text-sm">Alle Stationen</span>
            </motion.button>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => (totalSelected > 0 ? onContinue() : setIsOpen(!isOpen))}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center ${
            totalSelected > 0 ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          {totalSelected > 0 ? (
            <ArrowRight className="h-6 w-6 text-white" />
          ) : (
            <Plus className={`h-6 w-6 text-gray-600 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
          )}
          {totalSelected > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {totalSelected}
            </span>
          )}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

export default FloatingActionMenu
