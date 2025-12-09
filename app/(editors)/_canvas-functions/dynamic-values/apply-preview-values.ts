import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'

/**
 * Applies preview values to saved values
 * Call this when user confirms their changes
 */
export function applyPreviewValues(): void {
  const store = useDynamicValuesStore.getState()
  store._applyPreviewValues()
}

