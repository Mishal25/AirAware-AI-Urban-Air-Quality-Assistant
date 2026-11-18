import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { AirQualityResponse, AqiStandard } from '../types/airQuality';
import {
  formatTimestamp,
  getAqiCategory,
  getAqiScale,
  getDominantPollutant,
} from '../utils/aqi';

interface AqiHeroCardProps {
  data: AirQualityResponse;
  standard: AqiStandard;
}

export function AqiHeroCard({ data, standard }: AqiHeroCardProps) {
  const [showScale, setShowScale] = useState(false);

  const aqiValue = data.current[standard];
  const category = getAqiCategory(aqiValue, standard);
  const scale = getAqiScale(standard);
  const dominant = getDominantPollutant(data.current);

  const maxScaleVal = standard === 'european_aqi' ? 120 : 300;
  const normalizedProgress =
    typeof aqiValue === 'number' ? Math.min(1, Math.max(0.03, aqiValue / maxScaleVal)) : 0;

  // SVG circular gauge geometry
  const size = 188;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.78; // 280deg open arc gauge
  const arcLength = circumference * arcFraction;
  const filledLength = arcLength * normalizedProgress;

  const StatusIcon =
    category.level <= 2 ? CheckCircle2 : category.level === 3 ? AlertTriangle : ShieldAlert;

  return (
    <section
      aria-label="Current Air Quality Centerpiece"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-14px_rgba(14,165,233,0.14)] p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
        {/* Left: Circular Color-Coded AQI Ring */}
        <div className="xl:col-span-4 flex flex-col items-center justify-center py-2">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform rotate-[130deg]"
              aria-hidden="true"
            >
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Active Color-Coded Arc */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={category.colorHex}
                strokeWidth={strokeWidth}
                strokeDasharray={`${filledLength} ${circumference}`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-1">
              <span className="text-[11px] font-medium text-slate-500">
                {standard === 'european_aqi' ? 'European EAQI' : 'US EPA AQI'}
              </span>
              <span className="font-mono text-5xl font-bold tracking-tight text-slate-900 tabular-nums mt-0.5">
                {aqiValue !== null ? Math.round(aqiValue) : '—'}
              </span>
              <span
                className="mt-1 text-xs font-semibold"
                style={{ color: category.colorHex }}
              >
                {category.shortLabel}
              </span>
            </div>
          </div>

          <div className="mt-1 text-xs font-mono text-slate-500">
            Band {category.rangeText} · {standard === 'european_aqi' ? '0–100+ Scale' : '0–500 Scale'}
          </div>
        </div>

        {/* Center: Location, Status Category & Explanation */}
        <div className="xl:col-span-5 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono">
                {data.latitude.toFixed(3)}°N, {data.longitude.toFixed(3)}°E
              </span>
              <span aria-hidden="true">·</span>
              <span>{data.timezoneAbbreviation}</span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {data.location.name}
              {data.location.admin1 ? `, ${data.location.admin1}` : ''}
            </h2>
            {data.location.country && (
              <p className="text-xs text-slate-500">{data.location.country}</p>
            )}
          </div>

          <div
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${category.bgClass} ${category.borderClass} ${category.textClass}`}
          >
            <StatusIcon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold leading-tight">{category.label}</div>
              <div className="text-xs opacity-85">Health Status Category</div>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {category.description} {category.sensitiveGroupNote}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Updated {formatTimestamp(data.current.time, data.timezone)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{data.isDemoData ? 'Demo Snapshot' : 'Open-Meteo (CAMS)'}</span>
            </span>
          </div>
        </div>

        {/* Right: Key Telemetry Summary & Scale Toggle */}
        <div className="xl:col-span-3 xl:border-l border-slate-200/80 xl:pl-6 pt-5 xl:pt-0 border-t xl:border-t-0 space-y-4">
          <div>
            <div className="text-xs text-slate-500">Primary Pollutant Driver</div>
            <div className="mt-0.5 font-display text-base font-bold text-slate-900">
              {dominant.symbol} · {dominant.name}
            </div>
            <div className="text-sm font-mono font-semibold text-teal-800">
              {dominant.value !== null ? `${dominant.value.toFixed(1)} µg/m³` : 'Unavailable'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500">Dust Aerosol</div>
              <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                {data.current.dust !== null ? `${data.current.dust.toFixed(1)} µg/m³` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">UV Index</div>
              <div className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                {data.current.uv_index !== null ? data.current.uv_index.toFixed(1) : '—'}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">Cross-Standard Index</div>
            <div className="mt-0.5 font-mono text-xs font-medium text-slate-800">
              {standard === 'us_aqi'
                ? `European EAQI: ${data.current.european_aqi ?? '—'}`
                : `US EPA AQI: ${data.current.us_aqi ?? '—'}`}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowScale((prev) => !prev)}
            aria-expanded={showScale}
            className="w-full inline-flex items-center justify-between px-3.5 py-2 text-xs font-medium text-teal-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>View AQI Scale</span>
            </span>
            {showScale ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable AQI Scale Table */}
      {showScale && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              {standard === 'european_aqi'
                ? 'European Air Quality Index (EAQI) Health Categories'
                : 'US EPA Air Quality Index (AQI) Health Categories'}
            </h3>
            <span className="text-xs text-slate-500">
              Data Source: {data.source}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Range</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Health Meaning</th>
                  <th className="py-2 font-medium">Precaution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scale.map((band) => {
                  const isCurrent = band.level === category.level;
                  return (
                    <tr key={band.level} className={isCurrent ? 'bg-sky-50/70' : ''}>
                      <td className="py-2.5 pr-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {band.rangeText}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                          <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-sm ${band.barClass}`} />
                          {band.label}
                          {isCurrent && <span className="text-[11px] font-mono text-teal-700">(Current)</span>}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700">{band.description}</td>
                      <td className="py-2.5 text-slate-600">{band.sensitiveGroupNote}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
