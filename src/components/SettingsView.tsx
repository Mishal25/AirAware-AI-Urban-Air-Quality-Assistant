import { Cpu, Database, Lock, ShieldAlert, Sliders } from 'lucide-react';
import { AqiStandard, CityLocation } from '../types/airQuality';
import { PRESET_CITIES } from '../utils/aqi';

interface SettingsViewProps {
  aqiStandard: AqiStandard;
  onChangeStandard: (std: AqiStandard) => void;
  selectedLocation: CityLocation;
  onSelectLocation: (loc: CityLocation) => void;
  autoRefreshAi: boolean;
  onToggleAutoRefreshAi: (val: boolean) => void;
}

export function SettingsView({
  aqiStandard,
  onChangeStandard,
  selectedLocation,
  onSelectLocation,
  autoRefreshAi,
  onToggleAutoRefreshAi,
}: SettingsViewProps) {
  return (
    <div className="space-y-6">
      {/* Preferences Panel */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
          <Sliders className="w-4 h-4" aria-hidden="true" />
          <span>Dashboard Preferences</span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
          Settings &amp; Platform Transparency
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Customize your air quality standard, default monitoring city, and review AirAware AI data sources and privacy practices.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-900 block">
              Preferred AQI Reporting Standard
            </label>
            <p className="text-xs text-slate-500">
              Determines primary gauge scaling, threshold categories, and daily forecast summaries.
            </p>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => onChangeStandard('us_aqi')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  aqiStandard === 'us_aqi'
                    ? 'bg-sky-50 border-sky-300 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                US EPA AQI (0–500)
              </button>
              <button
                type="button"
                onClick={() => onChangeStandard('european_aqi')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  aqiStandard === 'european_aqi'
                    ? 'bg-sky-50 border-sky-300 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                European EAQI (0–100+)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-900 block">
              AI Health Briefing Behavior
            </label>
            <p className="text-xs text-slate-500">
              Automatically request a fresh Gemini AI analysis whenever you switch cities.
            </p>
            <div className="pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={autoRefreshAi}
                onClick={() => onToggleAutoRefreshAi(!autoRefreshAi)}
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  autoRefreshAi
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{autoRefreshAi ? 'Auto-Analysis Enabled' : 'Manual Refresh Only'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-900 mb-2">
            Default Monitoring Station (Currently: {selectedLocation.name})
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_CITIES.map((city) => {
              const active = city.id === selectedLocation.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => onSelectLocation(city)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors ${
                    active
                      ? 'bg-teal-700 border-teal-700 text-white'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {city.name}, {city.countryCode}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* About, Attribution, Privacy & Disclaimer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section id="about-attribution" className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Database className="w-4 h-4 text-teal-700" />
            <h2>Data Source Attribution</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            All live pollutant concentrations (PM2.5, PM10, CO, NO2, SO2, O3, dust, and UV index) and 72-hour hourly projections come from the{' '}
            <strong className="font-medium text-slate-900">Open-Meteo Air Quality API</strong>, powered by the Copernicus Atmosphere Monitoring Service (CAMS). City search uses the Open-Meteo Geocoding API, and reverse geocoding resolves coordinates via BigDataCloud.
          </p>
        </section>

        <section className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Cpu className="w-4 h-4 text-sky-700" />
            <h2>About AirAware AI</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AirAware AI pairs real-time urban atmospheric telemetry with server-side Google Gemini AI reasoning so residents, families, athletes, and commuters can make informed daily decisions. API credentials remain strictly on the server and are never exposed to client browsers.
          </p>
        </section>

        <section id="privacy-policy" className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lock className="w-4 h-4 text-teal-700" />
            <h2>Privacy Policy</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Location access is strictly opt-in when you trigger current location detection. Coordinates are sent ephemerally to look up local air quality and city names—AirAware AI does not store personal location logs, user profiles, or tracking histories on backend servers.
          </p>
        </section>

        <section id="medical-disclaimer" className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <h2>Informational &amp; Medical Disclaimer</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AQI values, forecasts, and Gemini AI guidance are informational tools only and do not constitute medical diagnosis, clinical advice, or emergency directives. Seek guidance from a licensed healthcare professional for personal respiratory or cardiac conditions.
          </p>
        </section>
      </div>
    </div>
  );
}
