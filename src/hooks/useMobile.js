import { useState, useEffect } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [screenSize, setScreenSize] = useState('desktop')

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setIsMobile(true)
        setIsTablet(false)
        setScreenSize('mobile')
      } else if (width < 1024) {
        setIsMobile(false)
        setIsTablet(true)
        setScreenSize('tablet')
      } else {
        setIsMobile(false)
        setIsTablet(false)
        setScreenSize('desktop')
      }
    }

    // Verificar tamaño inicial
    checkScreenSize()

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return {
    isMobile,
    isTablet,
    screenSize,
    isMobileOrTablet: isMobile || isTablet
  }
}
