import React, { ReactNode, useEffect, useState } from 'react'
import StickyBottomBar from './StickyBottomBar'
import SmartScrollIndicator from './SmartScrollIndicator'
import FloatingActionMenu from './FloatingActionMenu'

interface ModernNavigationProps {
  totalSelected: number
  onContinue: () => void
  children?: ReactNode
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

const ModernNavigation: React.FC<ModernNavigationProps> = ({ totalSelected, onContinue, children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <>
      {/* Desktop: Split View */}
      {isDesktop && (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">{children}</div>
          <div className="col-span-1 sticky top-4 h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Ausgewählte Ziele</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {totalSelected === 0 ? (
                  <p className="text-gray-500">Keine Ziele ausgewählt</p>
                ) : (
                  <p>{totalSelected} Ziele ausgewählt</p>
                )}
              </div>
              <StickyBottomBar totalSelected={totalSelected} onContinue={onContinue} disabled={totalSelected === 0} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile/Tablet: Kombinierte Navigation */}
      {isMobile && (
        <>
          <SmartScrollIndicator totalSelected={totalSelected} onContinue={onContinue} />
          <FloatingActionMenu totalSelected={totalSelected} onContinue={onContinue} />
        </>
      )}
    </>
  )
}

export default ModernNavigation
