interface TelemetryCardProps {
  label: string;
  value: string;
  status?: 'ok' | 'error' | 'neutral';
}

export function TelemetryCard({ label, value, status = 'neutral' }: TelemetryCardProps) {
  return (
    <article className={`telemetry-card telemetry-card--${status}`}>
      <h3 className="telemetry-card__label">{label}</h3>
      <p className="telemetry-card__value">{value}</p>
    </article>
  );
}
