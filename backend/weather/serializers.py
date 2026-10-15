from rest_framework import serializers

from .models import Reading


class DeviceReadingSerializer(serializers.Serializer):
    recorded_at = serializers.DateTimeField()
    temperature_c = serializers.FloatField(required=False, allow_null=True)
    humidity_pct = serializers.FloatField(required=False, allow_null=True)
    wind_speed_ms = serializers.FloatField(required=False, allow_null=True)
    rainfall_mm = serializers.FloatField(required=False, allow_null=True)
    pressure_hpa = serializers.FloatField(required=False, allow_null=True)
    source = serializers.CharField(required=False, max_length=120, default='Local sensors')
    is_simulated = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        known = set(self.fields)
        unknown = set(self.initial_data) - known
        if unknown:
            raise serializers.ValidationError({key: ['Unknown field.'] for key in sorted(unknown)})
        return attrs


class ReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = ('id', 'recorded_at', 'temperature_c', 'humidity_pct', 'wind_speed_ms', 'rainfall_mm', 'pressure_hpa', 'source')
