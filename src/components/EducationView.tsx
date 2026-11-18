import { BookOpen, Factory, HeartPulse, Wind } from 'lucide-react';
import { useState } from 'react';
import { PollutantKey } from '../types/airQuality';
import {
  EUROPEAN_AQI_SCALE,
  POLLUTANT_DEFINITIONS,
  US_EPA_SCALE,
} from '../utils/aqi';

const KEYS: PollutantKey[] = [
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'carbon_monoxide',
];

export function EducationView() {
  const [selectedKey, setSelectedKey] = useState<PollutantKey>('pm2_5');
  const activeDef = POLLUTANT_DEFINITIONS[selectedKey];

  return (
    <div className="space-y-7">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
          <BookOpen className="w-4 h-4" />
          <span>Environmental Health Literacy</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Understanding Urban Air Pollution &amp; AQI Standards
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Air quality indices translate complex atmospheric concentrations of fine particulates and reactive gases into actionable health categories. Select any pollutant below to inspect its sources, health pathways, and World Health Organization (WHO) 2021 reference guidelines.
        </p>

        {/* Interactive Pollutant Selector */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
          {KEYS.map((key) => {
            const def = POLLUTANT_DEFINITIONS[key];
            const isSelected = key === selectedKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-teal-700 text-white'
                    : 'bg-[#F8FAFC] border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-teal-900'
                }`}
              >
                <span className="font-mono font-semibold mr-1.5">{def.symbol}</span>
                <span>{def.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Pollutant Detail */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="font-mono text-sm font-bold text-teal-700">{activeDef.symbol}</div>
            <h2 className="font-display text-2xl font-bold text-slate-900">{activeDef.name}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{activeDef.shortDesc}</p>
            <div className="p-4 rounded-lg bg-sky-50/70 border border-sky-100">
              <div className="text-xs text-slate-500">WHO 2021 Reference Guideline</div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                {activeDef.whoReference.toLocaleString()} {activeDef.unit}
              </div>
              <div className="text-xs text-slate-600">{activeDef.whoPeriod}</div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <Factory className="w-4 h-4 text-teal-700" />
                <span>Primary Urban Sources</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {activeDef.primarySources.map((src) => (
                  <li key={src} className="flex items-start gap-2">
                    <span className="text-teal-700 font-mono text-xs mt-1">·</span>
                    <span>{src}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <HeartPulse className="w-4 h-4 text-sky-700" />
                <span>Respiratory &amp; Systemic Impact</span>
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                {activeDef.healthImpact}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Standards Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-1">
            <Wind className="w-4 h-4" />
            <span>North American &amp; Global Standard</span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            US EPA Air Quality Index (0 – 500)
          </h2>
          <p className="mt-1 text-xs text-slate-600 mb-4">
            Calculated from the highest sub-index among PM2.5, PM10, O3, NO2, SO2, and CO. Values above 100 indicate increasing risk for sensitive groups and the general public.
          </p>
          <div className="divide-y divide-slate-100">
            {US_EPA_SCALE.map((band) => (
              <div key={band.level} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-3 h-3 rounded-sm shrink-0 ${band.barClass}`} />
                  <span className="font-semibold text-slate-900">{band.label}</span>
                </div>
                <span className="font-mono font-medium text-slate-600 shrink-0">{band.rangeText}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 text-xs font-medium text-sky-700 mb-1">
            <Wind className="w-4 h-4" />
            <span>European Environment Agency Standard</span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            European Air Quality Index (0 – 100+)
          </h2>
          <p className="mt-1 text-xs text-slate-600 mb-4">
            Reflects hourly concentrations of five key pollutants (PM2.5, PM10, O3, NO2, SO2) using stricter European thresholds where lower values represent cleaner air.
          </p>
          <div className="divide-y divide-slate-100">
            {EUROPEAN_AQI_SCALE.map((band) => (
              <div key={band.level} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-3 h-3 rounded-sm shrink-0 ${band.barClass}`} />
                  <span className="font-semibold text-slate-900">{band.label}</span>
                </div>
                <span className="font-mono font-medium text-slate-600 shrink-0">{band.rangeText}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
