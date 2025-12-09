import { cn } from '@/lib/utils'
import type { IncidentTypeOption } from '@/types/incident-types'

interface IncidentTypeChipProps {
  type: IncidentTypeOption
  selected: boolean
  onSelect: () => void
}

export function IncidentTypeChip({ type, selected, onSelect }: IncidentTypeChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 transition-all',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50'
      )}
    >
      <span className="text-4xl">{type.icon}</span>
      <span className="text-sm font-medium">{type.label}</span>
    </button>
  )
}

