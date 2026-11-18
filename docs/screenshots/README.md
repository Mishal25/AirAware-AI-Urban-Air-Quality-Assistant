# Screenshot Capture Guide (`docs/screenshots/`)

The `.svg` files currently in this folder are **clearly labeled placeholders** so the repository renders cleanly on GitHub without broken links prior to your final screenshot capture.

## How to Replace With Real Screenshots

1. Open your deployed Vercel URL (or `http://localhost:3000`) in Chrome or Edge.
2. Capture crisp screenshots (`.png` or `.webp`, keep each file under ~500 KB) for each view listed below:

| Placeholder File | Recommended Capture View | Viewport | Target Filename |
| :--- | :--- | :--- | :--- |
| `01-main-dashboard.svg` | Overview page showing Sidebar, TopBar, Welcome Hero, and Main AQI Card | `1440×900` | `01-main-dashboard.png` |
| `02-live-air-quality.svg` | Live Air Quality tab showing Circular AQI Gauge & Scale Legend expanded | `1440×900` | `02-live-air-quality.png` |
| `03-pollutant-analysis.svg` | Pollutant Telemetry cards (`PM2.5`, `PM10`, `CO`, `NO2`, `SO2`, `O3`) + WHO bar chart | `1440×900` | `03-pollutant-analysis.png` |
| `04-gemini-ai-assistant.svg` | "Your Personal Air Quality Advisor" with live Gemini summary & Q&A chat response | `1440×900` | `04-gemini-ai-assistant.png` |
| `05-city-comparison.svg` | City Comparison tab comparing 3–4 global cities + Gemini comparative synthesis | `1440×900` | `05-city-comparison.png` |
| `06-air-quality-forecast.svg` | Forecast & Trends tab showing 24h/48h/72h SVG chart + 3-Day Summary + Hourly Table | `1440×900` | `06-air-quality-forecast.png` |
| `07-mobile-responsive-dashboard.svg` | Chrome DevTools mobile view (`iPhone 14 Pro` / `390×844`) | `390×844` | `07-mobile-responsive-dashboard.png` |

3. Save the `.png` files into `docs/screenshots/`, remove the corresponding `.svg` placeholders, and update the `.svg` extensions to `.png` inside the **Screenshots Gallery** section of `README.md`.
