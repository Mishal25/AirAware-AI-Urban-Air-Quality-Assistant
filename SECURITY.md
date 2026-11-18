# Security Policy

## API Key & Secret Management

- **Never commit secrets**: `.env`, `.env.local`, `.env.production`, and all credential files are excluded via `.gitignore`.
- **Server-Side Isolation**: `GEMINI_API_KEY` is accessed strictly on the backend inside `server.ts` via `process.env.GEMINI_API_KEY`. It is never bundled into Vite client assets or exposed in browser network responses.
- **Deployment Secrets**: Configure `GEMINI_API_KEY` exclusively through your hosting provider's encrypted Environment Variables settings (e.g., Vercel Project Settings > Environment Variables).

## Privacy & Location Data

- Browser geolocation (`navigator.geolocation`) is strictly opt-in when triggered by the user.
- Coordinates are transmitted ephemerally to query Open-Meteo Air Quality and locality resolution APIs and are never stored in any database or server log.

## Reporting a Vulnerability

If you discover a security issue, exposed secret, or input validation flaw:

1. **Do not** disclose the issue publicly in GitHub Issues before it is patched.
2. Open a private security advisory on GitHub or contact the repository maintainer directly with reproduction steps and affected endpoints.
