import {
  AirQualityResponse,
  AqiStandard,
  ChatMessage,
  CityLocation,
  GeminiHealthInsights,
} from '../types/airQuality';
import { summarizeHourlyForAi } from '../utils/aqi';

async function handleApiResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' && data.error) ||
      `Request failed with HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function searchCities(query: string): Promise<CityLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
  const data = await handleApiResponse<{ results: CityLocation[] }>(res);
  return data.results || [];
}

export async function reverseGeocode(lat: number, lon: number): Promise<CityLocation> {
  const res = await fetch(`/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
  const data = await handleApiResponse<{ location: CityLocation }>(res);
  return data.location;
}

export async function fetchAirQuality(location: CityLocation): Promise<AirQualityResponse> {
  const res = await fetch(
    `/api/air-quality?lat=${encodeURIComponent(location.latitude)}&lon=${encodeURIComponent(location.longitude)}`
  );
  const data = await handleApiResponse<Omit<AirQualityResponse, 'location'>>(res);
  return {
    ...data,
    location,
  };
}

export async function fetchGeminiInsights(
  airQuality: AirQualityResponse,
  standard: AqiStandard
): Promise<GeminiHealthInsights> {
  const res = await fetch('/api/ai/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: airQuality.location,
      standard,
      current: airQuality.current,
      hourlySummary: summarizeHourlyForAi(airQuality.hourly, standard),
      isDemoData: airQuality.isDemoData,
    }),
  });
  const data = await handleApiResponse<{ insights: GeminiHealthInsights }>(res);
  return data.insights;
}

export async function askGeminiAssistant(params: {
  question: string;
  history: ChatMessage[];
  airQuality: AirQualityResponse;
  standard: AqiStandard;
}): Promise<{ reply: string; timestamp: string }> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: params.question,
      history: params.history.map((m) => ({ role: m.role, content: m.content })),
      location: params.airQuality.location,
      standard: params.standard,
      current: params.airQuality.current,
      hourlySummary: summarizeHourlyForAi(params.airQuality.hourly, params.standard),
      isDemoData: params.airQuality.isDemoData,
    }),
  });
  return await handleApiResponse<{ reply: string; timestamp: string }>(res);
}

export async function fetchGeminiCityComparison(
  cities: AirQualityResponse[],
  standard: AqiStandard
): Promise<string> {
  const res = await fetch('/api/ai/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      standard,
      cities: cities.map((c) => ({
        location: c.location,
        current: c.current,
      })),
    }),
  });
  const data = await handleApiResponse<{ comparison: string }>(res);
  return data.comparison;
}
