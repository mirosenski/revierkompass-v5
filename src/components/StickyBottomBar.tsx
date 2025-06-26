import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface StickyBottomBarProps {
  totalSelected: number
  onContinue: () => void
  disabled?: boolean
}

const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ totalSelected, onContinue, disabled }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 z-40 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        disabled={disabled}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium shadow-lg disabled:opacity-50 flex items-center space-x-2"
      >
        <span>Weiter →</span>
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </div>
  </div>
)

export default StickyBottomBar
