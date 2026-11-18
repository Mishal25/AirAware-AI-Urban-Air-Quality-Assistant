import { Calendar, BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AirQualityResponse, AqiStandard, ForecastMetricKey, PollutantKey } from '../types/airQuality';
import {
  computeDailyForecastSummaries,
  formatPollutantValue,
  getAqiCategory,
  POLLUTANT_DEFINITIONS,
} from '../utils/aqi';
import { ForecastChart } from './ForecastChart';

interface AnalyticsSectionProps {
  data: AirQualityResponse;
  standard: AqiStandard;
  selectedMetric: ForecastMetricKey;
  onSelectMetric: (metric: ForecastMetricKey) => void;
}

const COMPARE_POLLUTANTS: PollutantKey[] = [
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
];

export function AnalyticsSection({
  data,
  standard,
  selectedMetric,
  onSelectMetric,
}: AnalyticsSectionProps) {
  const [hoveredPollutant, setHoveredPollutant] = useState<PollutantKey | null>(null);

  const dailySummaries = useMemo(
    () => computeDailyForecastSummaries(data.hourly, standard),
    [data.hourly, standard]
  );

  const pollutantBars = useMemo(() => {
    return COMPARE_POLLUTANTS.map((key) => {
      const def = POLLUTANT_DEFINITIONS[key];
      const value = data.current[key];
      const pctOfWho =
        typeof value === 'number' ? Math.round((value / def.whoReference) * 100) : 0;
      return {
        key,
        symbol: def.symbol,
        name: def.name,
        value,
        unit: def.unit,
        whoReference: def.whoReference,
        pctOfWho,
      };
    });
  }, [data.current]);

  const maxPct = Math.max(100, ...pollutantBars.map((b) => b.pctOfWho));

  return (
    <section aria-label="Analytics and Forecast Suite" className="space-y-6">
      {/* Main Air Quality Trend Line Chart */}
      <ForecastChart
        data={data}
        standard={standard}
        selectedMetric={selectedMetric}
        onSelectMetric={onSelectMetric}
      />

      {/* Second Row: Pollutant Comparison Chart + 3-Day Daily Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pollutant Comparison Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                <span>Normalized Threshold Comparison</span>
              </div>
              <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                Pollutant Load vs. WHO Guideline (100% Baseline)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
                Within WHO
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                Above WHO
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3.5 relative">
            {pollutantBars.map((bar) => {
              const widthPct =
                bar.value !== null ? Math.min(100, Math.max(3, (bar.pctOfWho / maxPct) * 100)) : 0;
              const isAbove = bar.pctOfWho > 100;
              const isHigh = bar.pctOfWho > 200;
              const colorClass = isHigh
                ? 'bg-rose-600'
                : isAbove
                ? 'bg-amber-500'
                : 'bg-teal-600';
              const isHovered = hoveredPollutant === bar.key;

              return (
                <div
                  key={bar.key}
                  onMouseEnter={() => setHoveredPollutant(bar.key)}
                  onMouseLeave={() => setHoveredPollutant(null)}
                  onClick={() => onSelectMetric(bar.key)}
                  className={`p-2 -mx-2 rounded-xl transition-colors cursor-pointer ${
                    isHovered ? 'bg-sky-50/70' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 w-12">{bar.symbol}</span>
                      <span className="text-slate-600 hidden sm:inline">{bar.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      <span className="text-slate-900 font-semibold">
                        {formatPollutantValue(bar.value, bar.key)} {bar.unit}
                      </span>
                      <span
                        className={`text-[11px] font-semibold w-14 text-right ${
                          isHigh ? 'text-rose-700' : isAbove ? 'text-amber-800' : 'text-teal-700'
                        }`}
                      >
                        {bar.value !== null ? `${bar.pctOfWho}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                      style={{ width: `${widthPct}%` }}
                    />
                    {/* 100% WHO baseline tick */}
                    <div
                      title="100% WHO Reference Threshold"
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80"
                      style={{ left: `${Math.min(99, (100 / maxPct) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Click any pollutant row to inspect its 24h–72h hourly forecast curve above. Vertical tick marks 100% of WHO 2021 guideline.
          </p>
        </div>

        {/* Right: Daily Outlook Cards (Today, Tomorrow, Day 3) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Multi-Day Outlook</span>
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
              3-Day Daily Forecast Summary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated directly from Open-Meteo 72-hour hourly model data
            </p>

            <div className="mt-5 space-y-3">
              {dailySummaries.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Daily forecast aggregation unavailable.
                </div>
              ) : (
                dailySummaries.map((day) => {
                  const cat = getAqiCategory(day.avgAqi, standard);
                  return (
                    <div
                      key={day.dateKey}
                      className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{day.dayLabel}</div>
                        <div className="text-[11px] font-mono text-slate-500">{day.dateKey}</div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`w-2 h-2 rounded-sm ${cat.barClass}`} />
                          <span className="text-xs font-semibold text-slate-800">
                            {cat.shortLabel}
                          </span>
                          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                            {day.avgAqi ?? '—'}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11px] font-mono text-slate-500">
                          Min {day.minAqi ?? '—'} · Max {day.maxAqi ?? '—'} · PM2.5 ~
                          {day.avgPm25 !== null ? `${day.avgPm25} µg/m³` : '—'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Index standard displayed:{' '}
            <strong className="font-semibold text-slate-700">
              {standard === 'european_aqi' ? 'European EAQI' : 'US EPA AQI'}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
