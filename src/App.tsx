import { useEffect, useState } from 'react';
import { fetchDevices, fetchLatestTelemetry } from './api/telemetry';
import { DeviceSelector } from './components/DeviceSelector';
import { TelemetryCard } from './components/TelemetryCard';
import type { Telemetry } from './types/telemetry';
import './App.css';

function formatUptime(uptimeMs: number): string {
  const totalSeconds = Math.floor(uptimeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function App() {
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDevices() {
      setDevicesLoading(true);
      setDevicesError(null);

      try {
        const deviceList = await fetchDevices();
        if (cancelled) return;

        setDevices(deviceList);
        if (deviceList.length > 0) {
          setSelectedDevice(deviceList[0]);
        }
      } catch (error) {
        if (cancelled) return;
        setDevicesError(error instanceof Error ? error.message : 'Failed to load devices');
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
  }, []);

  useEffect(() => {
    if (!selectedDevice) {
      setTelemetry(null);
      return;
    }

    let cancelled = false;

    async function loadTelemetry() {
      setTelemetryLoading(true);
      setTelemetryError(null);

      try {
        const latest = await fetchLatestTelemetry(selectedDevice);
        if (cancelled) return;
        setTelemetry(latest);
      } catch (error) {
        if (cancelled) return;
        setTelemetryError(error instanceof Error ? error.message : 'Failed to load telemetry');
        setTelemetry(null);
      } finally {
        if (!cancelled) {
          setTelemetryLoading(false);
        }
      }
    }

    void loadTelemetry();

    const intervalId = window.setInterval(() => {
      void loadTelemetry();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedDevice]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Telemetry Gateway</h1>
        <p className="app__subtitle">Live ESP32 sensor readings</p>
      </header>

      <main className="app__main">
        {devicesLoading && <p className="status-message">Loading devices…</p>}
        {devicesError && <p className="status-message status-message--error">{devicesError}</p>}

        {!devicesLoading && !devicesError && devices.length === 0 && (
          <p className="status-message">No devices found.</p>
        )}

        {!devicesLoading && !devicesError && devices.length > 0 && (
          <>
            <DeviceSelector
              devices={devices}
              selectedDevice={selectedDevice}
              onSelect={setSelectedDevice}
            />

            {telemetryLoading && !telemetry && (
              <p className="status-message">Loading telemetry…</p>
            )}
            {telemetryError && (
              <p className="status-message status-message--error">{telemetryError}</p>
            )}

            {telemetry && (
              <section className="telemetry-grid" aria-live="polite">
                <TelemetryCard
                  label="Temperature"
                  value={`${telemetry.temperature_c.toFixed(1)} °C`}
                />
                <TelemetryCard
                  label="Humidity"
                  value={`${telemetry.humidity_percent.toFixed(1)} %`}
                />
                <TelemetryCard
                  label="Pressure"
                  value={`${telemetry.pressure_hpa.toFixed(1)} hPa`}
                />
                <TelemetryCard
                  label="Sensor Status"
                  value={telemetry.sensor_ok ? 'OK' : 'Fault'}
                  status={telemetry.sensor_ok ? 'ok' : 'error'}
                />
                <TelemetryCard
                  label="Error Count"
                  value={String(telemetry.error_count)}
                  status={telemetry.error_count === 0 ? 'ok' : 'error'}
                />
                <TelemetryCard
                  label="Uptime"
                  value={formatUptime(telemetry.uptime_ms)}
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
