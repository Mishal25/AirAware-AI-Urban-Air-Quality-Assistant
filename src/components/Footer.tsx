import { SidebarNavId } from './Sidebar';

interface FooterProps {
  onNavigate: (nav: SidebarNavId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-12 bg-white border-t border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs text-slate-500">
        <div className="space-y-1.5 max-w-2xl">
          <div className="font-display text-sm font-bold text-slate-900">
            AirAware AI — Urban Air Quality Assistant · Breathe Smarter. Live Healthier.
          </div>
          <p className="leading-relaxed">
            Data Source Attribution: Live pollutant telemetry &amp; 72h forecasts via Open-Meteo Air Quality API (Copernicus CAMS). Health summaries powered by Google Gemini on secure server-side endpoints.
          </p>
          <p className="text-[11px] text-slate-400">
            Disclaimer: Environmental information and AI guidance are for informational purposes only and are not a substitute for professional medical advice or diagnosis.
          </p>
        </div>

        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-5 text-slate-600 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="hover:text-teal-800 transition-colors"
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('insights')}
            className="hover:text-teal-800 transition-colors"
          >
            Pollution Insights
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="hover:text-teal-800 transition-colors"
          >
            About AirAware AI
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="hover:text-teal-800 transition-colors"
          >
            Privacy Policy
          </button>
        </nav>
      </div>
    </footer>
  );
}
