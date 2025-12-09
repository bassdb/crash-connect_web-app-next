'use client'

import { useEffect } from 'react'

// packages imports
import { initializeFabricCustomProperties } from '@/app/(editors)/_canvas-functions/layer-management/canvas-setup'

export default function FabricInitializer() {
  useEffect(() => {
    initializeFabricCustomProperties()
  }, [])

  return null
}


