import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'

/**
 * Resets preview values to default values
 * Saved values remain unchanged
 */
export function resetToDefaults(): void {
  const store = useDynamicValuesStore.getState()
  store._resetToDefaults()
}

