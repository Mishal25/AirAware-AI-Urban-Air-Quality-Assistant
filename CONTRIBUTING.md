# Contributing to AirAware AI

Thank you for your interest in contributing to **AirAware AI — Urban Air Quality Assistant**!

## Development Workflow

1. **Fork & Clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/airaware-ai.git
   cd airaware-ai
   ```
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Install Dependencies & Configure Local Environment**:
   ```bash
   npm install
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` to `.env` (never commit `.env`!).
4. **Verify Before Opening a Pull Request**:
   ```bash
   npm run lint
   npm run build
   ```

## Contribution Guidelines

- **Real Telemetry First**: Never replace live Open-Meteo API calls with hardcoded sample numbers. Any fallback demo snapshot must remain strictly opt-in and clearly labeled.
- **Server-Side AI Security**: Keep all `@google/genai` SDK calls inside `server.ts`. Never import `@google/genai` or pass `GEMINI_API_KEY` into `src/` client bundles.
- **Accessibility & Responsiveness**: Ensure all interactive controls support keyboard navigation, WCAG AA contrast, and mobile viewports.
- **Repository Hygiene**: Keep commits clean, avoid adding large binary assets or video files (keep repo < 10 MB), and update `README.md` if adding new endpoints or environment variables.
