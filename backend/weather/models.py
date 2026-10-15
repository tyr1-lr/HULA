from django.db import models
from django.utils import timezone


class Reading(models.Model):
    recorded_at = models.DateTimeField(unique=True)
    temperature_c = models.FloatField(null=True, blank=True)
    humidity_pct = models.FloatField(null=True, blank=True)
    wind_speed_ms = models.FloatField(null=True, blank=True)
    rainfall_mm = models.FloatField(null=True, blank=True)
    pressure_hpa = models.FloatField(null=True, blank=True)
    source = models.CharField(max_length=120, default='Local sensors')
    is_simulated = models.BooleanField(default=False)

    class Meta:
        ordering = ('-recorded_at',)

    def __str__(self):
        return f'Reading at {self.recorded_at.isoformat()}'


class Forecast(models.Model):
    generated_at = models.DateTimeField(default=timezone.now)
    model_name = models.CharField(max_length=80, default='LightGBM')
    accuracy_pct = models.FloatField(null=True, blank=True)
    variant = models.CharField(max_length=16, choices=(('primary', 'Primary'), ('fallback', 'Fallback')), default='primary')
    horizons = models.JSONField(default=list)
    advisory = models.TextField(null=True, blank=True)
    condition_title = models.CharField(max_length=120, null=True, blank=True)
    condition_note = models.TextField(null=True, blank=True)
    is_simulated = models.BooleanField(default=False)

    class Meta:
        ordering = ('-generated_at',)


class Alert(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    title = models.CharField(max_length=180)
    detail = models.TextField(blank=True, default='')
    is_simulated = models.BooleanField(default=False)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.title
