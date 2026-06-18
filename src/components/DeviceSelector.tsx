interface DeviceSelectorProps {
  devices: string[];
  selectedDevice: string;
  onSelect: (deviceId: string) => void;
}

export function DeviceSelector({ devices, selectedDevice, onSelect }: DeviceSelectorProps) {
  return (
    <label className="device-selector">
      <span className="device-selector__label">Device</span>
      <select
        className="device-selector__select"
        value={selectedDevice}
        onChange={(event) => onSelect(event.target.value)}
      >
        {devices.map((device) => (
          <option key={device} value={device}>
            {device}
          </option>
        ))}
      </select>
    </label>
  );
}
