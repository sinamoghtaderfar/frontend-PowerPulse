# PowerPulse frontend

React + Vite + Material UI dashboard for the
[PowerPulse API](https://github.com/sinamoghtaderfar/api-Forecast-PowerPulse): forecasts of
Germany's annual **electricity generation (TWh)** from Prophet, Random Forest and XGBoost.

Pages: Overview, Model forecasts (`/forecast?model=prophet|random-forest|xgboost`), Compare
models, Methodology. Custom forecasts are not supported by the API and are shown as unavailable.

## API contract used

| Request | Use |
|---|---|
| `GET /forecast/all?years_ahead=N` (1–50) | Forecast rows, growth summaries, interval metadata |
| `GET /health` | API status indicator |

Interval bounds (`lower`/`upper`) can be `null` beyond the calibrated horizon; charts then show
the point forecast only. The API does not expose historical observations.

## Development

```bash
npm ci
npm run dev        # http://localhost:5173, proxies /forecast/* and /health to the API
npm run lint
npm test           # Vitest + Testing Library
npm run build
```

Start the API first (`python run.py` in the backend, port 8000).

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | empty (same origin) | API origin for production builds, no trailing slash |
| `VITE_DEV_API_PROXY_TARGET` | `http://localhost:8000` | Backend used by the dev/preview proxy |

## Production checklist

- Serve `dist/` with an SPA fallback to `index.html` for client routes.
- Either set `VITE_API_BASE_URL` and add the frontend origin to the API's
  `POWERPULSE_CORS_ORIGINS`, or reverse-proxy `/forecast/*` and `/health` to the API on the same
  origin. Proxy only `/forecast/` sub-paths: `/forecast` itself is a frontend route.
- The API must listen on a reachable interface (`POWERPULSE_HOST`, default `127.0.0.1`).
