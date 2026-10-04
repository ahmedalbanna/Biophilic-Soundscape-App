// Weather Adaptation & Prayer Times Adhan Silence Protection Engine

export interface CityLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  lat: number;
  lng: number;
  timezoneOffsetHours: number;
  defaultWeather: {
    tempC: number;
    humidity: number;
    windKmh: number;
    condition: 'clear_mild' | 'hot_desert' | 'rainy' | 'windy' | 'overcast';
    conditionAr: string;
  };
  samplePrayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

export const SUPPORTED_CITIES: CityLocation[] = [
  {
    id: 'riyadh',
    nameAr: 'الرياض',
    nameEn: 'Riyadh',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Saudi Arabia',
    lat: 24.7136,
    lng: 46.6753,
    timezoneOffsetHours: 3,
    defaultWeather: {
      tempC: 32,
      humidity: 22,
      windKmh: 14,
      condition: 'hot_desert',
      conditionAr: 'صحراوي جاف ومشمس',
    },
    samplePrayerTimes: {
      fajr: '04:45',
      dhuhr: '11:58',
      asr: '15:24',
      maghrib: '17:52',
      isha: '19:22',
    },
  },
  {
    id: 'makkah',
    nameAr: 'مكة المكرمة',
    nameEn: 'Makkah',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Saudi Arabia',
    lat: 21.3891,
    lng: 39.8579,
    timezoneOffsetHours: 3,
    defaultWeather: {
      tempC: 34,
      humidity: 35,
      windKmh: 12,
      condition: 'clear_mild',
      conditionAr: 'أجواء دافئة صافية',
    },
    samplePrayerTimes: {
      fajr: '05:01',
      dhuhr: '12:15',
      asr: '15:38',
      maghrib: '18:10',
      isha: '19:40',
    },
  },
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    countryAr: 'مصر',
    countryEn: 'Egypt',
    lat: 30.0444,
    lng: 31.2357,
    timezoneOffsetHours: 2,
    defaultWeather: {
      tempC: 26,
      humidity: 50,
      windKmh: 18,
      condition: 'clear_mild',
      conditionAr: 'معتدل ومستقر',
    },
    samplePrayerTimes: {
      fajr: '04:32',
      dhuhr: '11:52',
      asr: '15:18',
      maghrib: '17:46',
      isha: '19:04',
    },
  },
  {
    id: 'dubai',
    nameAr: 'دبي',
    nameEn: 'Dubai',
    countryAr: 'الإمارات العربية المتحدة',
    countryEn: 'United Arab Emirates',
    lat: 25.2048,
    lng: 55.2708,
    timezoneOffsetHours: 4,
    defaultWeather: {
      tempC: 31,
      humidity: 58,
      windKmh: 15,
      condition: 'hot_desert',
      conditionAr: 'ساحلي دافئ ومشمس',
    },
    samplePrayerTimes: {
      fajr: '05:03',
      dhuhr: '12:21',
      asr: '15:44',
      maghrib: '18:15',
      isha: '19:30',
    },
  },
  {
    id: 'casablanca',
    nameAr: 'الدار البيضاء',
    nameEn: 'Casablanca',
    countryAr: 'المغرب',
    countryEn: 'Morocco',
    lat: 33.5731,
    lng: -7.5898,
    timezoneOffsetHours: 1,
    defaultWeather: {
      tempC: 21,
      humidity: 72,
      windKmh: 24,
      condition: 'rainy',
      conditionAr: 'رذاذ بحري وممطر خفيف',
    },
    samplePrayerTimes: {
      fajr: '05:42',
      dhuhr: '13:08',
      asr: '16:32',
      maghrib: '19:02',
      isha: '20:20',
    },
  },
  {
    id: 'london',
    nameAr: 'لندن',
    nameEn: 'London',
    countryAr: 'المملكة المتحدة',
    countryEn: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    timezoneOffsetHours: 0,
    defaultWeather: {
      tempC: 15,
      humidity: 82,
      windKmh: 28,
      condition: 'rainy',
      conditionAr: 'ممطر وضبابي معتدل',
    },
    samplePrayerTimes: {
      fajr: '05:12',
      dhuhr: '12:54',
      asr: '15:58',
      maghrib: '18:35',
      isha: '20:10',
    },
  },
];

export interface PrayerStatus {
  isInAdhanSilenceWindow: boolean;
  activePrayerNameAr: string | null;
  nextPrayerNameAr: string;
  nextPrayerTimeStr: string;
  minutesToNextPrayer: number;
  silenceSecondsRemaining: number;
  prayerTimes: { [name: string]: string };
}

export function calculatePrayerStatus(city: CityLocation, customTime?: Date): PrayerStatus {
  const now = customTime || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayers = [
    { key: 'fajr', nameAr: 'صلاة الفجر', time: city.samplePrayerTimes.fajr },
    { key: 'dhuhr', nameAr: 'صلاة الظهر', time: city.samplePrayerTimes.dhuhr },
    { key: 'asr', nameAr: 'صلاة العصر', time: city.samplePrayerTimes.asr },
    { key: 'maghrib', nameAr: 'صلاة المغرب', time: city.samplePrayerTimes.maghrib },
    { key: 'isha', nameAr: 'صلاة العشاء', time: city.samplePrayerTimes.isha },
  ];

  let isInSilence = false;
  let activePrayer: string | null = null;
  let silenceSecRemaining = 0;
  let nextPrayer = prayers[0];
  let minDiff = Infinity;

  for (const p of prayers) {
    const [h, m] = p.time.split(':').map(Number);
    const pMinutes = h * 60 + m;

    // Silence window: 2 minutes before until 15 minutes after adhan
    if (currentMinutes >= pMinutes - 2 && currentMinutes <= pMinutes + 15) {
      isInSilence = true;
      activePrayer = p.nameAr;
      silenceSecRemaining = Math.max(0, Math.round((pMinutes + 15 - currentMinutes) * 60));
    }

    let diff = pMinutes - currentMinutes;
    if (diff < 0) diff += 24 * 60; // next day wrap

    if (diff < minDiff) {
      minDiff = diff;
      nextPrayer = p;
    }
  }

  return {
    isInAdhanSilenceWindow: isInSilence,
    activePrayerNameAr: activePrayer,
    nextPrayerNameAr: nextPrayer.nameAr,
    nextPrayerTimeStr: nextPrayer.time,
    minutesToNextPrayer: Math.round(minDiff),
    silenceSecondsRemaining: silenceSecRemaining,
    prayerTimes: city.samplePrayerTimes,
  };
}

export interface WeatherAdaptationResult {
  condition: string;
  conditionAr: string;
  tempC: number;
  humidity: number;
  windKmh: number;
  acousticEffectAr: string;
  acousticEffectEn: string;
  layerAdjustments: {
    water: number;
    breeze: number;
    rain: number;
    ocean: number;
  };
}

export function calculateWeatherAcousticAdaptation(
  condition: 'clear_mild' | 'hot_desert' | 'rainy' | 'windy' | 'overcast',
  tempC: number,
  humidity: number,
  windKmh: number
): WeatherAdaptationResult {
  switch (condition) {
    case 'hot_desert':
      return {
        condition,
        conditionAr: 'صحراوي حار وجاف',
        tempC,
        humidity,
        windKmh,
        acousticEffectAr:
          'التبريد الحسي البيوفيلي (Psychological Acoustic Cooling): تكثيف خرير المياه الباردة والنسيم الجبلي للإيحاء العصبي بالانتعاش وخفض الإحساس بالحرارة.',
        acousticEffectEn:
          'Biophilic sensory cooling: Enhancing cold mountain stream and brisk breeze to psychophysiologically lower thermal discomfort.',
        layerAdjustments: {
          water: 0.85,
          breeze: 0.6,
          rain: 0.0,
          ocean: 0.35,
        },
      };

    case 'rainy':
      return {
        condition,
        conditionAr: 'طقس ممطر ورطب',
        tempC,
        humidity,
        windKmh,
        acousticEffectAr:
          'المزامنة المطرية وعزل النوافذ: دمج رذاذ المطر الداخلي بتدرج متوازن مع زخات المطر الخارجية لتحقيق تناغم بيئي كامل يمنع الصدمة السمعية.',
        acousticEffectEn:
          'Rainfall harmonic synchronization: Harmonizing internal droplet masking with exterior precipitation on glass.',
        layerAdjustments: {
          water: 0.6,
          breeze: 0.45,
          rain: 0.65,
          ocean: 0.1,
        },
      };

    case 'windy':
      return {
        condition,
        conditionAr: 'رياح نشطة وعواصف خفيفة',
        tempC,
        humidity,
        windKmh,
        acousticEffectAr:
          'حجب الاضطراب الجوي المنخفض (Turbulence Masking): رفع حفيف أوراق الأشجار لامتصاص ترددات اهتزاز الأبواب والنوافذ الخارجية.',
        acousticEffectEn:
          'Turbulence absorption: Elevating canopy leaf rustle to mask exterior building rumble and window turbulence.',
        layerAdjustments: {
          water: 0.55,
          breeze: 0.85,
          rain: 0.15,
          ocean: 0.4,
        },
      };

    case 'overcast':
      return {
        condition,
        conditionAr: 'غائم وساكن',
        tempC,
        humidity,
        windKmh,
        acousticEffectAr:
          'السكينة التأملية: رفع أمواج البحر البطيئة مع تدفق مائي هادئ يتناسب مع الضوء الخافت في الغيوم.',
        acousticEffectEn:
          'Overcast meditative calm: Tidal waves paced for introspection and lower sympathetic arousal.',
        layerAdjustments: {
          water: 0.65,
          breeze: 0.4,
          rain: 0.2,
          ocean: 0.7,
        },
      };

    case 'clear_mild':
    default:
      return {
        condition: 'clear_mild',
        conditionAr: 'ربيعي معتدل وصافٍ',
        tempC,
        humidity,
        windKmh,
        acousticEffectAr:
          'النقاء الحيوي الكامل: أعلى درجات نقاء زقزقة الطيور وخرير المياه مع نسيم خفيف يحاكي بيئة المروج الطبيعية.',
        acousticEffectEn:
          'Full biophilic vitality: Crisp songbirds and bubbling stream echoing an open meadow atmosphere.',
        layerAdjustments: {
          water: 0.75,
          breeze: 0.5,
          rain: 0.0,
          ocean: 0.2,
        },
      };
  }
}
