import { useState } from 'react';
import type { RangePreset, TimeRange } from '../utils/timeRange';
import {
  fromDatetimeLocalValue,
  getRangeForPreset,
  RANGE_PRESETS,
  toDatetimeLocalValue,
} from '../utils/timeRange';

interface TimeRangePickerProps {
  preset: RangePreset;
  customFrom: string;
  customTo: string;
  onPresetChange: (preset: RangePreset) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onApplyCustom: (range: TimeRange) => void;
}

export function TimeRangePicker({
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
}: TimeRangePickerProps) {
  const [customError, setCustomError] = useState<string | null>(null);

  function handlePresetClick(nextPreset: RangePreset) {
    setCustomError(null);
    onPresetChange(nextPreset);
  }

  function handleApplyCustom() {
    const from = fromDatetimeLocalValue(customFrom);
    const to = fromDatetimeLocalValue(customTo);

    if (!from || !to) {
      setCustomError('Укажите начало и конец интервала');
      return;
    }
    if (to <= from) {
      setCustomError('Конец интервала должен быть позже начала');
      return;
    }

    setCustomError(null);
    onApplyCustom({ from, to });
  }

  function handleShowCustom() {
    const range = getRangeForPreset('24h');
    onCustomFromChange(toDatetimeLocalValue(range.from));
    onCustomToChange(toDatetimeLocalValue(range.to));
    onPresetChange('custom');
    onApplyCustom(range);
  }

  return (
    <div className="time-range-picker">
      <div className="time-range-picker__presets" role="group" aria-label="Быстрый выбор периода">
        {RANGE_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`time-range-picker__preset ${preset === item.id ? 'time-range-picker__preset--active' : ''}`}
            onClick={() => handlePresetClick(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className={`time-range-picker__preset ${preset === 'custom' ? 'time-range-picker__preset--active' : ''}`}
          onClick={handleShowCustom}
        >
          Свой интервал
        </button>
      </div>

      {preset === 'custom' && (
        <div className="time-range-picker__custom">
          <label className="time-range-picker__field">
            <span>От</span>
            <input
              type="datetime-local"
              value={customFrom}
              onChange={(event) => onCustomFromChange(event.target.value)}
            />
          </label>
          <label className="time-range-picker__field">
            <span>До</span>
            <input
              type="datetime-local"
              value={customTo}
              onChange={(event) => onCustomToChange(event.target.value)}
            />
          </label>
          <button type="button" className="time-range-picker__apply" onClick={handleApplyCustom}>
            Применить
          </button>
          {customError && <p className="time-range-picker__error">{customError}</p>}
        </div>
      )}
    </div>
  );
}
