import hmac
import os
from datetime import timedelta, timezone as datetime_timezone

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Alert, Forecast, Reading
from .serializers import DeviceReadingSerializer


SENSOR_FIELDS = ('temperature_c', 'humidity_pct', 'wind_speed_ms', 'rainfall_mm', 'pressure_hpa')


def iso_utc(value):
    if timezone.is_naive(value):
        value = timezone.make_aware(value, datetime_timezone.utc)
    return value.astimezone(datetime_timezone.utc).isoformat().replace('+00:00', 'Z')


def reading_data(reading, include_id=False):
    result = {'recorded_at': iso_utc(reading.recorded_at)}
    result.update({field: getattr(reading, field) for field in SENSOR_FIELDS})
    if include_id:
        result['id'] = reading.pk
    return result


def positive_int(request, name, default, maximum):
    raw = request.query_params.get(name, str(default))
    try:
        value = int(raw)
    except (TypeError, ValueError):
        raise ValueError(f'{name} must be an integer.')
    if value < 1 or value > maximum:
        raise ValueError(f'{name} must be between 1 and {maximum}.')
    return value


class LatestReadingView(APIView):
    def get(self, request):
        current = Reading.objects.order_by('-recorded_at').first()
        if current is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        previous = Reading.objects.filter(recorded_at__lte=current.recorded_at - timedelta(hours=1)).order_by('-recorded_at').first()
        changes = {}
        fields = {
            'temperature_c': 'temperature_c', 'humidity_pct': 'humidity_pct',
            'wind_speed_ms': 'wind_speed_ms', 'pressure_hpa': 'pressure_hpa',
        }
        for api_field, model_field in fields.items():
            now_value = getattr(current, model_field)
            old_value = getattr(previous, model_field) if previous else None
            changes[api_field] = now_value - old_value if now_value is not None and old_value is not None else None
        data = reading_data(current)
        data.update({'change_1h': changes, 'source': current.source})
        return Response(data)


class LatestForecastView(APIView):
    def get(self, request):
        forecast = Forecast.objects.order_by('-generated_at').first()
        if forecast is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({
            'generated_at': iso_utc(forecast.generated_at),
            'model': {'name': forecast.model_name, 'accuracy_pct': forecast.accuracy_pct, 'variant': forecast.variant},
            'horizons': forecast.horizons,
            'advisory': forecast.advisory,
            'condition': ({'title': forecast.condition_title, 'note': forecast.condition_note}
                          if forecast.condition_title is not None else None),
        })


class ReadingSeriesView(APIView):
    def get(self, request):
        range_name = request.query_params.get('range', '24h')
        durations = {'24h': timedelta(hours=24), '7d': timedelta(days=7), '30d': timedelta(days=30)}
        if range_name not in durations:
            return Response({'range': ['Must be one of 24h, 7d, 30d.']}, status=status.HTTP_400_BAD_REQUEST)
        readings = list(Reading.objects.filter(recorded_at__gte=timezone.now() - durations[range_name]).order_by('recorded_at'))
        if not readings:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if len(readings) > 60:
            last_index = len(readings) - 1
            indices = sorted({round(i * last_index / 59) for i in range(60)})
            readings = [readings[i] for i in indices]
        return Response({'points': [reading_data(row) for row in readings]})


class ReadingHistoryView(APIView):
    def get(self, request):
        try:
            days = positive_int(request, 'days', 7, 365)
            limit = positive_int(request, 'limit', 50, 500)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        readings = Reading.objects.filter(recorded_at__gte=timezone.now() - timedelta(days=days)).order_by('-recorded_at')[:limit]
        rows = [reading_data(row, include_id=True) for row in readings]
        if not rows:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(rows)


class AlertListView(APIView):
    def get(self, request):
        try:
            limit = positive_int(request, 'limit', 20, 500)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        rows = list(Alert.objects.order_by('-created_at')[:limit])
        if not rows:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response([{
            'id': row.pk, 'created_at': iso_utc(row.created_at), 'title': row.title, 'detail': row.detail,
        } for row in rows])


class DeviceIngestView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        expected = os.environ.get('DEVICE_API_KEY', '')
        supplied = request.headers.get('X-Device-Key', '')
        if not expected or not hmac.compare_digest(supplied, expected):
            return Response({'detail': 'Invalid or missing device key.'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = DeviceReadingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        values = serializer.validated_data
        if timezone.is_naive(values['recorded_at']):
            values['recorded_at'] = timezone.make_aware(values['recorded_at'], datetime_timezone.utc)
        try:
            with transaction.atomic():
                reading = Reading.objects.create(**values)
        except IntegrityError:
            reading = Reading.objects.filter(recorded_at=values['recorded_at']).first()
            return Response({'id': reading.pk, 'created': False}, status=status.HTTP_200_OK)
        return Response({'id': reading.pk, 'created': True}, status=status.HTTP_201_CREATED)
