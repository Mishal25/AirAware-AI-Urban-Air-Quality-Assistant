import {
  AirQualityResponse,
  AqiStandard,
  ChatMessage,
  CityLocation,
  GeminiHealthInsights,
} from '../types/airQuality';
import { summarizeHourlyForAi } from '../utils/aqi';

function assertValidCoordinates(lat: number, lon: number): void {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude coordinate (${String(lat)}). Must be between -90 and 90.`);
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error(`Invalid longitude coordinate (${String(lon)}). Must be between -180 and 180.`);
  }
}

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

function normalizeOpenMeteoPayload(
  raw: Record<string, unknown>,
  location: CityLocation
): AirQualityResponse {
  const current = (raw.current || {}) as Record<string, unknown>;
  const units = (raw.current_units || {}) as Record<string, string>;
  const hourlyRaw = (raw.hourly || {}) as {
    time?: string[];
    us_aqi?: Array<number | null>;
    european_aqi?: Array<number | null>;
    pm2_5?: Array<number | null>;
    pm10?: Array<number | null>;
    carbon_monoxide?: Array<number | null>;
    nitrogen_dioxide?: Array<number | null>;
    sulphur_dioxide?: Array<number | null>;
    ozone?: Array<number | null>;
  };

  if (!raw.current || typeof raw.current !== 'object') {
    throw new Error('Open-Meteo returned an invalid air quality payload without current telemetry.');
  }

  const times = Array.isArray(hourlyRaw.time) ? hourlyRaw.time : [];
  const hourly = times.map((time, i) => ({
    time,
    us_aqi: hourlyRaw.us_aqi?.[i] ?? null,
    european_aqi: hourlyRaw.european_aqi?.[i] ?? null,
    pm2_5: hourlyRaw.pm2_5?.[i] ?? null,
    pm10: hourlyRaw.pm10?.[i] ?? null,
    carbon_monoxide: hourlyRaw.carbon_monoxide?.[i] ?? null,
    nitrogen_dioxide: hourlyRaw.nitrogen_dioxide?.[i] ?? null,
    sulphur_dioxide: hourlyRaw.sulphur_dioxide?.[i] ?? null,
    ozone: hourlyRaw.ozone?.[i] ?? null,
  }));

  return {
    location,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : location.latitude,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : location.longitude,
    timezone: typeof raw.timezone === 'string' ? raw.timezone : 'UTC',
    timezoneAbbreviation:
      typeof raw.timezone_abbreviation === 'string' ? raw.timezone_abbreviation : 'UTC',
    elevation: typeof raw.elevation === 'number' ? raw.elevation : undefined,
    current: {
      time: String(current.time || new Date().toISOString()),
      interval: typeof current.interval === 'number' ? current.interval : 3600,
      us_aqi: typeof current.us_aqi === 'number' ? current.us_aqi : null,
      european_aqi: typeof current.european_aqi === 'number' ? current.european_aqi : null,
      pm2_5: typeof current.pm2_5 === 'number' ? current.pm2_5 : null,
      pm10: typeof current.pm10 === 'number' ? current.pm10 : null,
      carbon_monoxide: typeof current.carbon_monoxide === 'number' ? current.carbon_monoxide : null,
      nitrogen_dioxide: typeof current.nitrogen_dioxide === 'number' ? current.nitrogen_dioxide : null,
      sulphur_dioxide: typeof current.sulphur_dioxide === 'number' ? current.sulphur_dioxide : null,
      ozone: typeof current.ozone === 'number' ? current.ozone : null,
      dust: typeof current.dust === 'number' ? current.dust : null,
      uv_index: typeof current.uv_index === 'number' ? current.uv_index : null,
    },
    units: {
      pm2_5: units.pm2_5 || 'µg/m³',
      pm10: units.pm10 || 'µg/m³',
      carbon_monoxide: units.carbon_monoxide || 'µg/m³',
      nitrogen_dioxide: units.nitrogen_dioxide || 'µg/m³',
      sulphur_dioxide: units.sulphur_dioxide || 'µg/m³',
      ozone: units.ozone || 'µg/m³',
      dust: units.dust || 'µg/m³',
      us_aqi: units.us_aqi || 'US AQI',
      european_aqi: units.european_aqi || 'EAQI',
    },
    hourly,
    source: 'Open-Meteo Air Quality API (CAMS / Copernicus Atmosphere Monitoring Service)',
    retrievedAt: new Date().toISOString(),
    isDemoData: false,
  };
}

export async function searchCities(query: string): Promise<CityLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
  if (res.status !== 404) {
    const data = await handleApiResponse<{ results: CityLocation[] }>(res);
    return Array.isArray(data.results) ? data.results : [];
  }

  // Fallback directly to public CORS-enabled Open-Meteo Geocoding API if /api/geocode is not mounted
  const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=8&language=en&format=json`;
  const directRes = await fetch(directUrl);
  const directData = await handleApiResponse<{
    results?: Array<{
      id: number;
      name: string;
      admin1?: string;
      country?: string;
      country_code?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
      population?: number;
    }>;
  }>(directRes);

  return (directData.results || []).map((item) => ({
    id: `${item.id}-${item.latitude.toFixed(3)}-${item.longitude.toFixed(3)}`,
    name: item.name,
    admin1: item.admin1,
    country: item.country || item.country_code || 'Unknown',
    countryCode: item.country_code,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
    population: item.population,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<CityLocation> {
  assertValidCoordinates(lat, lon);

  try {
    const res = await fetch(
      `/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.location && typeof data.location.latitude === 'number') {
        return data.location as CityLocation;
      }
    }

    if (res.status === 404 || !res.ok) {
      const directRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
          lat
        )}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`
      );
      if (directRes.ok) {
        const data = (await directRes.json()) as {
          city?: string;
          locality?: string;
          principalSubdivision?: string;
          countryName?: string;
          countryCode?: string;
        };
        const name =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          `Current Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
        return {
          id: `gps-${lat.toFixed(3)}-${lon.toFixed(3)}`,
          name,
          admin1: data.principalSubdivision,
          country: data.countryName || 'Current Location',
          countryCode: data.countryCode,
          latitude: lat,
          longitude: lon,
          isCurrentLocation: true,
        };
      }
    }
  } catch {
    // Fall back safely to coordinate label so air quality fetch still runs
  }

  return {
    id: `gps-${lat.toFixed(3)}-${lon.toFixed(3)}`,
    name: `Current Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    country: 'GPS Coordinates',
    latitude: lat,
    longitude: lon,
    isCurrentLocation: true,
  };
}

export async function fetchAirQuality(location: CityLocation): Promise<AirQualityResponse> {
  assertValidCoordinates(location.latitude, location.longitude);

  const res = await fetch(
    `/api/air-quality?lat=${encodeURIComponent(location.latitude)}&lon=${encodeURIComponent(
      location.longitude
    )}`
  );

  if (res.status !== 404) {
    const data = await handleApiResponse<Omit<AirQualityResponse, 'location'>>(res);
    if (!data || typeof data !== 'object' || !data.current || !Array.isArray(data.hourly)) {
      throw new Error('Air quality API returned an unexpected response structure.');
    }
    return {
      ...data,
      location,
    };
  }

  // Fallback directly to official Open-Meteo Air Quality API if /api/air-quality is unavailable (HTTP 404)
  const params = new URLSearchParams({
    latitude: location.latitude.toFixed(4),
    longitude: location.longitude.toFixed(4),
    current: [
      'us_aqi',
      'european_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'dust',
      'uv_index',
    ].join(','),
    hourly: [
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'us_aqi',
      'european_aqi',
    ].join(','),
    forecast_days: '3',
    timezone: 'auto',
  });

  const directRes = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`
  );
  const raw = await handleApiResponse<Record<string, unknown>>(directRes);
  if (raw.error) {
    throw new Error(String(raw.reason || 'Open-Meteo rejected the air quality request.'));
  }
  return normalizeOpenMeteoPayload(raw, location);
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
