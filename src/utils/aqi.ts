import {
  AirAlert,
  AirQualityResponse,
  AqiCategoryInfo,
  AqiStandard,
  CityLocation,
  CleanAirRecommendation,
  CurrentPollutants,
  HourlyForecastPoint,
  PollutantKey,
} from '../types/airQuality';

export const PRESET_CITIES: CityLocation[] = [
  {
    id: 'sf-us',
    name: 'San Francisco',
    admin1: 'California',
    country: 'United States',
    countryCode: 'US',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'london-uk',
    name: 'London',
    admin1: 'England',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: 'Europe/London',
  },
  {
    id: 'tokyo-jp',
    name: 'Tokyo',
    admin1: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
  {
    id: 'delhi-in',
    name: 'New Delhi',
    admin1: 'Delhi',
    country: 'India',
    countryCode: 'IN',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'sp-br',
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  {
    id: 'nairobi-ke',
    name: 'Nairobi',
    admin1: 'Nairobi County',
    country: 'Kenya',
    countryCode: 'KE',
    latitude: -1.2921,
    longitude: 36.8219,
    timezone: 'Africa/Nairobi',
  },
];

export interface PollutantDefinition {
  key: PollutantKey;
  symbol: string;
  name: string;
  unit: string;
  whoReference: number;
  whoPeriod: string;
  shortDesc: string;
  primarySources: string[];
  healthImpact: string;
}

export const POLLUTANT_DEFINITIONS: Record<PollutantKey, PollutantDefinition> = {
  pm2_5: {
    key: 'pm2_5',
    symbol: 'PM2.5',
    name: 'Fine Particulate Matter',
    unit: 'µg/m³',
    whoReference: 15,
    whoPeriod: '24-hour WHO guideline (15 µg/m³)',
    shortDesc: 'Microscopic inhalable particles ≤ 2.5 micrometers in diameter.',
    primarySources: ['Vehicle exhaust', 'Wildfire smoke', 'Industrial combustion', 'Residential wood burning'],
    healthImpact: 'Penetrates deep into alveoli and enters the bloodstream, aggravating asthma and cardiovascular stress.',
  },
  pm10: {
    key: 'pm10',
    symbol: 'PM10',
    name: 'Coarse Particulate Matter',
    unit: 'µg/m³',
    whoReference: 45,
    whoPeriod: '24-hour WHO guideline (45 µg/m³)',
    shortDesc: 'Inhalable dust, pollen, and aerosol particles ≤ 10 micrometers.',
    primarySources: ['Road dust', 'Construction sites', 'Windblown soil', 'Pollen & sea salt'],
    healthImpact: 'Irritates eyes, nose, and upper airways; triggers coughing and airway inflammation.',
  },
  ozone: {
    key: 'ozone',
    symbol: 'O3',
    name: 'Ground-Level Ozone',
    unit: 'µg/m³',
    whoReference: 100,
    whoPeriod: '8-hour WHO guideline (100 µg/m³)',
    shortDesc: 'Reactive photochemical gas formed when sunlight reacts with emissions.',
    primarySources: ['Sunlight + vehicle NOx', 'Industrial solvents', 'Fuel vapors on warm afternoons'],
    healthImpact: 'Reduces lung function, inflames airway linings, and increases sensitivity to allergens during exercise.',
  },
  nitrogen_dioxide: {
    key: 'nitrogen_dioxide',
    symbol: 'NO2',
    name: 'Nitrogen Dioxide',
    unit: 'µg/m³',
    whoReference: 25,
    whoPeriod: '24-hour WHO guideline (25 µg/m³)',
    shortDesc: 'Reddish-brown traffic and combustion gas prominent near busy roadways.',
    primarySources: ['Diesel & petrol engines', 'Power plants', 'Gas stoves & urban heating'],
    healthImpact: 'Heightens bronchial reactivity, lowers resistance to respiratory infections, and worsens asthma.',
  },
  sulphur_dioxide: {
    key: 'sulphur_dioxide',
    symbol: 'SO2',
    name: 'Sulphur Dioxide',
    unit: 'µg/m³',
    whoReference: 40,
    whoPeriod: '24-hour WHO guideline (40 µg/m³)',
    shortDesc: 'Sharp-smelling gas released by burning sulfur-containing fossil fuels.',
    primarySources: ['Coal power stations', 'Heavy shipping fuel', 'Metal smelting & refineries'],
    healthImpact: 'Rapidly constricts airways in people with asthma even after brief outdoor exposure.',
  },
  carbon_monoxide: {
    key: 'carbon_monoxide',
    symbol: 'CO',
    name: 'Carbon Monoxide',
    unit: 'µg/m³',
    whoReference: 4000,
    whoPeriod: '24-hour WHO guideline (4,000 µg/m³)',
    shortDesc: 'Colorless, odorless gas produced by incomplete fuel combustion.',
    primarySources: ['Idling traffic', 'Congested tunnels', 'Biomass & poorly vented heaters'],
    healthImpact: 'Reduces oxygen delivery to organs and heart muscle when concentrations rise in enclosed corridors.',
  },
};

export const US_EPA_SCALE: AqiCategoryInfo[] = [
  {
    standard: 'us_aqi',
    level: 1,
    label: 'Good',
    shortLabel: 'Good',
    rangeText: '0 – 50',
    description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    sensitiveGroupNote: 'Ideal conditions for all outdoor activities and natural home ventilation.',
    colorHex: '#0D9488',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
    barClass: 'bg-teal-600',
  },
  {
    standard: 'us_aqi',
    level: 2,
    label: 'Moderate',
    shortLabel: 'Moderate',
    rangeText: '51 – 100',
    description: 'Air quality is acceptable; however, some pollutants may be a moderate concern for unusually sensitive people.',
    sensitiveGroupNote: 'People unusually sensitive to ozone or particulates should consider moderating prolonged heavy exertion.',
    colorHex: '#CA8A04',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-200',
    barClass: 'bg-amber-500',
  },
  {
    standard: 'us_aqi',
    level: 3,
    label: 'Unhealthy for Sensitive Groups',
    shortLabel: 'Sensitive Groups',
    rangeText: '101 – 150',
    description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    sensitiveGroupNote: 'Children, older adults, and individuals with asthma or heart/lung disease should limit prolonged outdoor exertion.',
    colorHex: '#EA580C',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-900',
    borderClass: 'border-orange-200',
    barClass: 'bg-orange-500',
  },
  {
    standard: 'us_aqi',
    level: 4,
    label: 'Unhealthy',
    shortLabel: 'Unhealthy',
    rangeText: '151 – 200',
    description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.',
    sensitiveGroupNote: 'Move intense workouts indoors, close street-facing windows, and use HEPA air filtration if available.',
    colorHex: '#DC2626',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-900',
    borderClass: 'border-rose-200',
    barClass: 'bg-rose-600',
  },
  {
    standard: 'us_aqi',
    level: 5,
    label: 'Very Unhealthy',
    shortLabel: 'Very Unhealthy',
    rangeText: '201 – 300',
    description: 'Health alert: the risk of health effects is increased for everyone.',
    sensitiveGroupNote: 'Avoid all strenuous outdoor activity; wear a well-fitted N95/FFP2 respirator if outdoor travel is essential.',
    colorHex: '#9333EA',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-900',
    borderClass: 'border-purple-200',
    barClass: 'bg-purple-600',
  },
  {
    standard: 'us_aqi',
    level: 6,
    label: 'Hazardous',
    shortLabel: 'Hazardous',
    rangeText: '301 – 500',
    description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    sensitiveGroupNote: 'Remain indoors with filtered, recirculated air and monitor local municipal health advisories.',
    colorHex: '#881337',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-950',
    borderClass: 'border-rose-300',
    barClass: 'bg-rose-900',
  },
];

export const EUROPEAN_AQI_SCALE: AqiCategoryInfo[] = [
  {
    standard: 'european_aqi',
    level: 1,
    label: 'Good',
    shortLabel: 'Good',
    rangeText: '0 – 20',
    description: 'Very low pollutant concentrations under the European Environment Agency index.',
    sensitiveGroupNote: 'Enjoy outdoor activity and fresh air ventilation normally.',
    colorHex: '#0D9488',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-800',
    borderClass: 'border-teal-200',
    barClass: 'bg-teal-600',
  },
  {
    standard: 'european_aqi',
    level: 2,
    label: 'Fair',
    shortLabel: 'Fair',
    rangeText: '21 – 40',
    description: 'Air quality is generally favorable with low background urban emissions.',
    sensitiveGroupNote: 'Normal outdoor activity is safe for almost everyone.',
    colorHex: '#16A34A',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-900',
    borderClass: 'border-emerald-200',
    barClass: 'bg-emerald-600',
  },
  {
    standard: 'european_aqi',
    level: 3,
    label: 'Moderate',
    shortLabel: 'Moderate',
    rangeText: '41 – 60',
    description: 'Moderate pollutant concentrations; sensitive individuals may notice mild irritation.',
    sensitiveGroupNote: 'Consider reducing prolonged vigorous exercise along high-traffic corridors.',
    colorHex: '#CA8A04',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-900',
    borderClass: 'border-amber-200',
    barClass: 'bg-amber-500',
  },
  {
    standard: 'european_aqi',
    level: 4,
    label: 'Poor',
    shortLabel: 'Poor',
    rangeText: '61 – 80',
    description: 'Elevated pollution levels that may affect sensitive populations and outdoor athletes.',
    sensitiveGroupNote: 'Sensitive groups should move strenuous activities indoors and monitor symptoms.',
    colorHex: '#EA580C',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-900',
    borderClass: 'border-orange-200',
    barClass: 'bg-orange-500',
  },
  {
    standard: 'european_aqi',
    level: 5,
    label: 'Very Poor',
    shortLabel: 'Very Poor',
    rangeText: '81 – 100',
    description: 'High pollution levels posing health risks even for healthy individuals during exertion.',
    sensitiveGroupNote: 'Limit time outdoors, keep windows shut, and use indoor air purification.',
    colorHex: '#DC2626',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-900',
    borderClass: 'border-rose-200',
    barClass: 'bg-rose-600',
  },
  {
    standard: 'european_aqi',
    level: 6,
    label: 'Extremely Poor',
    shortLabel: 'Extremely Poor',
    rangeText: '100+',
    description: 'Severe pollution event requiring immediate reduction of outdoor exposure.',
    sensitiveGroupNote: 'Stay indoors with filtered air and wear N95/FFP2 protection if commuting.',
    colorHex: '#881337',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-950',
    borderClass: 'border-rose-300',
    barClass: 'bg-rose-900',
  },
];

export function getAqiScale(standard: AqiStandard): AqiCategoryInfo[] {
  return standard === 'european_aqi' ? EUROPEAN_AQI_SCALE : US_EPA_SCALE;
}

export function getAqiCategory(value: number | null | undefined, standard: AqiStandard): AqiCategoryInfo {
  const scale = getAqiScale(standard);
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return {
      ...scale[0],
      label: 'Unavailable',
      shortLabel: 'Unavailable',
      rangeText: 'N/A',
      description: 'Live index reading is currently unavailable from the monitoring station.',
      bgClass: 'bg-slate-100',
      textClass: 'text-slate-700',
      borderClass: 'border-slate-200',
      barClass: 'bg-slate-400',
      colorHex: '#64748B',
    };
  }

  if (standard === 'european_aqi') {
    if (value <= 20) return scale[0];
    if (value <= 40) return scale[1];
    if (value <= 60) return scale[2];
    if (value <= 80) return scale[3];
    if (value <= 100) return scale[4];
    return scale[5];
  }

  if (value <= 50) return scale[0];
  if (value <= 100) return scale[1];
  if (value <= 150) return scale[2];
  if (value <= 200) return scale[3];
  if (value <= 300) return scale[4];
  return scale[5];
}

export function getDominantPollutant(current: CurrentPollutants): {
  key: PollutantKey;
  symbol: string;
  name: string;
  value: number | null;
  ratioToWho: number;
} {
  const keys: PollutantKey[] = ['pm2_5', 'pm10', 'ozone', 'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide'];
  let bestKey: PollutantKey = 'pm2_5';
  let bestRatio = -1;

  for (const key of keys) {
    const val = current[key];
    if (typeof val === 'number' && Number.isFinite(val)) {
      const ratio = val / POLLUTANT_DEFINITIONS[key].whoReference;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestKey = key;
      }
    }
  }

  const def = POLLUTANT_DEFINITIONS[bestKey];
  return {
    key: bestKey,
    symbol: def.symbol,
    name: def.name,
    value: current[bestKey],
    ratioToWho: Math.max(0, bestRatio),
  };
}

export function formatPollutantValue(value: number | null | undefined, key: PollutantKey): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (key === 'carbon_monoxide') {
    return value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1);
  }
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

export function formatTimestamp(isoString: string, timezone?: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone || undefined,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatHourLabel(isoString: string): string {
  // Open-Meteo local timestamps come as "YYYY-MM-DDTHH:MM"
  const match = isoString.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return isoString;
  }
}

export function findCleanestWindow(
  hourly: HourlyForecastPoint[],
  standard: AqiStandard
): { start: string; end: string; avgAqi: number } | null {
  const next24 = hourly.slice(0, 24).filter((p) => typeof p[standard] === 'number');
  if (next24.length < 4) return null;

  let minSum = Infinity;
  let bestStartIdx = 0;

  for (let i = 0; i <= next24.length - 3; i++) {
    const sum = (next24[i][standard] || 0) + (next24[i + 1][standard] || 0) + (next24[i + 2][standard] || 0);
    if (sum < minSum) {
      minSum = sum;
      bestStartIdx = i;
    }
  }

  return {
    start: formatHourLabel(next24[bestStartIdx].time),
    end: formatHourLabel(next24[bestStartIdx + 2].time),
    avgAqi: Math.round(minSum / 3),
  };
}

export function generateAlertsAndRecommendations(
  data: AirQualityResponse,
  standard: AqiStandard
): { alerts: AirAlert[]; recommendations: CleanAirRecommendation[] } {
  const alerts: AirAlert[] = [];
  const recommendations: CleanAirRecommendation[] = [];

  const aqiVal = data.current[standard];
  const category = getAqiCategory(aqiVal, standard);
  const dominant = getDominantPollutant(data.current);
  const cleanestWindow = findCleanestWindow(data.hourly, standard);

  if (category.level >= 4) {
    alerts.push({
      id: 'high-aqi-alert',
      severity: 'warning',
      title: `${category.label} Air Quality Alert`,
      message: `Current ${standard === 'european_aqi' ? 'European AQI' : 'US EPA AQI'} is ${aqiVal ?? 'elevated'}, driven primarily by ${dominant.symbol}. Reduce prolonged outdoor exertion.`,
      metric: `${aqiVal ?? '—'} ${standard === 'european_aqi' ? 'EAQI' : 'US AQI'}`,
      timestamp: formatTimestamp(data.current.time),
    });
  } else if (category.level === 3) {
    alerts.push({
      id: 'sensitive-aqi-alert',
      severity: 'advisory',
      title: 'Sensitive Groups Advisory',
      message: `Air quality has reached ${category.label} (${aqiVal}). Children, older adults, and respiratory-sensitive individuals should shorten intense outdoor sessions.`,
      metric: `${aqiVal ?? '—'} ${standard === 'european_aqi' ? 'EAQI' : 'US AQI'}`,
      timestamp: formatTimestamp(data.current.time),
    });
  }

  if (typeof data.current.pm2_5 === 'number' && data.current.pm2_5 > 15) {
    alerts.push({
      id: 'pm25-who-exceed',
      severity: data.current.pm2_5 > 35 ? 'warning' : 'advisory',
      title: 'Fine Particle (PM2.5) Above WHO 24h Guideline',
      message: `Measured PM2.5 is ${data.current.pm2_5.toFixed(1)} µg/m³ (WHO 24-hour guideline is 15 µg/m³). Fine particles penetrate deep into airways.`,
      metric: `${data.current.pm2_5.toFixed(1)} µg/m³`,
    });
  }

  if (typeof data.current.ozone === 'number' && data.current.ozone > 100) {
    alerts.push({
      id: 'ozone-alert',
      severity: 'advisory',
      title: 'Elevated Ground-Level Ozone (O3)',
      message: `Ozone is at ${data.current.ozone.toFixed(1)} µg/m³. Peak ozone typically builds in sunny afternoon hours—shift vigorous outdoor runs to morning.`,
      metric: `${data.current.ozone.toFixed(1)} µg/m³`,
    });
  }

  // Check next 24h forecast spike
  const next24 = data.hourly.slice(0, 24);
  const peakPoint = next24.reduce<HourlyForecastPoint | null>((best, pt) => {
    const v = pt[standard];
    if (v === null) return best;
    if (!best || (best[standard] ?? -1) < v) return pt;
    return best;
  }, null);

  if (peakPoint && typeof peakPoint[standard] === 'number' && typeof aqiVal === 'number' && peakPoint[standard]! - aqiVal >= 20) {
    alerts.push({
      id: 'forecast-spike',
      severity: 'info',
      title: 'Upcoming 24h Pollution Peak Expected',
      message: `Forecast indicates ${standard === 'european_aqi' ? 'EAQI' : 'US AQI'} may rise to ${Math.round(
        peakPoint[standard]!
      )} around ${formatHourLabel(peakPoint.time)}. Plan errands or workouts ahead of that window.`,
      metric: `Peak ~${Math.round(peakPoint[standard]!)}`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'nominal-air-status',
      severity: 'info',
      title: 'No Active Pollution Advisories',
      message: `Current ${dominant.symbol} and overall index levels remain within favorable thresholds for routine urban activity.`,
      metric: `${aqiVal ?? '—'} ${standard === 'european_aqi' ? 'EAQI' : 'US AQI'}`,
    });
  }

  // Recommendations
  recommendations.push({
    id: 'rec-outdoor',
    category: 'Outdoor Activity',
    title: category.level <= 2 ? 'Great conditions for outdoor exercise' : 'Scale back outdoor exertion intensity',
    detail:
      category.level <= 2
        ? 'Current readings support running, cycling, and outdoor commuting with minimal respiratory load.'
        : 'Swap high-intensity outdoor cardio for shorter walks or indoor training until pollutant concentrations settle.',
  });

  if (cleanestWindow) {
    recommendations.push({
      id: 'rec-ventilation',
      category: 'Ventilation',
      title: `Best 24h window for fresh air: ${cleanestWindow.start} – ${cleanestWindow.end}`,
      detail:
        category.level <= 2
          ? `Forecast projects the lowest 3-hour average (${cleanestWindow.avgAqi} ${
              standard === 'european_aqi' ? 'EAQI' : 'US AQI'
            }) during this window—ideal for cross-ventilating indoor rooms.`
          : `Keep windows closed during peak traffic/smoke hours and briefly ventilate around ${cleanestWindow.start}–${cleanestWindow.end} when levels dip to ~${cleanestWindow.avgAqi}.`,
    });
  }

  recommendations.push({
    id: 'rec-protection',
    category: 'Protection',
    title: category.level >= 3 ? 'Use HEPA filtration & consider N95/FFP2 outdoors' : 'Reduce hyper-local roadside exposure',
    detail:
      category.level >= 3
        ? 'Set indoor air purifiers to medium/high with windows sealed, and switch vehicle climate control to recirculate mode in traffic.'
        : 'Even on clean-air days, choosing tree-lined side streets over idling arterial roads lowers personal NO2 and PM2.5 exposure.',
  });

  recommendations.push({
    id: 'rec-sensitive',
    category: 'Sensitive Groups',
    title: 'Asthma, pediatric & cardiac preparedness',
    detail: category.sensitiveGroupNote,
  });

  return { alerts, recommendations };
}

export function summarizeHourlyForAi(hourly: HourlyForecastPoint[], standard: AqiStandard) {
  const next24 = hourly.slice(0, 24);
  const values = next24.map((h) => h[standard]).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return undefined;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const cleanest = findCleanestWindow(hourly, standard);
  return {
    next24HoursMinAqi: min,
    next24HoursMaxAqi: max,
    cleanestWindow: cleanest,
  };
}

export function createDemoAirQualitySnapshot(location: CityLocation): AirQualityResponse {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const hourly: HourlyForecastPoint[] = Array.from({ length: 48 }, (_, i) => {
    const t = new Date(now.getTime() + i * 3600 * 1000);
    const wave = Math.sin((i / 24) * Math.PI * 2);
    const pm25 = Number((11.5 + wave * 3.8).toFixed(1));
    const o3 = Number((58 + Math.cos((i / 24) * Math.PI * 2) * 18).toFixed(1));
    const usAqi = Math.round(46 + wave * 12);
    const eaqi = Math.round(28 + wave * 8);
    return {
      time: t.toISOString().slice(0, 16),
      us_aqi: usAqi,
      european_aqi: eaqi,
      pm2_5: pm25,
      pm10: Number((pm25 * 1.75).toFixed(1)),
      carbon_monoxide: Math.round(240 + wave * 35),
      nitrogen_dioxide: Number((18.2 + wave * 5.4).toFixed(1)),
      sulphur_dioxide: Number((4.1 + wave * 1.1).toFixed(1)),
      ozone: o3,
    };
  });

  return {
    location,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone || 'UTC',
    timezoneAbbreviation: 'DEMO',
    current: {
      time: hourly[0].time,
      us_aqi: hourly[0].us_aqi,
      european_aqi: hourly[0].european_aqi,
      pm2_5: hourly[0].pm2_5,
      pm10: hourly[0].pm10,
      carbon_monoxide: hourly[0].carbon_monoxide,
      nitrogen_dioxide: hourly[0].nitrogen_dioxide,
      sulphur_dioxide: hourly[0].sulphur_dioxide,
      ozone: hourly[0].ozone,
      dust: 6.2,
      uv_index: 3.4,
    },
    units: {
      pm2_5: 'µg/m³',
      pm10: 'µg/m³',
      carbon_monoxide: 'µg/m³',
      nitrogen_dioxide: 'µg/m³',
      sulphur_dioxide: 'µg/m³',
      ozone: 'µg/m³',
      dust: 'µg/m³',
      us_aqi: 'US AQI',
      european_aqi: 'EAQI',
    },
    hourly,
    source: 'Offline Demo Snapshot (Illustrative Sample — Live Open-Meteo API Unavailable)',
    retrievedAt: new Date().toISOString(),
    isDemoData: true,
    demoNotice:
      'Live Open-Meteo telemetry could not be reached. Displaying clearly labeled illustrative demo data so you can inspect the interface.',
  };
}

export interface DailyForecastSummary {
  dateKey: string;
  dayLabel: string;
  minAqi: number | null;
  maxAqi: number | null;
  avgAqi: number | null;
  avgPm25: number | null;
}

export function computeDailyForecastSummaries(
  hourly: HourlyForecastPoint[],
  standard: AqiStandard
): DailyForecastSummary[] {
  const byDay = new Map<string, HourlyForecastPoint[]>();
  for (const pt of hourly) {
    const dayKey = pt.time.slice(0, 10);
    if (!dayKey) continue;
    const list = byDay.get(dayKey) || [];
    list.push(pt);
    byDay.set(dayKey, list);
  }

  const entries = Array.from(byDay.entries()).slice(0, 3);
  return entries.map(([dateKey, pts], index) => {
    const aqiVals = pts.map((p) => p[standard]).filter((v): v is number => typeof v === 'number');
    const pm25Vals = pts.map((p) => p.pm2_5).filter((v): v is number => typeof v === 'number');
    const parsedDate = new Date(`${dateKey}T12:00:00`);
    const dayLabel =
      index === 0
        ? 'Today'
        : index === 1
        ? 'Tomorrow'
        : Number.isNaN(parsedDate.getTime())
        ? dateKey
        : parsedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return {
      dateKey,
      dayLabel,
      minAqi: aqiVals.length ? Math.round(Math.min(...aqiVals)) : null,
      maxAqi: aqiVals.length ? Math.round(Math.max(...aqiVals)) : null,
      avgAqi: aqiVals.length ? Math.round(aqiVals.reduce((s, v) => s + v, 0) / aqiVals.length) : null,
      avgPm25: pm25Vals.length ? Number((pm25Vals.reduce((s, v) => s + v, 0) / pm25Vals.length).toFixed(1)) : null,
    };
  });
}

export interface HealthGuidanceCard {
  id: 'outdoor' | 'mask' | 'indoor' | 'sensitive' | 'reduction';
  category: string;
  title: string;
  statusTag: string;
  description: string;
}

export function generateFiveHealthCards(
  data: AirQualityResponse,
  standard: AqiStandard
): HealthGuidanceCard[] {
  const aqiVal = data.current[standard];
  const cat = getAqiCategory(aqiVal, standard);
  const pm25 = data.current.pm2_5;
  const ozone = data.current.ozone;
  const cleanest = findCleanestWindow(data.hourly, standard);

  return [
    {
      id: 'outdoor',
      category: 'Outdoor Activity Guidance',
      title:
        cat.level <= 2
          ? 'Favorable for outdoor workouts & commuting'
          : cat.level === 3
          ? 'Moderate intensity & shorten prolonged runs'
          : 'Shift vigorous exercise indoors',
      statusTag: cat.level <= 2 ? 'Recommended' : cat.level === 3 ? 'Caution' : 'Limit Exposure',
      description:
        cat.level <= 2
          ? `Current ${standard === 'european_aqi' ? 'EAQI' : 'US AQI'} (${aqiVal ?? '—'}) supports running, cycling, and outdoor play.${
              cleanest ? ` Cleanest air window: ${cleanest.start}–${cleanest.end}.` : ''
            }`
          : `Higher pollutant concentration (${aqiVal ?? '—'}) increases respiratory uptake during deep breathing. Prefer shaded indoor training${
              cleanest ? ` or aim for ${cleanest.start}–${cleanest.end}` : ''
            }.`,
    },
    {
      id: 'mask',
      category: 'Mask Recommendations',
      title:
        cat.level <= 2
          ? 'No respirator needed for general public'
          : cat.level === 3
          ? 'Optional N95/FFP2 near heavy traffic'
          : 'Wear well-fitted N95 / KN95 / FFP2 outdoors',
      statusTag: cat.level <= 2 ? 'Not Required' : cat.level === 3 ? 'Situational' : 'Advised',
      description:
        cat.level >= 3 || (typeof pm25 === 'number' && pm25 > 25)
          ? `PM2.5 is currently ${pm25 !== null ? `${pm25.toFixed(1)} µg/m³` : 'elevated'}. A snug N95/FFP2 respirator filters fine particles far more effectively than cloth or surgical masks.`
          : 'Ambient particulate levels are low enough that respiratory protection is unnecessary for typical urban errands.',
    },
    {
      id: 'indoor',
      category: 'Indoor Air Quality Tips',
      title:
        cat.level <= 2
          ? 'Cross-ventilate with fresh outdoor air'
          : 'Keep windows closed & run HEPA filtration',
      statusTag: cat.level <= 2 ? 'Open Windows' : 'Filter & Seal',
      description:
        cat.level <= 2
          ? `Outdoor air is cleaner than typical stale indoor air.${
              cleanest ? ` Optimal ventilation window is ${cleanest.start}–${cleanest.end}.` : ''
            } Use kitchen exhaust fans when cooking.`
          : 'Close street-facing windows, run a HEPA air purifier on medium-high, and avoid burning candles or incense indoors.',
    },
    {
      id: 'sensitive',
      category: 'Sensitive Groups Precautions',
      title: 'Asthma, pediatric, senior & cardiac care',
      statusTag: cat.level <= 1 ? 'Low Risk' : cat.level === 2 ? 'Monitor' : 'Protect',
      description: `${cat.sensitiveGroupNote}${
        typeof ozone === 'number' && ozone > 100
          ? ` Note elevated O3 (${ozone.toFixed(1)} µg/m³) during afternoon sunlight.`
          : ''
      }`,
    },
    {
      id: 'reduction',
      category: 'Pollution Reduction Suggestions',
      title: 'Lower urban emissions & personal exposure',
      statusTag: 'Civic Action',
      description:
        'Choose rail, cycling, or carpooling for short trips, avoid engine idling near schools and intersections, and shift energy-intensive appliance use to off-peak hours.',
    },
  ];
}

