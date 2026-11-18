export type AqiStandard = 'us_aqi' | 'european_aqi';

export type PollutantKey =
  | 'pm2_5'
  | 'pm10'
  | 'ozone'
  | 'nitrogen_dioxide'
  | 'sulphur_dioxide'
  | 'carbon_monoxide';

export type ForecastMetricKey = AqiStandard | PollutantKey;

export interface CityLocation {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  population?: number;
  isCurrentLocation?: boolean;
}

export interface CurrentPollutants {
  time: string;
  interval?: number;
  us_aqi: number | null;
  european_aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  carbon_monoxide: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  ozone: number | null;
  dust: number | null;
  uv_index: number | null;
}

export interface HourlyForecastPoint {
  time: string;
  us_aqi: number | null;
  european_aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  carbon_monoxide: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  ozone: number | null;
}

export interface AirQualityResponse {
  location: CityLocation;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneAbbreviation: string;
  elevation?: number;
  current: CurrentPollutants;
  units: {
    pm2_5: string;
    pm10: string;
    carbon_monoxide: string;
    nitrogen_dioxide: string;
    sulphur_dioxide: string;
    ozone: string;
    dust: string;
    us_aqi: string;
    european_aqi: string;
  };
  hourly: HourlyForecastPoint[];
  source: string;
  retrievedAt: string;
  isDemoData: boolean;
  demoNotice?: string;
}

export interface AqiCategoryInfo {
  standard: AqiStandard;
  level: number;
  label: string;
  shortLabel: string;
  rangeText: string;
  description: string;
  sensitiveGroupNote: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  barClass: string;
}

export interface AirAlert {
  id: string;
  severity: 'info' | 'advisory' | 'warning';
  title: string;
  message: string;
  metric?: string;
  timestamp?: string;
}

export interface CleanAirRecommendation {
  id: string;
  category: 'Outdoor Activity' | 'Ventilation' | 'Protection' | 'Sensitive Groups';
  title: string;
  detail: string;
}

export interface GeminiHealthInsights {
  headline: string;
  plainLanguageSummary: string;
  dominantPollutantExplanation: string;
  generalPrecautions: string[];
  sensitiveGroupAdvice: string[];
  actionableSteps: string[];
  disclaimer: string;
  generatedAt: string;
  model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}
