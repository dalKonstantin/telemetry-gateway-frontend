export interface DeviceListResponse {
  devices: string[];
}

export interface Telemetry {
  device_id: string;
  temperature_c: number;
  humidity_percent: number;
  pressure_hpa: number;
  timestamp_unix: number;
  uptime_ms: number;
  sensor_ok: boolean;
  error_count: number;
  received_at: string;
}
