import { useMemo, useState } from 'react';
import { AirQualityResponse, AqiStandard, ForecastMetricKey } from '../types/airQuality';
import {
  findCleanestWindow,
  formatHourLabel,
  POLLUTANT_DEFINITIONS,
} from '../utils/aqi';

interface ForecastChartProps {
  data: AirQualityResponse;
  standard: AqiStandard;
  selectedMetric: ForecastMetricKey;
  onSelectMetric: (metric: ForecastMetricKey) => void;
}

const METRIC_OPTIONS: Array<{ key: ForecastMetricKey; label: string; unit: string }> = [
  { key: 'us_aqi', label: 'US EPA AQI', unit: 'US AQI' },
  { key: 'european_aqi', label: 'European EAQI', unit: 'EAQI' },
  { key: 'pm2_5', label: 'PM2.5', unit: 'µg/m³' },
  { key: 'pm10', label: 'PM10', unit: 'µg/m³' },
  { key: 'ozone', label: 'O3 (Ozone)', unit: 'µg/m³' },
  { key: 'nitrogen_dioxide', label: 'NO2', unit: 'µg/m³' },
  { key: 'sulphur_dioxide', label: 'SO2', unit: 'µg/m³' },
  { key: 'carbon_monoxide', label: 'CO', unit: 'µg/m³' },
];

export function ForecastChart({
  data,
  standard,
  selectedMetric,
  onSelectMetric,
}: ForecastChartProps) {
  const [hoursWindow, setHoursWindow] = useState<24 | 48 | 72>(24);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const slice = useMemo(() => {
    // Find index closest to current timestamp or start at 0
    const nowTime = data.current.time;
    const startIdx = Math.max(
      0,
      data.hourly.findIndex((h) => h.time >= nowTime)
    );
    return data.hourly.slice(startIdx, startIdx + hoursWindow);
  }, [data.hourly, data.current.time, hoursWindow]);

  const points = useMemo(() => {
    return slice.map((item, idx) => ({
      idx,
      time: item.time,
      label: formatHourLabel(item.time),
      dateLabel: item.time.slice(5, 10),
      value: item[selectedMetric],
    }));
  }, [slice, selectedMetric]);

  const validValues = points.map((p) => p.value).filter((v): v is number => typeof v === 'number');
  const minVal = validValues.length ? Math.min(...validValues) : 0;
  const maxVal = validValues.length ? Math.max(...validValues) : 100;
  const avgVal = validValues.length
    ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length
    : 0;

  const metricMeta = METRIC_OPTIONS.find((m) => m.key === selectedMetric) || METRIC_OPTIONS[0];
  const cleanestWindow = findCleanestWindow(slice, standard);

  // Reference threshold line if applicable
  const referenceLine = useMemo(() => {
    if (selectedMetric === 'us_aqi') return { value: 50, label: 'Good / Moderate (50)' };
    if (selectedMetric === 'european_aqi') return { value: 40, label: 'Fair / Moderate (40)' };
    if (selectedMetric in POLLUTANT_DEFINITIONS) {
      const def = POLLUTANT_DEFINITIONS[selectedMetric as keyof typeof POLLUTANT_DEFINITIONS];
      return { value: def.whoReference, label: `WHO Guideline (${def.whoReference} ${def.unit})` };
    }
    return null;
  }, [selectedMetric]);

  const width = 880;
  const height = 270;
  const padLeft = 52;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const chartMax = Math.max(
    maxVal * 1.15,
    referenceLine && referenceLine.value <= maxVal * 2.2 ? referenceLine.value * 1.15 : 0,
    10
  );
  const chartMin = 0;

  const coords = points.map((pt, i) => {
    const x = padLeft + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
    const val = pt.value ?? 0;
    const y = padTop + plotH - ((val - chartMin) / (chartMax - chartMin || 1)) * plotH;
    return { ...pt, x, y };
  });

  const linePath = coords
    .filter((c) => c.value !== null)
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  const validCoords = coords.filter((c) => c.value !== null);
  const areaPath =
    validCoords.length > 1
      ? `${linePath} L ${validCoords[validCoords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(
          1
        )} L ${validCoords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const activePoint =
    hoverIndex !== null && coords[hoverIndex]
      ? coords[hoverIndex]
      : coords[0] || null;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: chartMin + (chartMax - chartMin) * t,
    y: padTop + plotH - t * plotH,
  }));

  const xTickStep = Math.max(1, Math.floor(coords.length / 6));

  return (
    <section
      aria-label="Hourly Air Quality Forecast"
      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Hourly Air Quality Forecast
          </h2>
          <p className="text-sm text-slate-600">
            Modeled atmospheric forecast for {data.location.name} · Hover or tap the chart to inspect hourly projections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Forecast Horizon"
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
          >
            {([24, 48, 72] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setHoursWindow(h);
                  setHoverIndex(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  hoursWindow === h
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Next {h}h
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric selector strip */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {METRIC_OPTIONS.map((m) => {
          const active = selectedMetric === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelectMetric(m.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-teal-700 text-white'
                  : 'bg-sky-50/70 text-slate-700 hover:bg-sky-100 hover:text-teal-900'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 bg-sky-50/60 border border-sky-100 rounded-lg">
        <div>
          <div className="text-xs text-slate-500">Inspected Hour</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
            {activePoint ? `${activePoint.dateLabel} ${activePoint.label}` : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">{metricMeta.label}</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-teal-800">
            {activePoint && activePoint.value !== null
              ? `${activePoint.value.toFixed(selectedMetric.includes('aqi') ? 0 : 1)} ${metricMeta.unit}`
              : 'Unavailable'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">{hoursWindow}h Range (Min / Max)</div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
            {validValues.length
              ? `${minVal.toFixed(selectedMetric.includes('aqi') ? 0 : 1)} – ${maxVal.toFixed(
                  selectedMetric.includes('aqi') ? 0 : 1
                )}`
              : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">
            {cleanestWindow ? 'Cleanest 3h Window' : `${hoursWindow}h Average`}
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-emerald-700">
            {cleanestWindow
              ? `${cleanestWindow.start}–${cleanestWindow.end}`
              : validValues.length
              ? `${avgVal.toFixed(1)} ${metricMeta.unit}`
              : '—'}
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      {validValues.length === 0 ? (
        <div className="mt-6 py-12 text-center border border-dashed border-slate-200 rounded-lg text-sm text-slate-500">
          Hourly forecast values are unavailable for {metricMeta.label} at this location.
        </div>
      ) : (
        <div className="mt-5 relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none cursor-crosshair"
            role="img"
            aria-label={`Line chart showing ${metricMeta.label} forecast for the next ${hoursWindow} hours`}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="airAwareAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines */}
            {yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={width - padRight}
                  y2={tick.y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px] font-mono"
                >
                  {tick.value >= 100 ? Math.round(tick.value) : tick.value.toFixed(0)}
                </text>
              </g>
            ))}

            {/* Reference threshold guide line */}
            {referenceLine && referenceLine.value <= chartMax && (
              <g>
                <line
                  x1={padLeft}
                  y1={padTop + plotH - (referenceLine.value / chartMax) * plotH}
                  x2={width - padRight}
                  y2={padTop + plotH - (referenceLine.value / chartMax) * plotH}
                  stroke="#0284C7"
                  strokeWidth="1.25"
                  strokeDasharray="5 4"
                />
                <text
                  x={width - padRight}
                  y={padTop + plotH - (referenceLine.value / chartMax) * plotH - 6}
                  textAnchor="end"
                  className="fill-sky-700 text-[10px] font-mono font-medium"
                >
                  {referenceLine.label}
                </text>
              </g>
            )}

            {/* Area & Line */}
            {areaPath && <path d={areaPath} fill="url(#airAwareAreaGrad)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#0F766E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* X-axis labels */}
            {coords.map((pt, i) => {
              if (i % xTickStep !== 0 && i !== coords.length - 1) return null;
              return (
                <text
                  key={pt.time}
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px] font-mono"
                >
                  {pt.label}
                </text>
              );
            })}

            {/* Active Hover Crosshair */}
            {activePoint && activePoint.value !== null && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={padTop + plotH}
                  stroke="#0F766E"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#0F766E"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Invisible interactive hit columns */}
            {coords.map((pt, i) => {
              const colW = plotW / Math.max(1, coords.length);
              return (
                <rect
                  key={pt.time}
                  x={pt.x - colW / 2}
                  y={padTop}
                  width={colW}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(i)}
                  onClick={() => setHoverIndex(i)}
                />
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
