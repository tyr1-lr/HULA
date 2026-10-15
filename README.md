# HULA

Hybrid LoRa-Wi-Fi Mesh Weather Monitoring System with Machine Learning-Based Short-Term Weather Forecasting for Rice Production Management.

## Project Structure

- backend/ - Django REST API
- mobile/ - React Native Expo application
- hardware/ - Hardware designs and documentation
- ml/ - Machine learning development
- docs/ - Thesis and project documentation

## Backend development

From `backend/`, create and activate a Python virtual environment, then install the pinned dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set its values in your shell or environment manager (Django does not load `.env` files automatically). At minimum set a private `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` to include the computer's LAN IP, and `DEVICE_API_KEY` for ingestion. Then run:

```powershell
python manage.py migrate
python manage.py seed_sim
python manage.py runserver 0.0.0.0:8000
```

`seed_sim` replaces existing simulated rows with a 30-day development dataset. To continuously POST simulated readings to a running server, set `HULA_API_URL` if needed and run `python manage.py seed_sim --live --interval 600` with `DEVICE_API_KEY` set. For the mobile app, copy `mobile/.env.example` to `mobile/.env`, set `EXPO_PUBLIC_USE_MOCK=false` and `EXPO_PUBLIC_API_URL=http://<computer-lan-ip>:8000`, then restart Expo with `npx expo start -c`. Use the server's LAN address rather than `localhost` on a phone.
