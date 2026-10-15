from django.urls import path

from .views import AlertListView, DeviceIngestView, LatestForecastView, LatestReadingView, ReadingHistoryView, ReadingSeriesView

urlpatterns = [
    path('readings/latest/', LatestReadingView.as_view(), name='reading-latest'),
    path('forecast/latest/', LatestForecastView.as_view(), name='forecast-latest'),
    path('readings/series/', ReadingSeriesView.as_view(), name='reading-series'),
    path('readings/history/', ReadingHistoryView.as_view(), name='reading-history'),
    path('alerts/', AlertListView.as_view(), name='alert-list'),
    path('device/ingest/', DeviceIngestView.as_view(), name='device-ingest'),
]
