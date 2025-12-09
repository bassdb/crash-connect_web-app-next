import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'

/**
 * Discards preview values and resets them to saved values
 * Call this when user cancels their changes
 */
export function discardPreviewValues(): void {
  const store = useDynamicValuesStore.getState()
  store._discardPreviewValues()
}

