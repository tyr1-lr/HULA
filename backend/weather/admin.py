from django.contrib import admin

from .models import Alert, Forecast, Reading


@admin.register(Reading)
class ReadingAdmin(admin.ModelAdmin):
    list_display = ('recorded_at', 'temperature_c', 'humidity_pct', 'source', 'is_simulated')
    list_filter = ('is_simulated', 'source')
    ordering = ('-recorded_at',)


@admin.register(Forecast)
class ForecastAdmin(admin.ModelAdmin):
    list_display = ('generated_at', 'model_name', 'variant', 'is_simulated')
    list_filter = ('variant', 'is_simulated')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'title', 'is_simulated')
    list_filter = ('is_simulated',)
