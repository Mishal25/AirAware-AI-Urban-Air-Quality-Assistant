import { LocateFixed, RefreshCw } from 'lucide-react';
import { AqiStandard, CityLocation } from '../types/airQuality';
import { PRESET_CITIES } from '../utils/aqi';

interface DashboardHeroProps {
  selectedLocation: CityLocation;
  aqiStandard: AqiStandard;
  isLoadingData: boolean;
  isLocating: boolean;
  onSelectLocation: (loc: CityLocation) => void;
  onUseCurrentLocation: () => void;
  onChangeStandard: (std: AqiStandard) => void;
  onRefresh: () => void;
}

export function DashboardHero({
  selectedLocation,
  aqiStandard,
  isLoadingData,
  isLocating,
  onSelectLocation,
  onUseCurrentLocation,
  onChangeStandard,
  onRefresh,
}: DashboardHeroProps) {
  return (
    <section aria-label="Dashboard Welcome" className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700">
            AirAware AI · Breathe Smarter. Live Healthier.
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Understand Your Air. Protect Your Health.
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            Get intelligent insights into the air you breathe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="AQI Standard Selector"
            className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl"
          >
            <button
              type="button"
              onClick={() => onChangeStandard('us_aqi')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
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
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
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
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-teal-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoadingData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-teal-700' : ''}`} />
            <span>{isLoadingData ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Quick Global Cities Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">Quick stations:</span>
        {PRESET_CITIES.map((city) => {
          const active =
            Math.abs(city.latitude - selectedLocation.latitude) < 0.05 &&
            Math.abs(city.longitude - selectedLocation.longitude) < 0.05;
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelectLocation(city)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/60'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
