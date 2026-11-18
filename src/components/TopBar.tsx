import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  LocateFixed,
  MapPin,
  Menu,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { searchCities } from '../services/api';
import { AirAlert, AqiStandard, CityLocation } from '../types/airQuality';
import { SidebarNavId } from './Sidebar';

interface TopBarProps {
  selectedLocation: CityLocation;
  lastUpdatedText: string | null;
  alerts: AirAlert[];
  aqiStandard: AqiStandard;
  isLocating: boolean;
  locationError: string | null;
  onOpenMobileSidebar: () => void;
  onSelectLocation: (loc: CityLocation) => void;
  onUseCurrentLocation: () => void;
  onNavigate: (nav: SidebarNavId) => void;
  onChangeStandard: (std: AqiStandard) => void;
}

export function TopBar({
  selectedLocation,
  lastUpdatedText,
  alerts,
  aqiStandard,
  isLocating,
  locationError,
  onOpenMobileSidebar,
  onSelectLocation,
  onUseCurrentLocation,
  onNavigate,
  onChangeStandard,
}: TopBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
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
        setSearchDropdownOpen(true);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'Unable to search cities.');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [query]);

  const handlePickCity = (city: CityLocation) => {
    onSelectLocation(city);
    setQuery('');
    setSuggestions([]);
    setSearchDropdownOpen(false);
    setSearchError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchError('Enter at least 2 characters.');
      setSearchDropdownOpen(true);
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
        setSearchError(`No cities matched "${trimmed}".`);
        setSearchDropdownOpen(true);
      } else {
        handlePickCity(results[0]);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'City search failed.');
      setSearchDropdownOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const activeAlertCount = alerts.filter((a) => a.severity !== 'info').length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Drawer Button + Current Location Selector */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50/70 border border-sky-100 min-w-0">
            <MapPin className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[140px] sm:max-w-[200px]">
              {selectedLocation.name}
              {selectedLocation.countryCode ? `, ${selectedLocation.countryCode}` : ''}
            </span>
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              title="Detect current GPS location"
              aria-label="Use current location"
              className="ml-1 p-1 text-teal-700 hover:text-teal-900 hover:bg-sky-100 rounded-md transition-colors disabled:opacity-50 shrink-0"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center: Search City Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSubmit} className="relative">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!searchDropdownOpen) setSearchDropdownOpen(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0 || searchError) setSearchDropdownOpen(true);
              }}
              placeholder="Search city or metro area..."
              aria-label="Search city"
              className="w-full h-10 pl-10 pr-9 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setSearchError(null);
                  setSearchDropdownOpen(false);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {searchDropdownOpen && (isSearching || suggestions.length > 0 || searchError) && (
            <div
              role="listbox"
              aria-label="City search results"
              className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-40"
            >
              {isSearching && suggestions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-500">Searching global cities...</div>
              ) : searchError ? (
                <div className="px-4 py-3 text-xs text-rose-700 bg-rose-50">{searchError}</div>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {suggestions.map((city) => (
                    <li key={city.id}>
                      <button
                        type="button"
                        onClick={() => handlePickCity(city)}
                        className="w-full px-4 py-2.5 text-left hover:bg-sky-50/70 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {city.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {[city.admin1, city.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right: Timestamp + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {lastUpdatedText && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Updated {lastUpdatedText}</span>
            </div>
          )}

          {/* Notification Bell Popover */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((p) => !p);
                setProfileOpen(false);
              }}
              aria-label="Air quality notifications"
              aria-expanded={notifOpen}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <Bell className="w-4.5 h-4.5" />
              {activeAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-40">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-900">
                    Air Quality Alerts · {selectedLocation.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {alerts.length} {alerts.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">
                      Load a city to inspect real-time threshold notifications.
                    </p>
                  ) : (
                    alerts.map((alert) => {
                      const isWarn = alert.severity === 'warning' || alert.severity === 'advisory';
                      return (
                        <div
                          key={alert.id}
                          className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-start gap-2.5"
                        >
                          {isWarn ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-900">{alert.title}</div>
                            <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Popover */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((p) => !p);
                setNotifOpen(false);
              }}
              aria-label="User profile and preferences"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">Resident</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {aqiStandard === 'european_aqi' ? 'EAQI Mode' : 'US EPA Mode'}
                </div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-40 space-y-3">
                <div className="pb-2.5 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">AirAware Preferences</div>
                  <div className="text-[11px] text-slate-500">
                    Active city: {selectedLocation.name}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-slate-500">Default AQI Standard</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onChangeStandard('us_aqi')}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        aqiStandard === 'us_aqi'
                          ? 'bg-sky-50 border-sky-300 text-teal-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      US EPA
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeStandard('european_aqi')}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        aqiStandard === 'european_aqi'
                          ? 'bg-sky-50 border-sky-300 text-teal-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      European
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open Settings &amp; Privacy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile City Search Strip + Geolocation Errors */}
      <div className="md:hidden px-4 pb-3 relative">
        <form onSubmit={handleSubmit} className="relative">
          <Search
            aria-hidden="true"
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!searchDropdownOpen) setSearchDropdownOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0 || searchError) setSearchDropdownOpen(true);
            }}
            placeholder="Search any city worldwide..."
            aria-label="Search city on mobile"
            className="w-full h-9 pl-9 pr-8 bg-[#F8FAFC] border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setSearchError(null);
                setSearchDropdownOpen(false);
              }}
              aria-label="Clear mobile search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
        {searchDropdownOpen && (suggestions.length > 0 || searchError) && (
          <div className="mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {searchError ? (
              <div className="px-3 py-2.5 text-xs text-rose-700 bg-rose-50">{searchError}</div>
            ) : (
              <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {suggestions.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onClick={() => handlePickCity(city)}
                      className="w-full px-3 py-2 text-left hover:bg-sky-50 text-xs flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-900">
                        {city.name}, {city.country}
                      </span>
                      <span className="font-mono text-slate-400">
                        {city.latitude.toFixed(1)}, {city.longitude.toFixed(1)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {locationError && (
        <div
          role="alert"
          className="px-4 sm:px-6 lg:px-8 py-2 bg-rose-50 border-t border-rose-200 text-xs text-rose-800"
        >
          {locationError}
        </div>
      )}
    </header>
  );
}
