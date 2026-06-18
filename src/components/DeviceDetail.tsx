import type { Telemetry } from '../types/telemetry';
import { TelemetryCard } from './TelemetryCard';

interface DeviceDetailProps {
  deviceId: string;
  telemetry: Telemetry | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

function formatUptime(uptimeMs: number): string {
  const totalSeconds = Math.floor(uptimeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}ч ${minutes}м ${seconds}с`;
  }
  if (minutes > 0) {
    return `${minutes}м ${seconds}с`;
  }
  return `${seconds}с`;
}

export function DeviceDetail({ deviceId, telemetry, loading, error, onClose }: DeviceDetailProps) {
  return (
    <div className="device-detail-backdrop" onClick={onClose} role="presentation">
      <dialog
        className="device-detail"
        open
        onClick={(event) => event.stopPropagation()}
        aria-labelledby="device-detail-title"
      >
        <header className="device-detail__header">
          <h2 id="device-detail-title">{deviceId}</h2>
          <button type="button" className="device-detail__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>

        {loading && !telemetry && <p className="status-message">Загрузка…</p>}
        {error && <p className="status-message status-message--error">{error}</p>}

        {telemetry && (
          <section className="telemetry-grid" aria-live="polite">
            <TelemetryCard
              label="Температура"
              value={`${telemetry.temperature_c.toFixed(1)} °C`}
            />
            <TelemetryCard
              label="Влажность"
              value={`${telemetry.humidity_percent.toFixed(1)} %`}
            />
            <TelemetryCard
              label="Давление"
              value={`${telemetry.pressure_hpa.toFixed(1)} hPa`}
            />
            <TelemetryCard
              label="Статус датчика"
              value={telemetry.sensor_ok ? 'OK' : 'Ошибка'}
              status={telemetry.sensor_ok ? 'ok' : 'error'}
            />
            <TelemetryCard
              label="Ошибки"
              value={String(telemetry.error_count)}
              status={telemetry.error_count === 0 ? 'ok' : 'error'}
            />
            <TelemetryCard
              label="Время работы"
              value={formatUptime(telemetry.uptime_ms)}
            />
          </section>
        )}
      </dialog>
    </div>
  );
}
