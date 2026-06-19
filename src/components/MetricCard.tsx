interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "warning" | "danger" | "accent";
}

export function MetricCard({ label, value, unit, tone = "default" }: MetricCardProps) {
  return (
    <section className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      {unit ? <span className="metric-card__unit">{unit}</span> : null}
    </section>
  );
}
