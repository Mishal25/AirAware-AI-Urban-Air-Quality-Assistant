import { Activity, Home, Leaf, Shield, Users } from 'lucide-react';
import { AirQualityResponse, AqiStandard } from '../types/airQuality';
import { generateFiveHealthCards, HealthGuidanceCard } from '../utils/aqi';

interface HealthRecommendationsProps {
  data: AirQualityResponse;
  standard: AqiStandard;
}

const CARD_ICONS: Record<HealthGuidanceCard['id'], React.ComponentType<{ className?: string }>> = {
  outdoor: Activity,
  mask: Shield,
  indoor: Home,
  sensitive: Users,
  reduction: Leaf,
};

export function HealthRecommendations({ data, standard }: HealthRecommendationsProps) {
  const cards = generateFiveHealthCards(data, standard);

  return (
    <section aria-label="Health Recommendations" className="space-y-4">
      <div>
        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
          Health &amp; Clean-Air Recommendations
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Tailored daily precautions derived from {data.location.name}&apos;s active measurements and 24-hour forecast
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = CARD_ICONS[card.id];
          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 text-teal-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-semibold text-teal-800 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                    {card.statusTag}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-500">{card.category}</div>
                  <h3 className="mt-0.5 font-display text-sm font-bold text-slate-900 leading-snug">
                    {card.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
