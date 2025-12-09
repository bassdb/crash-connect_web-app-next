import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'
import type { DynamicValues } from '@/app/(editors)/_hooks/useDynamicValuesStore'

/**
 * Loads saved values from server/database
 * Merges with default values and updates both saved and preview values
 * @param values - Partial dynamic values to load
 */
export function loadSavedValues(values: Partial<DynamicValues>): void {
  const store = useDynamicValuesStore.getState()
  store._loadSavedValues(values)
}

