interface PayloadEntry {
  dataKey: string
  value: number
  fill?: string
}

interface StatChartTooltipProps {
  active?: boolean
  payload?: PayloadEntry[]
  label?: string
}

export function StatChartTooltip({ active, payload, label }: StatChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-popover border border-border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="capitalize">
          {p.dataKey}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}
