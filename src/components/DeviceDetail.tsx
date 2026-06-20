import { useEffect, useMemo, useState } from 'react';
import { fetchTelemetryHistory } from '../api/telemetry';
import type { Telemetry } from '../types/telemetry';
import {
  formatRangeLabel,
  getRangeForPreset,
  toApiTimestamp,
  type RangePreset,
  type TimeRange,
} from '../utils/timeRange';
import { TelemetryCard } from './TelemetryCard';
import { TelemetryLineChart } from './TelemetryLineChart';
import { TimeRangePicker } from './TimeRangePicker';

interface DeviceDetailProps {
  deviceId: string;
  telemetry: Telemetry | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

type DetailTab = 'overview' | 'history';

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

function buildRange(preset: RangePreset, customRange: TimeRange | null): TimeRange {
  if (preset === 'custom' && customRange) {
    return customRange;
  }
  return getRangeForPreset(preset === 'custom' ? '1h' : preset);
}

export function DeviceDetail({ deviceId, telemetry, loading, error, onClose }: DeviceDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [rangePreset, setRangePreset] = useState<RangePreset>('1h');
  const [customRange, setCustomRange] = useState<TimeRange | null>(null);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [historyData, setHistoryData] = useState<Telemetry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const activeRange = useMemo(
    () => buildRange(rangePreset, customRange),
    [rangePreset, customRange],
  );

  useEffect(() => {
    if (activeTab !== 'history') return;

    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const items = await fetchTelemetryHistory(
          deviceId,
          toApiTimestamp(activeRange.from),
          toApiTimestamp(activeRange.to),
        );
        if (cancelled) return;

        const sorted = [...items].sort((a, b) => a.timestamp_unix - b.timestamp_unix);
        setHistoryData(sorted);
      } catch (loadError) {
        if (cancelled) return;
        setHistoryError(
          loadError instanceof Error ? loadError.message : 'Не удалось загрузить историю',
        );
        setHistoryData([]);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [activeTab, deviceId, activeRange.from, activeRange.to]);

  const rangeMs = activeRange.to.getTime() - activeRange.from.getTime();

  const temperaturePoints = historyData.map((item) => ({
    time: item.timestamp_unix,
    value: item.temperature_c,
  }));
  const humidityPoints = historyData.map((item) => ({
    time: item.timestamp_unix,
    value: item.humidity_percent,
  }));
  const pressurePoints = historyData.map((item) => ({
    time: item.timestamp_unix,
    value: item.pressure_hpa,
  }));

  function handlePresetChange(nextPreset: RangePreset) {
    setRangePreset(nextPreset);
    if (nextPreset !== 'custom') {
      setCustomRange(null);
    }
  }

  function handleApplyCustom(range: TimeRange) {
    setCustomRange(range);
    setRangePreset('custom');
  }

  return (
    <div className="device-detail-backdrop" onClick={onClose} role="presentation">
      <dialog
        className={`device-detail ${activeTab === 'history' ? 'device-detail--wide' : ''}`}
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

        <div className="device-detail__tabs" role="tablist" aria-label="Разделы устройства">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`device-detail__tab ${activeTab === 'overview' ? 'device-detail__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Сейчас
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'history'}
            className={`device-detail__tab ${activeTab === 'history' ? 'device-detail__tab--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            История
          </button>
        </div>

        {activeTab === 'overview' && (
          <section role="tabpanel">
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
          </section>
        )}

        {activeTab === 'history' && (
          <section className="device-history" role="tabpanel">
            <TimeRangePicker
              preset={rangePreset}
              customFrom={customFrom}
              customTo={customTo}
              onPresetChange={handlePresetChange}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
              onApplyCustom={handleApplyCustom}
            />

            <p className="device-history__range">{formatRangeLabel(activeRange.from, activeRange.to)}</p>

            {historyLoading && <p className="status-message">Загрузка истории…</p>}
            {historyError && <p className="status-message status-message--error">{historyError}</p>}

            {!historyLoading && !historyError && (
              <>
                <p className="device-history__count">Точек данных: {historyData.length}</p>
                <div className="device-history__charts">
                  <TelemetryLineChart
                    title="Температура"
                    unit="°C"
                    color="#f28b82"
                    data={temperaturePoints}
                    rangeMs={rangeMs}
                  />
                  <TelemetryLineChart
                    title="Влажность"
                    unit="%"
                    color="#5c9eff"
                    data={humidityPoints}
                    rangeMs={rangeMs}
                  />
                  <TelemetryLineChart
                    title="Давление"
                    unit="hPa"
                    color="#81c995"
                    data={pressurePoints}
                    rangeMs={rangeMs}
                  />
                </div>
              </>
            )}
          </section>
        )}
      </dialog>
    </div>
  );
}
