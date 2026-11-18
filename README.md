# AirAware AI — Urban Air Quality Assistant

**Tagline:** Breathe Smarter. Live Healthier.

AirAware AI is a full-stack environmental-tech web application built with React, TypeScript, Tailwind CSS, Express, the Open-Meteo Air Quality API, and server-side Google Gemini AI (`@google/genai`). It delivers live urban air quality telemetry, hourly 72-hour forecasts, multi-city comparisons, pollutant education, and plain-language health guidance grounded strictly in retrieved measurements.

---

## Key Features

- **Live City AQI Dashboard**: Search any city worldwide via autocomplete or detect your current location using browser geolocation (`navigator.geolocation` + reverse geocoding).
- **Complete Pollutant Telemetry**: Displays `PM2.5`, `PM10`, `O3`, `NO2`, `SO2`, `CO`, dust aerosol, and UV index with exact units (`µg/m³`), timestamps, and WHO 2021 guideline comparisons.
- **Dual AQI Standards**: Switch cleanly between **US EPA AQI (0–500)** and **European EAQI (0–100+)** with explicit category badges, scale bars, and expandable health threshold tables.
- **Server-Side Gemini AI Health Assistant**:
  - Produces structured plain-language briefings grounded exclusively in the retrieved pollutant readings.
  - Supports interactive Q&A chat about outdoor exercise, ventilation windows, and sensitive group precautions.
  - Enforces strict guardrails: never invents live readings, never issues medical diagnoses, and displays clear informational disclaimers.
- **Interactive 72-Hour Forecast Charts**: Inspect 24h, 48h, or 72h projections across AQI indices and individual pollutants with crosshair hover probes and cleanest 3-hour window recommendations.
- **Pollution Alerts & Clean-Air Recommendations**: Dynamic advisories triggered by WHO/EPA thresholds and upcoming forecast spikes.
- **Multi-City Comparison**: Compare up to 4 cities side-by-side in charts and tabular matrices, plus optional Gemini AI comparative synthesis.
- **Education & About Views**: Detailed pollutant encyclopedia, WHO vs EPA/EAQI guides, data attribution, privacy notice, and medical disclaimer.
- **Resilient State Handling**: Skeleton loaders, input validation, explicit API error banners, and an opt-in, clearly labeled Demo Data mode only when the upstream live API is unreachable.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js (v22+), Express, `@google/genai` (`gemini-4-hydrogen`)
- **External Data APIs**:
  - [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api) (Copernicus Atmosphere Monitoring Service / CAMS)
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
  - [BigDataCloud Reverse Geocoding Client API](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api)

---

## Environment Variables

Configure environment variables via your runtime secrets manager or a local `.env` file (never commit `.env` or secrets to GitHub):

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes (for AI features) | Server-side Google Gemini API key. Never exposed to browser code. |
| `PORT` | Optional | Server port (defaults to `3000`). |
| `APP_URL` | Optional | Public URL where the application is hosted. |

---

## Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env
   ```

3. **Run in development mode** (Express backend + Vite middleware on port 3000):
   ```bash
   npm run dev
   ```

4. **Type-check & build for production**:
   ```bash
   npm run lint
   npm run build
   ```

5. **Run production server**:
   ```bash
   NODE_ENV=production npm start
   ```

---

## Security & Privacy Notes

- `GEMINI_API_KEY` is accessed exclusively inside `server.ts` and is never bundled into frontend assets.
- Geolocation coordinates are used ephemerally to fetch local telemetry and are never persisted on the server.
- `.gitignore` excludes `.env`, `node_modules`, and `dist` so secrets are never committed to version control.

---

## Disclaimer

AirAware AI provides environmental telemetry and general informational guidance only. It is not a medical device and is not a substitute for professional medical advice, diagnosis, or treatment.
