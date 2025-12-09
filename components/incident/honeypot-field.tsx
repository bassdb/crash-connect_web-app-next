'use client'

interface HoneypotFieldProps {
  value: string
  onChange: (value: string) => void
}

export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <input
      type="text"
      name="website"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
      tabIndex={-1}
      className="absolute left-[-9999px] opacity-0"
      aria-hidden="true"
    />
  )
}

