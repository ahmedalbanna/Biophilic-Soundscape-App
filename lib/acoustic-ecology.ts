// Acoustic Ecology & Real Physical Weather Grounding Engine
// Grounding procedural biophilic soundscapes with real-time atmospheric conditions and 3D spatialization.

export interface WeatherGroundingState {
  cityId: string;
  cityNameAr: string;
  cityNameEn: string;
  latitude: number;
  longitude: number;
  windSpeedKmh: number; // 0 to 80 km/h
  windGustKmh: number;
  humidityPct: number; // 10 to 100%
  temperatureC: number;
  barometricPressureHpa: number; // 980 to 1035 hPa
  precipitationMm: number; // 0 to 40 mm/h
  solarElevationDeg: number; // -90 (midnight) to +90 (zenith)
  weatherConditionAr: string;
  isAutoGroundingActive: boolean;
  lastSyncedAt: string;
}

export interface Spatial3DSource {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'bird' | 'water' | 'breeze' | 'cricket';
  x: number; // -1.0 (Left) to +1.0 (Right)
  y: number; // -1.0 (Rear) to +1.0 (Front)
  z: number; // 0.0 (Floor) to 1.0 (Ceiling)
  isOrbiting: boolean;
  orbitSpeed: number; // rad/s
  orbitRadius: number;
  currentAngle: number;
  color: string;
}

export interface InCeilingSpeakerPod {
  id: string;
  labelAr: string;
  channel: 'FL' | 'FR' | 'RL' | 'RR' | 'SUB' | 'C';
  x: number;
  y: number;
  z: number; // usually 1.0 (Ceiling)
  activeDbfs: number; // current signal level
}

export const SAUDI_ECOLOGICAL_STATIONS: WeatherGroundingState[] = [
  {
    cityId: 'abha_asir',
    cityNameAr: 'أبها وسودة عسير (Abha & Soudah)',
    cityNameEn: 'Asir Highlands (2,800m elevation)',
    latitude: 18.2164,
    longitude: 42.5053,
    windSpeedKmh: 24,
    windGustKmh: 38,
    humidityPct: 78,
    temperatureC: 19,
    barometricPressureHpa: 1018,
    precipitationMm: 2.4, // Light mountain mist/rain
    solarElevationDeg: 28,
    weatherConditionAr: 'ضباب جبلي ممطر ورياح عليلة باردة',
    isAutoGroundingActive: true,
    lastSyncedAt: 'مباشر (محطة السودة)',
  },
  {
    cityId: 'riyadh_hanifah',
    cityNameAr: 'الرياض ووادي حنيفة (Riyadh & Hanifah)',
    cityNameEn: 'Najd Plateau & Valley Oasis',
    latitude: 24.7136,
    longitude: 46.6753,
    windSpeedKmh: 14,
    windGustKmh: 20,
    humidityPct: 24,
    temperatureC: 32,
    barometricPressureHpa: 1012,
    precipitationMm: 0.0,
    solarElevationDeg: 45,
    weatherConditionAr: 'أجواء ربيعية جافة مع حفيف نخيل هادئ',
    isAutoGroundingActive: false,
    lastSyncedAt: 'مباشر',
  },
  {
    cityId: 'al_ahsa_oasis',
    cityNameAr: 'واحة الأحساء وجبل القارة (Al-Ahsa)',
    cityNameEn: 'Al-Ahsa Natural Springs Basin',
    latitude: 25.3833,
    longitude: 49.5833,
    windSpeedKmh: 10,
    windGustKmh: 15,
    humidityPct: 45,
    temperatureC: 30,
    barometricPressureHpa: 1014,
    precipitationMm: 0.0,
    solarElevationDeg: 52,
    weatherConditionAr: 'نسيم واحة رطب وتدفق قنوات مائية دافئة',
    isAutoGroundingActive: false,
    lastSyncedAt: 'مباشر',
  },
  {
    cityId: 'farasan_islands',
    cityNameAr: 'محمية جزر فرسان (Farasan Islands)',
    cityNameEn: 'Red Sea Marine Biome',
    latitude: 16.7033,
    longitude: 42.1189,
    windSpeedKmh: 28,
    windGustKmh: 36,
    humidityPct: 82,
    temperatureC: 28,
    barometricPressureHpa: 1010,
    precipitationMm: 0.0,
    solarElevationDeg: 35,
    weatherConditionAr: 'رياح بحرية غربية نشطة وأمواج فيروزية متهادية',
    isAutoGroundingActive: false,
    lastSyncedAt: 'مباشر',
  },
  {
    cityId: 'taif_shafa',
    cityNameAr: 'الطائف والشفا ومزارع الورد (Taif)',
    cityNameEn: 'Taif Mountain Valley',
    latitude: 21.2854,
    longitude: 40.4244,
    windSpeedKmh: 18,
    windGustKmh: 28,
    humidityPct: 62,
    temperatureC: 22,
    barometricPressureHpa: 1016,
    precipitationMm: 0.8,
    solarElevationDeg: 40,
    weatherConditionAr: 'رذاذ خفيف مع نسيم عطري عليل',
    isAutoGroundingActive: false,
    lastSyncedAt: 'مباشر',
  },
];

export const INITIAL_3D_SOURCES: Spatial3DSource[] = [
  {
    id: 'src_swallow',
    nameAr: 'سنونو جبلي محلق (Mountain Swallow)',
    nameEn: 'Circling Migratory Swift',
    type: 'bird',
    x: 0.6,
    y: 0.4,
    z: 0.95, // Near ceiling
    isOrbiting: true,
    orbitSpeed: 0.45,
    orbitRadius: 0.65,
    currentAngle: 0,
    color: '#34d399',
  },
  {
    id: 'src_canopy_breeze',
    nameAr: 'نسيم قمة الأشجار (Canopy Breeze)',
    nameEn: 'High Foliage Wind Swell',
    type: 'breeze',
    x: 0.0,
    y: 0.7,
    z: 0.85,
    isOrbiting: false,
    orbitSpeed: 0.1,
    orbitRadius: 0.3,
    currentAngle: Math.PI / 4,
    color: '#38bdf8',
  },
  {
    id: 'src_brook',
    nameAr: 'جدول ماء حجري أرضي (Rocky Brook)',
    nameEn: 'Floor Level Running Stream',
    type: 'water',
    x: -0.5,
    y: -0.3,
    z: 0.1, // Ground level
    isOrbiting: false,
    orbitSpeed: 0.05,
    orbitRadius: 0.2,
    currentAngle: 0,
    color: '#60a5fa',
  },
];

export const CEILING_SPEAKER_PODS: InCeilingSpeakerPod[] = [
  { id: 'spk_fl', labelAr: 'سماعة سقفية أمامي يسار (FL Ceiling)', channel: 'FL', x: -0.7, y: 0.7, z: 1.0, activeDbfs: -14 },
  { id: 'spk_fr', labelAr: 'سماعة سقفية أمامي يمين (FR Ceiling)', channel: 'FR', x: 0.7, y: 0.7, z: 1.0, activeDbfs: -16 },
  { id: 'spk_rl', labelAr: 'سماعة سقفية خلفي يسار (RL Ceiling)', channel: 'RL', x: -0.7, y: -0.7, z: 1.0, activeDbfs: -18 },
  { id: 'spk_rr', labelAr: 'سماعة سقفية خلفي يمين (RR Ceiling)', channel: 'RR', x: 0.7, y: -0.7, z: 1.0, activeDbfs: -15 },
  { id: 'spk_sub', labelAr: 'مضخم الترددات الجهير (Subwoofer)', channel: 'SUB', x: 0.0, y: -0.9, z: 0.0, activeDbfs: -12 },
];

// Physical meteorological mapping to acoustic layer parameters
export function calculateAcousticWeatherDeltas(weather: WeatherGroundingState): {
  breezeVol: number;
  breezeLpfHz: number;
  waterVol: number;
  rainVol: number;
  rainEnabled: boolean;
  airAbsorptionDampingDb: number;
  birdActivityMultiplier: number;
} {
  // 1. Wind speed mapping: 0-60 km/h -> 0.1 to 0.95 breeze volume
  const breezeVol = Math.min(0.95, Math.max(0.15, weather.windSpeedKmh / 50));
  // Wind turbulence cut-off: 400Hz (gentle draft) to 3200Hz (strong gust)
  const breezeLpfHz = Math.round(400 + Math.min(2800, weather.windGustKmh * 65));

  // 2. Humidity effect: higher humidity (>70%) increases atmospheric air absorption of high frequencies
  const airAbsorptionDampingDb = weather.humidityPct > 60 ? -((weather.humidityPct - 60) * 0.08) : 0;

  // 3. Rain mapping: precipitation mm/h -> rain layer volume
  const rainEnabled = weather.precipitationMm > 0.1;
  const rainVol = rainEnabled ? Math.min(0.85, 0.25 + weather.precipitationMm * 0.12) : 0.0;

  // 4. Water stream volume: adjusted for humidity & baseline
  const waterVol = 0.45 + (weather.humidityPct > 70 ? 0.15 : 0.05);

  // 5. Bird activity depends on solar elevation (zenith vs dawn vs night)
  let birdActivityMultiplier = 1.0;
  if (weather.solarElevationDeg < -6) {
    // Night
    birdActivityMultiplier = 0.15; // only solitary night birds
  } else if (weather.solarElevationDeg >= -6 && weather.solarElevationDeg <= 20) {
    // Dawn chorus peak
    birdActivityMultiplier = 1.8;
  } else if (weather.solarElevationDeg > 20 && weather.solarElevationDeg <= 60) {
    // Daytime
    birdActivityMultiplier = 1.0;
  } else {
    // High midday heat
    birdActivityMultiplier = 0.6;
  }

  return {
    breezeVol,
    breezeLpfHz,
    waterVol,
    rainVol,
    rainEnabled,
    airAbsorptionDampingDb,
    birdActivityMultiplier,
  };
}

// Generate Home Assistant Live Weather Sync YAML Automation
export function generateHaWeatherSyncYaml(): string {
  return `# Home Assistant Automation: Ground Biophilic Soundscape with Live Weather Station
alias: "Biophilic Soundscape: Real-Time Weather Grounding Sync"
description: "Pushes wind speed, outdoor rain, and solar elevation to Biophilic Audio Engine"
trigger:
  - platform: state
    entity_id: weather.home
  - platform: numeric_state
    entity_id: sensor.outdoor_wind_speed
    above: 15
  - platform: numeric_state
    entity_id: sensor.outdoor_rain_rate
    above: 0.2

action:
  - action: mqtt.publish
    data:
      topic: "biophilic/weather/live_update"
      payload: >-
        {
          "wind_speed_kmh": {{ states('sensor.outdoor_wind_speed') | float(12.0) }},
          "wind_gust_kmh": {{ states('sensor.outdoor_wind_gust') | float(18.0) }},
          "humidity_pct": {{ states('sensor.outdoor_humidity') | float(55.0) }},
          "precipitation_mm": {{ states('sensor.outdoor_rain_rate') | float(0.0) }},
          "temperature_c": {{ state_attr('weather.home', 'temperature') | float(26.0) }},
          "solar_elevation_deg": {{ state_attr('sun.sun', 'elevation') | float(30.0) }}
        }
mode: restart
`;
}
