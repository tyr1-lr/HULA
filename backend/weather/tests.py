import json
import os
from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Alert, Forecast, Reading


class WeatherApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now().replace(microsecond=0)

    def make_reading(self, at, **kwargs):
        defaults = {
            'temperature_c': 28.5, 'humidity_pct': 80.0, 'wind_speed_ms': 3.0,
            'rainfall_mm': 0.0, 'pressure_hpa': 1008.0, 'source': 'Test sensor',
        }
        defaults.update(kwargs)
        return Reading.objects.create(recorded_at=at, **defaults)

    def test_latest_shape_utc_and_sensor_nulls(self):
        self.make_reading(self.now - timedelta(hours=2), temperature_c=27.0)
        self.make_reading(self.now, temperature_c=29.0, humidity_pct=None, wind_speed_ms=None, pressure_hpa=None)
        response = self.client.get('/api/readings/latest/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.data), {
            'recorded_at', 'temperature_c', 'humidity_pct', 'wind_speed_ms', 'rainfall_mm',
            'pressure_hpa', 'change_1h', 'source',
        })
        self.assertTrue(response.data['recorded_at'].endswith('Z'))
        self.assertEqual(response.data['temperature_c'], 29.0)
        self.assertIsNone(response.data['humidity_pct'])
        self.assertEqual(response.data['change_1h']['temperature_c'], 2.0)
        self.assertIsNone(response.data['change_1h']['humidity_pct'])

    def test_forecast_shape_and_null_optional_fields(self):
        Forecast.objects.create(generated_at=self.now, model_name='Stub', accuracy_pct=None, variant='fallback',
                                horizons=[{'hours': 1, 'temperature_c': None}], advisory=None,
                                condition_title=None, condition_note=None)
        response = self.client.get('/api/forecast/latest/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['model'], {'name': 'Stub', 'accuracy_pct': None, 'variant': 'fallback'})
        self.assertEqual(response.data['horizons'], [{'hours': 1, 'temperature_c': None}])
        self.assertIsNone(response.data['advisory'])
        self.assertIsNone(response.data['condition'])
        self.assertTrue(response.data['generated_at'].endswith('Z'))

    def test_series_range_validation_order_and_downsampling(self):
        old = self.make_reading(self.now - timedelta(days=31))
        recent = [self.make_reading(self.now - timedelta(hours=23) + timedelta(minutes=i), temperature_c=float(i)) for i in range(65)]
        response = self.client.get('/api/readings/series/', {'range': '24h'})
        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(response.data['points']), 60)
        self.assertLessEqual(response.data['points'][0]['recorded_at'], response.data['points'][-1]['recorded_at'])
        self.assertNotIn(old.recorded_at.isoformat(), [p['recorded_at'] for p in response.data['points']])
        self.assertEqual(self.client.get('/api/readings/series/', {'range': 'bad'}).status_code, 400)
        self.assertEqual(self.client.get('/api/readings/series/', {'range': '30d'}).status_code, 200)

    def test_history_days_limit_and_newest_first(self):
        first = self.make_reading(self.now - timedelta(days=2))
        second = self.make_reading(self.now - timedelta(hours=1))
        self.make_reading(self.now - timedelta(days=10))
        response = self.client.get('/api/readings/history/', {'days': 7, 'limit': 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], second.pk)
        self.assertGreater(second.recorded_at, first.recorded_at)
        self.assertEqual(self.client.get('/api/readings/history/', {'days': 'nope'}).status_code, 400)

    def test_alert_order_and_limit(self):
        Alert.objects.create(created_at=self.now - timedelta(hours=1), title='old')
        newer = Alert.objects.create(created_at=self.now, title='new')
        response = self.client.get('/api/alerts/', {'limit': 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], newer.pk)

    def test_empty_endpoints_return_204(self):
        for path in ('/api/readings/latest/', '/api/forecast/latest/', '/api/readings/series/',
                     '/api/readings/history/', '/api/alerts/'):
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 204)

    @patch.dict(os.environ, {'DEVICE_API_KEY': 'test-device-key'})
    def test_ingest_auth_validation_and_duplicate(self):
        payload = {
            'recorded_at': self.now.isoformat().replace('+00:00', 'Z'),
            'temperature_c': 25.5, 'humidity_pct': None, 'wind_speed_ms': 1.2,
            'rainfall_mm': 0.0, 'pressure_hpa': 1010.0, 'source': 'Central node',
        }
        unauthenticated = self.client.post('/api/device/ingest/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(unauthenticated.status_code, 401)
        headers = {'HTTP_X_DEVICE_KEY': 'test-device-key'}
        invalid = self.client.post('/api/device/ingest/', data=json.dumps({'recorded_at': 'bad'}), content_type='application/json', **headers)
        self.assertEqual(invalid.status_code, 400)
        created = self.client.post('/api/device/ingest/', data=json.dumps(payload), content_type='application/json', **headers)
        self.assertEqual(created.status_code, 201)
        self.assertTrue(created.data['created'])
        self.assertFalse(Reading.objects.get().is_simulated)
        duplicate = self.client.post('/api/device/ingest/', data=json.dumps(payload), content_type='application/json', **headers)
        self.assertEqual(duplicate.status_code, 200)
        self.assertFalse(duplicate.data['created'])
        self.assertEqual(Reading.objects.count(), 1)
