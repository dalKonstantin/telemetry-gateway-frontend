import type { Telemetry } from '../types/telemetry';

interface DeviceCardProps {
  deviceId: string;
  telemetry: Telemetry | null;
  loading: boolean;
  error: string | null;
  onClick: () => void;
}

export function DeviceCard({ deviceId, telemetry, loading, error, onClick }: DeviceCardProps) {
  const sensorOk = telemetry?.sensor_ok ?? true;

  return (
    <button
      type="button"
      className={`device-card ${sensorOk ? 'device-card--ok' : 'device-card--error'}`}
      onClick={onClick}
      disabled={loading && !telemetry}
    >
      <header className="device-card__header">
        <span className="device-card__status" aria-hidden="true" />
        <h2 className="device-card__title">{deviceId}</h2>
      </header>

      {loading && !telemetry && <p className="device-card__message">Загрузка…</p>}
      {error && !telemetry && <p className="device-card__message device-card__message--error">{error}</p>}

      {telemetry && (
        <dl className="device-card__metrics">
          <div className="device-card__metric">
            <dt>Температура</dt>
            <dd>{telemetry.temperature_c.toFixed(1)} °C</dd>
          </div>
          <div className="device-card__metric">
            <dt>Влажность</dt>
            <dd>{telemetry.humidity_percent.toFixed(1)} %</dd>
          </div>
          <div className="device-card__metric">
            <dt>Давление</dt>
            <dd>{telemetry.pressure_hpa.toFixed(1)} hPa</dd>
          </div>
        </dl>
      )}
    </button>
  );
}
