import json
import math
import os
import random
import time
from datetime import timedelta
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from weather.models import Alert, Forecast, Reading


class Command(BaseCommand):
    help = 'Replace simulated weather data with a 30-day development dataset, or POST live simulated readings.'

    def add_arguments(self, parser):
        parser.add_argument('--live', action='store_true', help='Continuously POST simulated readings to the device ingestion endpoint.')
        parser.add_argument('--interval', type=int, default=600, help='Seconds between live readings (default: 600).')

    def handle(self, *args, **options):
        if options['interval'] < 1:
            raise CommandError('--interval must be at least 1 second.')
        if options['live']:
            self.run_live(options['interval'])
            return
        self.seed()

    def seed(self):
        Reading.objects.filter(is_simulated=True).delete()
        Forecast.objects.filter(is_simulated=True).delete()
        Alert.objects.filter(is_simulated=True).delete()
        now = timezone.now().replace(second=0, microsecond=0)
        start = now - timedelta(days=30)
        rng = random.Random(73021)
        readings = []
        step = timedelta(minutes=10)
        total = int((now - start) / step)
        rain_events = {380, 381, 382, 1440 + 2, 2880 + 1, 3300, 3301, 3302}
        for i in range(total + 1):
            recorded_at = start + i * step
            local_hour = (recorded_at.hour + recorded_at.minute / 60) % 24
            daily = math.sin((local_hour - 7) / 24 * 2 * math.pi)
            rain = round(rng.uniform(0.3, 3.8), 1) if i in rain_events else 0.0
            readings.append(Reading(
                recorded_at=recorded_at,
                temperature_c=None if i in {125, 2200, 3900} else round(28 + 3.2 * daily + rng.uniform(-0.5, 0.5), 1),
                humidity_pct=None if i in {900, 3050} else round(79 - 9 * daily + rng.uniform(-3, 3), 1),
                wind_speed_ms=None if i == 2700 else round(max(0, 2.5 + rng.uniform(-1, 1.5)), 1),
                rainfall_mm=None if i == 1850 else rain,
                pressure_hpa=None if i == 4000 else round(1008 + rng.uniform(-3, 3), 1),
                source='Simulated local sensors',
                is_simulated=True,
            ))
        Reading.objects.bulk_create(readings, batch_size=1000, ignore_conflicts=True)
        forecast = Forecast.objects.create(
            generated_at=now,
            model_name='Simulated forecast',
            accuracy_pct=None,
            variant='fallback',
            horizons=[
                {'hours': 1, 'temperature_c': 29.1, 'humidity_pct': 75, 'wind_speed_ms': 2.8, 'rainfall_mm': 0.0, 'rain_chance_pct': 10},
                {'hours': 3, 'temperature_c': 28.4, 'humidity_pct': 78, 'wind_speed_ms': 2.5, 'rainfall_mm': 0.4, 'rain_chance_pct': 35},
                {'hours': 6, 'temperature_c': 26.9, 'humidity_pct': 83, 'wind_speed_ms': 2.1, 'rainfall_mm': 1.2, 'rain_chance_pct': 60},
            ],
            advisory='Simulated advisory: rain is possible later today.',
            condition_title='Partly Cloudy',
            condition_note='Simulated conditions for development only.',
            is_simulated=True,
        )
        for hours, title, detail in (
            (1, 'Simulated rain possible within 1 hour', 'A simulated 35% chance of light rain.'),
            (8, 'Simulated rainfall later today', 'A simulated 60% chance of about 1.2 mm.'),
            (24, 'Simulated station status', 'All values in this dataset are simulated.'),
        ):
            Alert.objects.create(created_at=now - timedelta(hours=hours), title=title, detail=detail, is_simulated=True)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(readings)} simulated readings, one forecast, and three alerts.'))

    def run_live(self, interval):
        api_url = os.environ.get('HULA_API_URL', 'http://127.0.0.1:8000').rstrip('/')
        device_key = os.environ.get('DEVICE_API_KEY', '')
        if not device_key:
            raise CommandError('Set DEVICE_API_KEY before using --live.')
        self.stdout.write(f'Posting simulated readings to {api_url}/api/device/ingest/ every {interval}s; press Ctrl+C to stop.')
        while True:
            now = timezone.now()
            payload = {
                'recorded_at': now.isoformat().replace('+00:00', 'Z'),
                'temperature_c': round(28 + 3 * math.sin(now.hour / 24 * 2 * math.pi), 1),
                'humidity_pct': round(78 - 8 * math.sin(now.hour / 24 * 2 * math.pi), 1),
                'wind_speed_ms': 2.4,
                'rainfall_mm': 0.0,
                'pressure_hpa': 1008.0,
                'source': 'Simulated live device',
                'is_simulated': True,
            }
            request = Request(
                f'{api_url}/api/device/ingest/', data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json', 'X-Device-Key': device_key}, method='POST',
            )
            try:
                with urlopen(request, timeout=10) as response:
                    self.stdout.write(f'{response.status}: {response.read().decode("utf-8")}')
            except (HTTPError, URLError) as exc:
                self.stderr.write(self.style.ERROR(f'Ingestion POST failed: {exc}'))
            time.sleep(interval)
