import { TrendingUp } from 'lucide-react';
import { AirQualityResponse, PollutantKey } from '../types/airQuality';
import { formatPollutantValue, formatTimestamp, POLLUTANT_DEFINITIONS } from '../utils/aqi';

interface PollutantGridProps {
  data: AirQualityResponse;
  onSelectPollutantForChart?: (key: PollutantKey) => void;
}

const ORDERED_POLLUTANTS: PollutantKey[] = [
  'pm2_5',
  'pm10',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
];

function MiniTrendSparkline({
  values,
  strokeColor,
}: {
  values: number[];
  strokeColor: string;
}) {
  if (values.length < 2) {
    return (
      <div className="h-9 flex items-center text-[11px] text-slate-400 font-mono">
        No trend series
      </div>
    );
  }

  const w = 136;
  const h = 36;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = pts.join(' ');
  const area = `${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible shrink-0"
      aria-hidden="true"
    >
      <polygon points={area} fill={strokeColor} fillOpacity="0.1" />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polyline}
      />
    </svg>
  );
}

export function PollutantGrid({ data, onSelectPollutantForChart }: PollutantGridProps) {
  const timestamp = formatTimestamp(data.current.time, data.timezone);
  const next24Hourly = data.hourly.slice(0, 24);

  return (
    <section aria-label="Individual Pollutant Cards">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Pollutant Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time concentrations, WHO 2021 guideline status, and 24-hour trajectory
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">Sampled {timestamp}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ORDERED_POLLUTANTS.map((key) => {
          const def = POLLUTANT_DEFINITIONS[key];
          const val = data.current[key];
          const unit = data.units[key] || def.unit;
          const ratio = typeof val === 'number' ? val / def.whoReference : 0;
          const percent = Math.min(100, Math.round(ratio * 50));
          const isElevated = typeof val === 'number' && val > def.whoReference;
          const isHigh = typeof val === 'number' && val > def.whoReference * 2;

          const statusLabel =
            val === null
              ? 'Unavailable'
              : isHigh
              ? 'High'
              : isElevated
              ? 'Elevated'
              : 'Normal';

          const statusStyles =
            val === null
              ? 'bg-slate-100 text-slate-600'
              : isHigh
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : isElevated
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-teal-50 text-teal-800 border border-teal-200';

          const strokeHex = isHigh ? '#DC2626' : isElevated ? '#D97706' : '#0D9488';
          const barClass = isHigh ? 'bg-rose-600' : isElevated ? 'bg-amber-500' : 'bg-teal-600';

          const series = next24Hourly
            .map((pt) => pt[key])
            .filter((v): v is number => typeof v === 'number');

          return (
            <div
              key={key}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_-12px_rgba(14,165,233,0.18)] hover:border-sky-300 transition-all duration-200 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-teal-700">{def.symbol}</div>
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    {def.name}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md ${statusStyles}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                      {formatPollutantValue(val, key)}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{unit}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    WHO limit: <span className="font-mono">{def.whoReference.toLocaleString()} {unit}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <MiniTrendSparkline values={series} strokeColor={strokeHex} />
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">24h trajectory</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barClass}`}
                    style={{ width: `${val === null ? 0 : Math.max(4, percent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate pr-2">{def.shortDesc}</span>
                  {onSelectPollutantForChart && (
                    <button
                      type="button"
                      onClick={() => onSelectPollutantForChart(key)}
                      className="inline-flex items-center gap-1 font-medium text-sky-700 hover:text-sky-900 shrink-0"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Chart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
