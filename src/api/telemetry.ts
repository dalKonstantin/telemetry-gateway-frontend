import type { DeviceListResponse, Telemetry, TelemetryHistory } from '../types/telemetry';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchDevices(): Promise<string[]> {
  const response = await fetch('/api/devices');
  const data = await handleResponse<DeviceListResponse>(response);
  return data.devices ?? [];
}

export async function fetchLatestTelemetry(deviceId: string): Promise<Telemetry> {
  const response = await fetch(`/api/devices/${encodeURIComponent(deviceId)}/telemetry/latest`);
  return handleResponse<Telemetry>(response);
}

export async function fetchTelemetryHistory(
  deviceId: string,
  from: string,
  to: string,
): Promise<TelemetryHistory> {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(
    `/api/devices/${encodeURIComponent(deviceId)}/telemetry?${params.toString()}`,
  );
  const data = await handleResponse<TelemetryHistory | null>(response);
  return data ?? [];
}
