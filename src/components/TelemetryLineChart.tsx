import { useMemo } from 'react';
import { formatChartTime } from '../utils/timeRange';

export interface ChartPoint {
  time: number;
  value: number;
}

interface TelemetryLineChartProps {
  title: string;
  unit: string;
  color: string;
  data: ChartPoint[];
  rangeMs: number;
}

const CHART_WIDTH = 800;
const CHART_HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 36, left: 52 };

function niceStep(range: number): number {
  const rough = range / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function TelemetryLineChart({ title, unit, color, data, rangeMs }: TelemetryLineChartProps) {
  const chart = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const times = data.map((point) => point.time);
    const values = data.map((point) => point.value);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const valuePadding = maxValue === minValue ? 1 : (maxValue - minValue) * 0.1;
    const yMin = minValue - valuePadding;
    const yMax = maxValue + valuePadding;
    const yRange = yMax - yMin || 1;
    const timeRange = maxTime - minTime || 1;

    const points = data.map((point) => {
      const x = PADDING.left + ((point.time - minTime) / timeRange) * plotWidth;
      const y = PADDING.top + plotHeight - ((point.value - yMin) / yRange) * plotHeight;
      return { x, y, ...point };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');

    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(PADDING.top + plotHeight).toFixed(2)} L ${points[0].x.toFixed(2)} ${(PADDING.top + plotHeight).toFixed(2)} Z`;

    const step = niceStep(yRange);
    const gridStart = Math.ceil(yMin / step) * step;
    const yTicks: number[] = [];
    for (let value = gridStart; value <= yMax; value += step) {
      yTicks.push(value);
    }

    const xTickCount = Math.min(5, data.length);
    const xTicks: number[] = [];
    if (xTickCount === 1) {
      xTicks.push(minTime);
    } else {
      for (let index = 0; index < xTickCount; index += 1) {
        xTicks.push(minTime + (timeRange * index) / (xTickCount - 1));
      }
    }

    return {
      linePath,
      areaPath,
      yTicks,
      xTicks,
      yMin,
      yMax,
      plotHeight,
      plotWidth,
      minTime,
      maxTime,
    };
  }, [data]);

  if (!chart) {
    return (
      <article className="telemetry-chart">
        <header className="telemetry-chart__header">
          <h3>{title}</h3>
          <span className="telemetry-chart__unit">{unit}</span>
        </header>
        <p className="telemetry-chart__empty">Нет данных за выбранный период</p>
      </article>
    );
  }

  return (
    <article className="telemetry-chart">
      <header className="telemetry-chart__header">
        <h3>{title}</h3>
        <span className="telemetry-chart__unit">{unit}</span>
      </header>
      <svg
        className="telemetry-chart__svg"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`${title} за выбранный период`}
      >
        {chart.yTicks.map((value) => {
          const y =
            PADDING.top +
            chart.plotHeight -
            ((value - chart.yMin) / (chart.yMax - chart.yMin || 1)) * chart.plotHeight;
          return (
            <g key={value}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + chart.plotWidth}
                y2={y}
                className="telemetry-chart__grid"
              />
              <text x={PADDING.left - 8} y={y + 4} className="telemetry-chart__axis-label" textAnchor="end">
                {value.toFixed(value >= 100 ? 0 : 1)}
              </text>
            </g>
          );
        })}

        <path d={chart.areaPath} className="telemetry-chart__area" style={{ fill: color }} />
        <path d={chart.linePath} className="telemetry-chart__line" style={{ stroke: color }} />

        {chart.xTicks.map((time) => {
          const x =
            PADDING.left +
            ((time - chart.minTime) / (chart.maxTime - chart.minTime || 1)) * chart.plotWidth;
          return (
            <text
              key={time}
              x={x}
              y={CHART_HEIGHT - 8}
              className="telemetry-chart__axis-label telemetry-chart__axis-label--x"
              textAnchor="middle"
            >
              {formatChartTime(time, rangeMs)}
            </text>
          );
        })}
      </svg>
    </article>
  );
}
