import { LocateFixed, RefreshCw, Search, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { searchCities } from '../services/api';
import { AqiStandard, CityLocation } from '../types/airQuality';
import { PRESET_CITIES } from '../utils/aqi';

interface SearchToolbarProps {
  selectedLocation: CityLocation;
  aqiStandard: AqiStandard;
  onSelectLocation: (loc: CityLocation) => void;
  onUseCurrentLocation: () => void;
  onChangeStandard: (std: AqiStandard) => void;
  onRefresh: () => void;
  isLoadingData: boolean;
  isLocating: boolean;
  locationError: string | null;
}

export function SearchToolbar({
  selectedLocation,
  aqiStandard,
  onSelectLocation,
  onUseCurrentLocation,
  onChangeStandard,
  onRefresh,
  isLoadingData,
  isLocating,
  locationError,
}: SearchToolbarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchCities(trimmed);
        setSuggestions(results);
        setDropdownOpen(true);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Unable to search cities.');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchError('Enter at least 2 characters to search for a city.');
      return;
    }
    if (suggestions.length > 0) {
      handlePickCity(suggestions[0]);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchCities(trimmed);
      if (results.length === 0) {
        setSearchError(`No cities matched "${trimmed}". Try another city name.`);
        setDropdownOpen(true);
      } else {
        handlePickCity(results[0]);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickCity = (city: CityLocation) => {
    onSelectLocation(city);
    setQuery('');
    setSuggestions([]);
    setDropdownOpen(false);
    setSearchError(null);
  };

  return (
    <section
      aria-label="City Search and Standard Controls"
      className="bg-gradient-to-b from-sky-50/90 to-[#F8FAFC] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-teal-700 tracking-wide">
              Urban Air Quality Assistant · Breathe Smarter. Live Healthier.
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Live atmospheric telemetry &amp; clean-air guidance
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="AQI Standard Selector"
              className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-lg"
            >
              <button
                type="button"
                onClick={() => onChangeStandard('us_aqi')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  aqiStandard === 'us_aqi'
                    ? 'bg-sky-50 text-teal-800 border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                US EPA AQI
              </button>
              <button
                type="button"
                onClick={() => onChangeStandard('european_aqi')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  aqiStandard === 'european_aqi'
                    ? 'bg-sky-50 text-teal-800 border border-sky-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                European EAQI
              </button>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoadingData}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-teal-600' : ''}`} />
              <span>{isLoadingData ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div ref={containerRef} className="relative lg:col-span-7">
            <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!dropdownOpen) setDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setDropdownOpen(true);
                  }}
                  placeholder={`Search any city worldwide (currently ${selectedLocation.name})...`}
                  aria-label="Search city by name"
                  className="w-full h-11 pl-10 pr-9 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSuggestions([]);
                      setSearchError(null);
                      setDropdownOpen(false);
                    }}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {dropdownOpen && (suggestions.length > 0 || searchError) && (
              <div
                role="listbox"
                aria-label="City search suggestions"
                className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
              >
                {searchError ? (
                  <div className="px-4 py-3 text-sm text-rose-700 bg-rose-50">{searchError}</div>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {suggestions.map((city) => (
                      <li key={city.id}>
                        <button
                          type="button"
                          onClick={() => handlePickCity(city)}
                          className="w-full px-4 py-2.5 text-left hover:bg-sky-50 transition-colors flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-sm font-medium text-slate-900">{city.name}</span>
                            <span className="text-xs text-slate-500 ml-2">
                              {[city.admin1, city.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-slate-400 shrink-0">
                            {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!dropdownOpen && searchError && (
              <p className="mt-1.5 text-xs text-rose-700" role="alert">
                {searchError}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              className="w-full sm:w-auto h-11 px-4 inline-flex items-center justify-center gap-2 bg-white border border-sky-200 text-teal-800 hover:bg-sky-50 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting location...' : 'Use Current Location'}</span>
            </button>
            {locationError && (
              <p className="text-xs text-rose-700" role="alert">
                {locationError}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">Quick cities:</span>
          {PRESET_CITIES.map((city) => {
            const active =
              Math.abs(city.latitude - selectedLocation.latitude) < 0.05 &&
              Math.abs(city.longitude - selectedLocation.longitude) < 0.05;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => handlePickCity(city)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:text-teal-800'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
