import { AlertCircle, Bot, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { fetchAirQuality, fetchGeminiCityComparison, searchCities } from '../services/api';
import { AirQualityResponse, AqiStandard, CityLocation } from '../types/airQuality';
import {
  formatPollutantValue,
  getAqiCategory,
  getDominantPollutant,
  PRESET_CITIES,
} from '../utils/aqi';

interface CompareCitiesViewProps {
  primaryData: AirQualityResponse | null;
  standard: AqiStandard;
}

export function CompareCitiesView({ primaryData, standard }: CompareCitiesViewProps) {
  const [citiesData, setCitiesData] = useState<AirQualityResponse[]>([]);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [aiComparison, setAiComparison] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (citiesData.length > 0) return;

    const initialTargets: CityLocation[] = [];
    if (primaryData && !primaryData.isDemoData) {
      setCitiesData([primaryData]);
    } else if (primaryData) {
      initialTargets.push(primaryData.location);
    }

    for (const preset of PRESET_CITIES) {
      if (initialTargets.length + (primaryData && !primaryData.isDemoData ? 1 : 0) >= 3) break;
      const alreadyIncluded =
        primaryData &&
        Math.abs(preset.latitude - primaryData.latitude) < 0.05 &&
        Math.abs(preset.longitude - primaryData.longitude) < 0.05;
      if (!alreadyIncluded) {
        initialTargets.push(preset);
      }
    }

    initialTargets.forEach((loc) => {
      void addCity(loc);
    });
  }, []);

  const addCity = async (loc: CityLocation) => {
    if (citiesData.some((c) => c.location.id === loc.id)) return;
    if (citiesData.length >= 4) {
      setError('You can compare up to 4 cities simultaneously. Remove one to add another.');
      return;
    }

    setError(null);
    setLoadingIds((prev) => ({ ...prev, [loc.id]: true }));
    try {
      const data = await fetchAirQuality(loc);
      setCitiesData((prev) => {
        if (prev.some((c) => c.location.id === loc.id) || prev.length >= 4) return prev;
        return [...prev, data];
      });
      setAiComparison(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load data for ${loc.name}.`);
    } finally {
      setLoadingIds((prev) => {
        const next = { ...prev };
        delete next[loc.id];
        return next;
      });
    }
  };

  const removeCity = (id: string) => {
    setCitiesData((prev) => prev.filter((c) => c.location.id !== id));
    setAiComparison(null);
    setError(null);
  };

  const handleRefreshAll = async () => {
    if (citiesData.length === 0) return;
    setError(null);
    const currentLocs = citiesData.map((c) => c.location);
    const loadingMap: Record<string, boolean> = {};
    currentLocs.forEach((l) => {
      loadingMap[l.id] = true;
    });
    setLoadingIds(loadingMap);

    try {
      const updated = await Promise.all(currentLocs.map((loc) => fetchAirQuality(loc)));
      setCitiesData(updated);
      setAiComparison(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh city comparison data.');
    } finally {
      setLoadingIds({});
    }
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setError('Enter at least 2 characters to search for a city.');
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const results = await searchCities(trimmed);
      setSearchResults(results);
      if (results.length === 0) {
        setError(`No cities matched "${trimmed}".`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'City search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAiCompare = async () => {
    if (citiesData.length < 2) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const summary = await fetchGeminiCityComparison(citiesData, standard);
      setAiComparison(summary);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to generate Gemini comparison.');
    } finally {
      setAiLoading(false);
    }
  };

  const maxAqi = Math.max(
    100,
    ...citiesData.map((c) => c.current[standard] ?? 0)
  );
  const isAnyLoading = Object.keys(loadingIds).length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Multi-City Air Quality Comparison
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Compare live pollutant concentrations and {standard === 'european_aqi' ? 'European EAQI' : 'US EPA AQI'} across up to 4 cities worldwide.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleRefreshAll()}
              disabled={isAnyLoading || citiesData.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnyLoading ? 'animate-spin' : ''}`} />
              <span>Refresh All</span>
            </button>
            <button
              type="button"
              onClick={() => void handleAiCompare()}
              disabled={aiLoading || citiesData.length < 2}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg disabled:opacity-50"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Comparing...' : 'Compare with Gemini AI'}</span>
            </button>
          </div>
        </div>

        {/* Add City Form */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city to add to comparison (max 4)..."
              aria-label="Search city to add to comparison"
              className="w-full h-10 pl-10 pr-3 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || citiesData.length >= 4}
            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Find City'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-3 p-3 bg-sky-50/70 border border-sky-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">Select a city to add:</span>
              <button
                type="button"
                onClick={() => setSearchResults([])}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Dismiss
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchResults.slice(0, 6).map((city) => {
                const exists = citiesData.some((c) => c.location.id === city.id);
                return (
                  <button
                    key={city.id}
                    type="button"
                    disabled={exists || citiesData.length >= 4}
                    onClick={() => {
                      void addCity(city);
                      setSearchResults([]);
                      setQuery('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md hover:border-teal-500 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 text-teal-700" />
                    <span>
                      {city.name}, {city.country}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick add presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Quick add:</span>
          {PRESET_CITIES.map((preset) => {
            const exists = citiesData.some((c) => c.location.id === preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                disabled={exists || citiesData.length >= 4}
                onClick={() => void addCity(preset)}
                className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-sky-50 disabled:opacity-40"
              >
                + {preset.name}
              </button>
            );
          })}
        </div>

        {error && (
          <div role="alert" className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Gemini AI Comparison Box */}
      {(aiComparison || aiError) && (
        <div className="bg-white border border-sky-200 rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 mb-2">
            <Bot className="w-4 h-4" />
            <span>Gemini AI Comparative Analysis</span>
          </div>
          {aiError ? (
            <p className="text-sm text-rose-700">{aiError}</p>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiComparison}</p>
          )}
        </div>
      )}

      {/* Visual Horizontal Comparison Chart */}
      {citiesData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
            Index Comparison ({standard === 'european_aqi' ? 'European EAQI' : 'US EPA AQI'})
          </h2>
          <div className="space-y-4">
            {citiesData.map((city) => {
              const val = city.current[standard];
              const cat = getAqiCategory(val, standard);
              const pct = typeof val === 'number' ? Math.min(100, Math.max(4, (val / maxAqi) * 100)) : 0;

              return (
                <div key={city.location.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{city.location.name}</span>
                      <span className="text-xs text-slate-500">{city.location.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${cat.textClass}`}>{cat.label}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {val !== null ? Math.round(val) : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${cat.barClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-xs text-slate-600">
                <th className="py-3 px-4 font-semibold">City</th>
                <th className="py-3 px-4 font-semibold text-right">
                  {standard === 'european_aqi' ? 'EAQI' : 'US AQI'}
                </th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Primary Driver</th>
                <th className="py-3 px-4 font-semibold text-right">PM2.5</th>
                <th className="py-3 px-4 font-semibold text-right">PM10</th>
                <th className="py-3 px-4 font-semibold text-right">O3</th>
                <th className="py-3 px-4 font-semibold text-right">NO2</th>
                <th className="py-3 px-4 font-semibold text-right">SO2</th>
                <th className="py-3 px-4 font-semibold text-right">CO</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {citiesData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-sm text-slate-500">
                    {isAnyLoading
                      ? 'Loading live city telemetry...'
                      : 'No cities selected yet. Search or click a quick-add city above to compare.'}
                  </td>
                </tr>
              ) : (
                citiesData.map((city) => {
                  const val = city.current[standard];
                  const cat = getAqiCategory(val, standard);
                  const dom = getDominantPollutant(city.current);
                  return (
                    <tr key={city.location.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{city.location.name}</div>
                        <div className="text-xs text-slate-500">{city.location.country}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {val !== null ? Math.round(val) : '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800">
                          <span className={`w-2 h-2 rounded-sm ${cat.barClass}`} aria-hidden="true" />
                          {cat.shortLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-teal-800">{dom.symbol}</td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatPollutantValue(city.current.pm2_5, 'pm2_5')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatPollutantValue(city.current.pm10, 'pm10')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatPollutantValue(city.current.ozone, 'ozone')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatPollutantValue(city.current.nitrogen_dioxide, 'nitrogen_dioxide')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatPollutantValue(city.current.sulphur_dioxide, 'sulphur_dioxide')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatPollutantValue(city.current.carbon_monoxide, 'carbon_monoxide')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeCity(city.location.id)}
                          aria-label={`Remove ${city.location.name} from comparison`}
                          className="p-1.5 text-slate-400 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-slate-200 text-xs text-slate-500">
          All pollutant concentrations are displayed in µg/m³ · Live telemetry sourced from Open-Meteo Air Quality API.
        </div>
      </div>
    </div>
  );
}
