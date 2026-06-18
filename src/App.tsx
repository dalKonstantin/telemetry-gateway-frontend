import { useCallback, useEffect, useState } from 'react';
import { fetchDevices, fetchLatestTelemetry } from './api/telemetry';
import { DeviceCard } from './components/DeviceCard';
import { DeviceDetail } from './components/DeviceDetail';
import type { Telemetry } from './types/telemetry';
import './App.css';

type DeviceTelemetryState = {
  telemetry: Telemetry | null;
  loading: boolean;
  error: string | null;
};

function App() {
  const [devices, setDevices] = useState<string[]>([]);
  const [telemetryByDevice, setTelemetryByDevice] = useState<Record<string, DeviceTelemetryState>>({});
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const loadAllTelemetry = useCallback(async (deviceList: string[]) => {
    if (deviceList.length === 0) return;

    setTelemetryByDevice((prev) => {
      const next = { ...prev };
      for (const deviceId of deviceList) {
        next[deviceId] = {
          telemetry: prev[deviceId]?.telemetry ?? null,
          loading: !prev[deviceId]?.telemetry,
          error: null,
        };
      }
      return next;
    });

    const results = await Promise.allSettled(
      deviceList.map((deviceId) => fetchLatestTelemetry(deviceId)),
    );

    setTelemetryByDevice((prev) => {
      const next = { ...prev };

      deviceList.forEach((deviceId, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          next[deviceId] = {
            telemetry: result.value,
            loading: false,
            error: null,
          };
        } else {
          const message =
            result.reason instanceof Error
              ? result.reason.message
              : 'Не удалось загрузить телеметрию';
          next[deviceId] = {
            telemetry: prev[deviceId]?.telemetry ?? null,
            loading: false,
            error: message,
          };
        }
      });

      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDevices() {
      setDevicesLoading(true);
      setDevicesError(null);

      try {
        const deviceList = await fetchDevices();
        if (cancelled) return;

        setDevices(deviceList);
        await loadAllTelemetry(deviceList);
      } catch (error) {
        if (cancelled) return;
        setDevicesError(error instanceof Error ? error.message : 'Не удалось загрузить устройства');
      } finally {
        if (!cancelled) {
          setDevicesLoading(false);
        }
      }
    }

    void loadDevices();

    return () => {
      cancelled = true;
    };
  }, [loadAllTelemetry]);

  useEffect(() => {
    if (devices.length === 0) return;

    const intervalId = window.setInterval(() => {
      void loadAllTelemetry(devices);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [devices, loadAllTelemetry]);

  const selectedState = selectedDevice ? telemetryByDevice[selectedDevice] : null;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Telemetry Gateway</h1>
        <p className="app__subtitle">Дашборд ESP32-устройств</p>
      </header>

      <main className="app__main">
        {devicesLoading && <p className="status-message">Загрузка устройств…</p>}
        {devicesError && <p className="status-message status-message--error">{devicesError}</p>}

        {!devicesLoading && !devicesError && devices.length === 0 && (
          <p className="status-message">Устройства не найдены.</p>
        )}

        {!devicesLoading && !devicesError && devices.length > 0 && (
          <section className="dashboard-grid" aria-live="polite">
            {devices.map((deviceId) => {
              const state = telemetryByDevice[deviceId];
              return (
                <DeviceCard
                  key={deviceId}
                  deviceId={deviceId}
                  telemetry={state?.telemetry ?? null}
                  loading={state?.loading ?? true}
                  error={state?.error ?? null}
                  onClick={() => setSelectedDevice(deviceId)}
                />
              );
            })}
          </section>
        )}
      </main>

      {selectedDevice && (
        <DeviceDetail
          deviceId={selectedDevice}
          telemetry={selectedState?.telemetry ?? null}
          loading={selectedState?.loading ?? true}
          error={selectedState?.error ?? null}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}

export default App;
