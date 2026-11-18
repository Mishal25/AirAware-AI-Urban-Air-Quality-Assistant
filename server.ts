import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

function createGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 10000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Upstream HTTP ${response.status}: ${text.slice(0, 200)}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function parseCoordinate(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) return null;
  return num;
}

function buildMeasurementContext(payload: {
  location?: { name?: string; admin1?: string; country?: string; latitude?: number; longitude?: number };
  standard?: string;
  current?: Record<string, unknown>;
  hourlySummary?: Record<string, unknown>;
  isDemoData?: boolean;
}): string {
  const loc = payload.location || {};
  const cur = payload.current || {};
  const place = [loc.name, loc.admin1, loc.country].filter(Boolean).join(', ') || 'Selected location';

  return [
    `Location: ${place} (Lat: ${loc.latitude ?? 'N/A'}, Lon: ${loc.longitude ?? 'N/A'})`,
    `Active AQI Standard: ${payload.standard === 'european_aqi' ? 'European AQI (EAQI)' : 'US EPA AQI (0-500)'}`,
    `Data Source Mode: ${payload.isDemoData ? 'DEMO FALLBACK DATA (Clearly Labeled)' : 'Live Open-Meteo Air Quality API (CAMS Atmospheric Data)'}`,
    `Measurement Timestamp: ${cur.time ?? 'Unknown'}`,
    `US EPA AQI: ${cur.us_aqi ?? 'Unavailable'}`,
    `European AQI: ${cur.european_aqi ?? 'Unavailable'}`,
    `PM2.5: ${cur.pm2_5 ?? 'Unavailable'} µg/m³`,
    `PM10: ${cur.pm10 ?? 'Unavailable'} µg/m³`,
    `Ozone (O3): ${cur.ozone ?? 'Unavailable'} µg/m³`,
    `Nitrogen Dioxide (NO2): ${cur.nitrogen_dioxide ?? 'Unavailable'} µg/m³`,
    `Sulphur Dioxide (SO2): ${cur.sulphur_dioxide ?? 'Unavailable'} µg/m³`,
    `Carbon Monoxide (CO): ${cur.carbon_monoxide ?? 'Unavailable'} µg/m³`,
    `Dust: ${cur.dust ?? 'Unavailable'} µg/m³`,
    `UV Index: ${cur.uv_index ?? 'Unavailable'}`,
    payload.hourlySummary ? `24h Forecast Summary: ${JSON.stringify(payload.hourlySummary)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function extractGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('PERMISSION_DENIED') || raw.includes('403') || raw.includes('API_KEY_INVALID') || raw.includes('400')) {
    return {
      status: 403,
      message:
        'Gemini API authorization failed. Please verify the GEMINI_API_KEY configuration in Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API rate limit or quota reached. Please wait a moment and try again.',
    };
  }
  return {
    status: 502,
    message: `Unable to reach Gemini AI service right now: ${raw}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'AirAware AI',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/geocode', async (req: Request, res: Response) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length < 2 || query.length > 120) {
      res.status(400).json({ error: 'Search query must be between 2 and 120 characters.' });
      return;
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=8&language=en&format=json`;
      const data = (await fetchJsonWithTimeout(url)) as {
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
      };

      const results = (data.results || []).map((item) => ({
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

      res.json({ results });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Geocoding service error';
      res.status(502).json({ error: `City search failed: ${message}` });
    }
  });

  app.get('/api/reverse-geocode', async (req: Request, res: Response) => {
    const lat = parseCoordinate(req.query.lat, -90, 90);
    const lon = parseCoordinate(req.query.lon, -180, 180);

    if (lat === null || lon === null) {
      res.status(400).json({ error: 'Valid numeric latitude (-90..90) and longitude (-180..180) are required.' });
      return;
    }

    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const data = (await fetchJsonWithTimeout(url, 6000)) as {
        city?: string;
        locality?: string;
        principalSubdivision?: string;
        countryName?: string;
        countryCode?: string;
      };

      const name = data.city || data.locality || data.principalSubdivision || `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
      res.json({
        location: {
          id: `gps-${lat.toFixed(3)}-${lon.toFixed(3)}`,
          name,
          admin1: data.principalSubdivision,
          country: data.countryName || 'Current Location',
          countryCode: data.countryCode,
          latitude: lat,
          longitude: lon,
          isCurrentLocation: true,
        },
      });
    } catch {
      res.json({
        location: {
          id: `gps-${lat.toFixed(3)}-${lon.toFixed(3)}`,
          name: `Coordinates ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
          country: 'Current Location',
          latitude: lat,
          longitude: lon,
          isCurrentLocation: true,
        },
      });
    }
  });

  app.get('/api/air-quality', async (req: Request, res: Response) => {
    const lat = parseCoordinate(req.query.lat, -90, 90);
    const lon = parseCoordinate(req.query.lon, -180, 180);

    if (lat === null || lon === null) {
      res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
      return;
    }

    try {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
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

      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
      const raw = (await fetchJsonWithTimeout(url, 12000)) as {
        latitude: number;
        longitude: number;
        timezone: string;
        timezone_abbreviation: string;
        elevation?: number;
        current: Record<string, number | string | null>;
        current_units?: Record<string, string>;
        hourly: {
          time: string[];
          us_aqi?: Array<number | null>;
          european_aqi?: Array<number | null>;
          pm2_5?: Array<number | null>;
          pm10?: Array<number | null>;
          carbon_monoxide?: Array<number | null>;
          nitrogen_dioxide?: Array<number | null>;
          sulphur_dioxide?: Array<number | null>;
          ozone?: Array<number | null>;
        };
      };

      const times = raw.hourly?.time || [];
      const hourly = times.map((time, i) => ({
        time,
        us_aqi: raw.hourly.us_aqi?.[i] ?? null,
        european_aqi: raw.hourly.european_aqi?.[i] ?? null,
        pm2_5: raw.hourly.pm2_5?.[i] ?? null,
        pm10: raw.hourly.pm10?.[i] ?? null,
        carbon_monoxide: raw.hourly.carbon_monoxide?.[i] ?? null,
        nitrogen_dioxide: raw.hourly.nitrogen_dioxide?.[i] ?? null,
        sulphur_dioxide: raw.hourly.sulphur_dioxide?.[i] ?? null,
        ozone: raw.hourly.ozone?.[i] ?? null,
      }));

      const units = raw.current_units || {};

      res.json({
        latitude: raw.latitude,
        longitude: raw.longitude,
        timezone: raw.timezone || 'UTC',
        timezoneAbbreviation: raw.timezone_abbreviation || 'UTC',
        elevation: raw.elevation,
        current: {
          time: String(raw.current?.time || new Date().toISOString()),
          interval: typeof raw.current?.interval === 'number' ? raw.current.interval : 3600,
          us_aqi: typeof raw.current?.us_aqi === 'number' ? raw.current.us_aqi : null,
          european_aqi: typeof raw.current?.european_aqi === 'number' ? raw.current.european_aqi : null,
          pm2_5: typeof raw.current?.pm2_5 === 'number' ? raw.current.pm2_5 : null,
          pm10: typeof raw.current?.pm10 === 'number' ? raw.current.pm10 : null,
          carbon_monoxide: typeof raw.current?.carbon_monoxide === 'number' ? raw.current.carbon_monoxide : null,
          nitrogen_dioxide: typeof raw.current?.nitrogen_dioxide === 'number' ? raw.current.nitrogen_dioxide : null,
          sulphur_dioxide: typeof raw.current?.sulphur_dioxide === 'number' ? raw.current.sulphur_dioxide : null,
          ozone: typeof raw.current?.ozone === 'number' ? raw.current.ozone : null,
          dust: typeof raw.current?.dust === 'number' ? raw.current.dust : null,
          uv_index: typeof raw.current?.uv_index === 'number' ? raw.current.uv_index : null,
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
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Air quality service error';
      res.status(502).json({
        error: `Unable to retrieve live air quality data from Open-Meteo: ${message}`,
      });
    }
  });

  app.post('/api/ai/insights', async (req: Request, res: Response) => {
    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to enable AI health insights.',
      });
      return;
    }

    const { location, standard, current, hourlySummary, isDemoData } = req.body || {};
    if (!current || typeof current !== 'object') {
      res.status(400).json({ error: 'Retrieved pollutant measurements are required to generate AI insights.' });
      return;
    }

    const contextText = buildMeasurementContext({
      location,
      standard,
      current,
      hourlySummary,
      isDemoData,
    });

    const systemInstruction = `You are AirAware AI, an environmental air quality educator and public-health information assistant.
STRICT RULES:
1. Ground every explanation exclusively in the provided pollutant measurements and forecast context.
2. NEVER invent, guess, or alter numerical measurements. If a value is "Unavailable", state that it is unavailable.
3. NEVER provide a medical diagnosis or prescribe treatment. Keep all guidance as general environmental health precautions.
4. Use clear, calm, accessible everyday language suitable for urban residents, parents, runners, and commuters.
5. Keep bullet points concise, practical, and directly tied to the observed pollutant numbers and units (µg/m³).`;

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Analyze the following retrieved urban air quality measurements and produce a structured health briefing:\n\n${contextText}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: 'A crisp 6-12 word summary headline referencing the city and current AQI level.',
              },
              plainLanguageSummary: {
                type: Type.STRING,
                description: '2-3 sentences explaining what the retrieved AQI and pollutant levels mean in plain language.',
              },
              dominantPollutantExplanation: {
                type: Type.STRING,
                description: '1-2 sentences identifying the primary pollutant driving the reading and what typically causes it.',
              },
              generalPrecautions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concise precautions for the general public based strictly on the retrieved values.',
              },
              sensitiveGroupAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 practical considerations for children, older adults, and people with asthma or heart/lung conditions.',
              },
              actionableSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 practical actions regarding outdoor timing, indoor ventilation, or filtration.',
              },
              disclaimer: {
                type: Type.STRING,
                description: 'Clear informational disclaimer stating this is not medical advice.',
              },
            },
            required: [
              'headline',
              'plainLanguageSummary',
              'dominantPollutantExplanation',
              'generalPrecautions',
              'sensitiveGroupAdvice',
              'actionableSteps',
              'disclaimer',
            ],
          },
        },
      });

      const rawText = (response.text || '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Gemini returned an empty response.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json({
        insights: {
          ...parsed,
          generatedAt: new Date().toISOString(),
          model: GEMINI_MODEL,
        },
      });
    } catch (err) {
      const mapped = extractGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to ask the AI assistant.',
      });
      return;
    }

    const { question, history, location, standard, current, hourlySummary, isDemoData } = req.body || {};
    if (typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Please enter a non-empty question.' });
      return;
    }
    if (question.trim().length > 800) {
      res.status(400).json({ error: 'Question must be under 800 characters.' });
      return;
    }

    const contextText = buildMeasurementContext({
      location,
      standard,
      current,
      hourlySummary,
      isDemoData,
    });

    const formattedHistory = Array.isArray(history)
      ? history
          .slice(-8)
          .filter(
            (m: unknown): m is { role: string; content: string } =>
              Boolean(m && typeof m === 'object' && 'role' in m && 'content' in m)
          )
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content).slice(0, 800)}`)
          .join('\n')
      : '';

    const systemInstruction = `You are AirAware AI, a helpful urban air quality assistant.
You are answering a user's question about the currently selected city's air quality data.

RETRIEVED DATA CONTEXT:
${contextText}

STRICT GUARDRAILS:
1. Only cite measurements that appear in the RETRIEVED DATA CONTEXT above. Never fabricate live readings.
2. Never provide medical diagnoses, prescriptions, or personalized clinical directives. Frame guidance as general public-health precautions and recommend consulting a healthcare professional for personal medical concerns.
3. Be concise, well-structured, and practical (around 80-180 words unless the user asks for detail).
4. Always note briefly when relevant that guidance is informational only.`;

    const prompt = formattedHistory
      ? `Recent conversation:\n${formattedHistory}\n\nNew user question: ${question.trim()}`
      : question.trim();

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const answer = (response.text || '').trim();
      if (!answer) {
        res.status(502).json({ error: 'Gemini returned an empty response.' });
        return;
      }

      res.json({
        reply: answer,
        model: GEMINI_MODEL,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = extractGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/ai/compare', async (req: Request, res: Response) => {
    const ai = createGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
      return;
    }

    const { cities, standard } = req.body || {};
    if (!Array.isArray(cities) || cities.length < 2) {
      res.status(400).json({ error: 'At least two cities with retrieved measurements are required.' });
      return;
    }

    const summaryLines = cities.map((entry: { location?: { name?: string; country?: string }; current?: Record<string, unknown> }) => {
      const loc = entry.location || {};
      const cur = entry.current || {};
      return `- ${loc.name || 'City'}, ${loc.country || ''}: US AQI=${cur.us_aqi ?? 'N/A'}, EAQI=${cur.european_aqi ?? 'N/A'}, PM2.5=${cur.pm2_5 ?? 'N/A'} µg/m³, PM10=${cur.pm10 ?? 'N/A'} µg/m³, O3=${cur.ozone ?? 'N/A'} µg/m³, NO2=${cur.nitrogen_dioxide ?? 'N/A'} µg/m³, SO2=${cur.sulphur_dioxide ?? 'N/A'} µg/m³, CO=${cur.carbon_monoxide ?? 'N/A'} µg/m³`;
    });

    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Compare the air quality across these cities using the active standard (${
          standard === 'european_aqi' ? 'European AQI' : 'US EPA AQI'
        }):\n${summaryLines.join('\n')}\n\nProvide a concise 3-4 sentence comparison highlighting which city currently has the cleanest air, what pollutants differ most, and practical outdoor precautions. Only cite the provided numbers and state that this is informational, not medical advice.`,
      });

      res.json({
        comparison: (response.text || '').trim(),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const mapped = extractGeminiError(err);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AirAware AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
