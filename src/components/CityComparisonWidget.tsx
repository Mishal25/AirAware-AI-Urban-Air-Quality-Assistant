import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchAirQuality } from '../services/api';
import { AirQualityResponse, AqiStandard } from '../types/airQuality';
import { formatPollutantValue, getAqiCategory, PRESET_CITIES } from '../utils/aqi';

interface CityComparisonWidgetProps {
  primaryData: AirQualityResponse;
  standard: AqiStandard;
  onOpenFullComparison: () => void;
}

export function CityComparisonWidget({
  primaryData,
  standard,
  onOpenFullComparison,
}: CityComparisonWidgetProps) {
  const [peerCities, setPeerCities] = useState<AirQualityResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const peers = PRESET_CITIES.filter(
      (c) =>
        Math.abs(c.latitude - primaryData.latitude) > 0.1 ||
        Math.abs(c.longitude - primaryData.longitude) > 0.1
    ).slice(0, 3);

    setLoading(true);
    Promise.all(peers.map((loc) => fetchAirQuality(loc).catch(() => null)))
      .then((results) => {
        if (!cancelled) {
          setPeerCities(results.filter((r): r is AirQualityResponse => r !== null));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [primaryData.location.id]);

  const rows = [primaryData, ...peerCities];

  return (
    <section
      aria-label="City Air Quality Snapshot Comparison"
      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Global City Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Live {standard === 'european_aqi' ? 'European EAQI' : 'US EPA AQI'} benchmark alongside reference urban centers
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFullComparison}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <span>Compare Any Cities</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rows.map((city, idx) => {
          const val = city.current[standard];
          const cat = getAqiCategory(val, standard);
          const isPrimary = idx === 0;

          return (
            <div
              key={city.location.id}
              className={`p-4 rounded-xl border transition-colors ${
                isPrimary
                  ? 'bg-sky-50/50 border-sky-200'
                  : 'bg-[#F8FAFC] border-slate-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {city.location.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {city.location.country}
                  </div>
                </div>
                {isPrimary && (
                  <span className="text-[10px] font-semibold text-teal-800 bg-white border border-sky-200 px-2 py-0.5 rounded-md shrink-0">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  {val !== null ? Math.round(val) : '—'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className={`w-2 h-2 rounded-sm ${cat.barClass}`} aria-hidden="true" />
                  {cat.shortLabel}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>PM2.5: {formatPollutantValue(city.current.pm2_5, 'pm2_5')} µg/m³</span>
                <span>O3: {formatPollutantValue(city.current.ozone, 'ozone')}</span>
              </div>
            </div>
          );
        })}

        {loading && peerCities.length === 0 &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse h-32"
            />
          ))}
      </div>
    </section>
  );
}
