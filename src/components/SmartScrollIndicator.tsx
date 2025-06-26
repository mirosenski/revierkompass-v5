import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface SmartScrollIndicatorProps {
  totalSelected: number
  onContinue: () => void
}

const SmartScrollIndicator: React.FC<SmartScrollIndicatorProps> = ({ totalSelected, onContinue }) => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showQuickAction, setShowQuickAction] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrolled / maxScroll) * 100
      setScrollProgress(progress)
      setShowQuickAction(progress > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <AnimatePresence>
        {showQuickAction && (
          <motion.button
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-black/90 text-white rounded-full backdrop-blur-xl shadow-lg z-50"
            onClick={onContinue}
          >
            <span className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>{totalSelected} Ziele - Weiter</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default SmartScrollIndicator
