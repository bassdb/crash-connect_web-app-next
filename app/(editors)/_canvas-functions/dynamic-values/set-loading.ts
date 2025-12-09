import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'

/**
 * Sets the loading state for dynamic values
 * @param isLoading - Loading state
 */
export function setDynamicValuesLoading(isLoading: boolean): void {
  const store = useDynamicValuesStore.getState()
  store._setIsLoading(isLoading)
}

