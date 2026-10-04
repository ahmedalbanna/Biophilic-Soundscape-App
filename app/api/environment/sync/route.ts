import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_CITIES, calculatePrayerStatus, calculateWeatherAcousticAdaptation } from '@/lib/weather-prayer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('city') || 'riyadh';

  const city = SUPPORTED_CITIES.find((c) => c.id === cityId) || SUPPORTED_CITIES[0];
  const prayer = calculatePrayerStatus(city);
  const weather = calculateWeatherAcousticAdaptation(
    city.defaultWeather.condition,
    city.defaultWeather.tempC,
    city.defaultWeather.humidity,
    city.defaultWeather.windKmh
  );

  return NextResponse.json({
    city: {
      id: city.id,
      nameAr: city.nameAr,
      nameEn: city.nameEn,
      country: city.countryAr,
    },
    prayer: {
      activePrayer: prayer.activePrayerNameAr,
      nextPrayer: prayer.nextPrayerNameAr,
      nextPrayerTime: prayer.nextPrayerTimeStr,
      minutesToNextPrayer: prayer.minutesToNextPrayer,
      isInAdhanSilenceWindow: prayer.isInAdhanSilenceWindow,
      times: prayer.prayerTimes,
    },
    weather: {
      condition: weather.condition,
      conditionAr: weather.conditionAr,
      tempC: weather.tempC,
      humidity: weather.humidity,
      windKmh: weather.windKmh,
      layerAdjustments: weather.layerAdjustments,
      acousticEffectAr: weather.acousticEffectAr,
    },
  });
}
