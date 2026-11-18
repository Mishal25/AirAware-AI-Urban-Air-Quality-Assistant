import { Cpu, Database, Lock, ShieldAlert } from 'lucide-react';

export function AboutView() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <p className="text-xs font-medium text-teal-700">About AirAware AI</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Breathe Smarter. Live Healthier.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
          AirAware AI is a full-stack environmental intelligence dashboard designed to make urban air pollution measurements immediately understandable and actionable. Rather than presenting raw atmospheric numbers without context, it combines live Copernicus/Open-Meteo telemetry with grounded plain-language guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Database className="w-4 h-4 text-teal-700" />
            <h2>Data Sources &amp; Attribution</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Live pollutant concentrations (PM2.5, PM10, O3, NO2, SO2, CO, dust aerosol, and UV index) and 72-hour hourly forecasts are retrieved via the{' '}
            <strong className="font-medium text-slate-900">Open-Meteo Air Quality API</strong>, powered by the European{' '}
            <strong className="font-medium text-slate-900">Copernicus Atmosphere Monitoring Service (CAMS)</strong>.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            City lookup uses the <strong className="font-medium text-slate-900">Open-Meteo Geocoding API</strong>, and optional browser geolocation coordinates are resolved to human-readable locality names using BigDataCloud reverse geocoding.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Cpu className="w-4 h-4 text-sky-700" />
            <h2>Server-Side Gemini AI Integration</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Health briefings and Q&amp;A responses are generated server-side through the Google Gemini API. Every prompt injects the exact retrieved measurements, timestamps, and active AQI standard so explanations remain grounded in real data.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            API keys remain strictly on the backend server and are never exposed in client-side bundles or browser network headers.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lock className="w-4 h-4 text-teal-700" />
            <h2>Privacy Notice</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Location access is strictly optional and only requested when you click <em>Use Current Location</em>. Coordinates are transmitted ephemerally to query local air quality and locality labels—AirAware AI does not store personal location histories, user accounts, or tracking profiles on any database.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <h2>Medical &amp; Informational Disclaimer</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            All AQI scores, pollutant readings, forecasts, and AI-generated precautions are provided strictly for general informational and educational purposes. AirAware AI does not provide medical diagnoses, clinical evaluations, or emergency instructions. Always consult a qualified healthcare professional regarding respiratory or cardiovascular health decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
