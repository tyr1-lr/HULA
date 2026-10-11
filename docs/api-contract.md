# HULA API contract (mobile app ⇄ Django)

The app only talks to Django. It never talks to the sensor nodes directly. Everything below is what the app expects; the code that reads it is `mobile/src/api/hula.ts`.

## Rules for every endpoint

- `GET` only, JSON, no login yet.
- Timestamps: ISO 8601 in UTC, e.g. `"2026-10-11T05:40:00Z"`. The app shows them in the phone's local time.
- Numbers: send real JSON numbers. If you use a Django `DecimalField`, DRF sends strings by default (`"28.40"`). The app tolerates that, but prefer `FloatField`, or set `COERCE_DECIMAL_TO_STRING = False`.
- Units are in the field names: `_c` °C, `_pct` %, `_ms` m/s, `_mm` mm, `_hpa` hPa.
- **A sensor that did not report is `null`, never `0`.** The app shows "—". A rain gauge that reports `0.0` means it did not rain.
- Rainfall in a reading means mm since that node's previous report.
- `204 No Content` means "nothing recorded yet" (empty database). The app shows a friendly empty state.
- Any other error status shows "Something went wrong" with a Try again button.

## Endpoints

### `GET /api/readings/latest/`
The newest reading used for the dashboard (the central node combines its nodes however you decide).

```json
{
  "recorded_at": "2026-10-11T05:40:00Z",
  "temperature_c": 28.4,
  "humidity_pct": 82,
  "wind_speed_ms": 3.2,
  "rainfall_mm": 0.0,
  "pressure_hpa": 1008,
  "change_1h": { "temperature_c": 0.3, "humidity_pct": 2, "wind_speed_ms": 0.0, "pressure_hpa": -1 },
  "source": "Local sensors (Heltec V3)"
}
```
`change_1h` is current minus one hour ago; it may be missing or have null fields. If `recorded_at` is more than 30 minutes old, the app shows a "station may be offline" banner (`STALE_AFTER_MIN` in `mobile/src/config.ts`).

### `GET /api/forecast/latest/`
The newest model output for the 1, 3 and 6 hour horizons.

```json
{
  "generated_at": "2026-10-11T05:45:00Z",
  "model": { "name": "LightGBM", "accuracy_pct": 87.3, "variant": "primary" },
  "horizons": [
    { "hours": 1, "temperature_c": 29.0, "humidity_pct": 78, "wind_speed_ms": 3.5, "rainfall_mm": 0.8, "rain_chance_pct": 70 },
    { "hours": 3, "temperature_c": 28.0, "humidity_pct": 80, "wind_speed_ms": 3.4, "rainfall_mm": 1.4, "rain_chance_pct": 80 },
    { "hours": 6, "temperature_c": 27.0, "humidity_pct": 82, "wind_speed_ms": 3.1, "rainfall_mm": 0.6, "rain_chance_pct": 60 }
  ],
  "advisory": "Possible rainfall within the next 3 hours.",
  "condition": { "title": "Partly Cloudy", "note": "Good conditions for field activities." }
}
```
- `variant` is `"primary"` (local sensors + Open-Meteo) or `"fallback"` (local sensors only). The app tells the farmer which one is running.
- `accuracy_pct`, `advisory` and `condition` may be `null`; the app hides what is missing.
- Any horizon may be omitted or have null values.

### `GET /api/readings/series/?range=24h|7d|30d`
Readings for the charts, **oldest first**. A plain array or `{ "points": [...] }` are both accepted. Each point has the same fields as `latest` (without `change_1h`/`source`). Downsample on the server for long ranges (about 50 to 60 points is plenty).

### `GET /api/readings/history/?days=7&limit=50`
Rows for the History table, **newest first**. Each row is a reading plus an `id`. A plain array or DRF's paginated `{ "count", "next", "previous", "results": [...] }` are both accepted. The app does not follow `next` yet.

### `GET /api/alerts/?limit=20`
Past advisories, newest first. Same two response shapes as above.

```json
{ "id": 3, "created_at": "2026-10-11T05:20:00Z", "title": "Rain likely within 3 hours", "detail": "80% chance, about 1.4 mm expected." }
```

## Connecting a phone to Django (for later)

1. Run Django so other devices can reach it: `python manage.py runserver 0.0.0.0:8000`.
2. Add the server's address to `ALLOWED_HOSTS` in `backend/config/settings.py` (the current empty list rejects it).
3. In `mobile/.env` set `EXPO_PUBLIC_USE_MOCK=false` and `EXPO_PUBLIC_API_URL=http://<server-ip>:8000`, then restart with `npx expo start -c`. `localhost` will not work from a phone, because it points at the phone itself.
4. Offline use: the phone joins the central node's Wi-Fi and the URL becomes the Pi's address. The app currently has one fixed URL; switching between the offline and online address is a feature still to design.
5. Plain `http://` works in Expo Go. A standalone Android build blocks it unless cleartext traffic is allowed (an `expo-build-properties` setting), which matters for the offline Wi-Fi setup.
