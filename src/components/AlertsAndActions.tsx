import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Wind } from 'lucide-react';
import { AirQualityResponse, AqiStandard } from '../types/airQuality';
import { generateAlertsAndRecommendations } from '../utils/aqi';

interface AlertsAndActionsProps {
  data: AirQualityResponse;
  standard: AqiStandard;
}

export function AlertsAndActions({ data, standard }: AlertsAndActionsProps) {
  const { alerts, recommendations } = generateAlertsAndRecommendations(data, standard);

  return (
    <section
      aria-label="Pollution Alerts and Practical Recommendations"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Left: Pollution Alerts */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Pollution Alerts
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Active threshold checks against WHO 2021 and AQI advisories
        </p>

        <div className="mt-4 space-y-3">
          {alerts.map((alert) => {
            const isWarning = alert.severity === 'warning';
            const isAdvisory = alert.severity === 'advisory';
            const Icon = isWarning ? AlertTriangle : isAdvisory ? AlertCircle : CheckCircle2;
            const styleClass = isWarning
              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
              : isAdvisory
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-sky-50/60 border-sky-200 text-slate-800';
            const iconColor = isWarning
              ? 'text-rose-700'
              : isAdvisory
              ? 'text-amber-700'
              : 'text-teal-700';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${styleClass} flex items-start gap-3`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{alert.title}</h3>
                    {alert.metric && (
                      <span className="font-mono text-xs font-medium shrink-0">
                        {alert.metric}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Practical Clean-Air Recommendations */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Clean-Air Recommendations
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Practical daily steps derived from current levels and upcoming 24-hour forecasts
            </p>
          </div>
          <Wind className="w-5 h-5 text-teal-700 shrink-0 hidden sm:block" aria-hidden="true" />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="text-xs font-medium text-teal-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{rec.category}</span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-slate-900">
                  {rec.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {rec.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
