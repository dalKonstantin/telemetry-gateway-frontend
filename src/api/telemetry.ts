import type { DeviceListResponse, Telemetry } from '../types/telemetry';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchDevices(): Promise<string[]> {
  const response = await fetch('/api/devices');
  const data = await handleResponse<DeviceListResponse>(response);
  return data.devices;
}

export async function fetchLatestTelemetry(deviceId: string): Promise<Telemetry> {
  const response = await fetch(`/api/devices/${encodeURIComponent(deviceId)}/telemetry/latest`);
  return handleResponse<Telemetry>(response);
}
