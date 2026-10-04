// Circadian Smart Lighting (Philips Hue, Zigbee2MQTT, Home Assistant, DMX512)

export interface LightingZone {
  id: string;
  nameAr: string;
  nameEn: string;
  entityId: string;
  protocol: 'homeassistant' | 'zigbee2mqtt' | 'hue' | 'dmx';
  currentKelvin: number;
  targetKelvin: number;
  currentBrightnessPct: number;
  targetBrightnessPct: number;
  isOn: boolean;
  hexColor: string;
  shimmerMode: boolean; // subtle water caustic modulation
}

export interface CircadianLightPoint {
  hour: number;
  phaseId: string;
  phaseAr: string;
  kelvin: number; // 1800K to 6500K
  brightnessPct: number; // 0 to 100%
  melanopicLux: number; // estimate of circadian impact
  melatoninEffectAr: string;
  descriptionAr: string;
}

export const CIRCADIAN_LIGHTING_SCHEDULE: CircadianLightPoint[] = [
  {
    hour: 5.0,
    phaseId: 'fajr',
    phaseAr: 'الفجر وبزوغ الضوء',
    kelvin: 2200,
    brightnessPct: 25,
    melanopicLux: 35,
    melatoninEffectAr: 'بدء تثبيط الميلاتونين بلطف مع حماية العين من الصدمة الضوئية',
    descriptionAr: 'توهج عنبري دافئ يحاكي خيوط الفجر الأولى بالتزامن مع زقزقة البلبل',
  },
  {
    hour: 8.0,
    phaseId: 'morning',
    phaseAr: 'الصباح الباكر والشروق',
    kelvin: 3800,
    brightnessPct: 70,
    melanopicLux: 180,
    melatoninEffectAr: 'تثبيط نشط للميلاتونين ورفع هرمون الكورتيزول الطبيعي للنشاط',
    descriptionAr: 'ضوء شمسي طبيعي متوازن يدعم التركيز وبدء مهام اليوم بنشاط',
  },
  {
    hour: 12.5,
    phaseId: 'midday',
    phaseAr: 'الظهيرة وذروة النهار',
    kelvin: 6200,
    brightnessPct: 100,
    melanopicLux: 450,
    melatoninEffectAr: 'أعلى ذروة لليقظة العقلية وتثبيط كامل لأي خمول',
    descriptionAr: 'ضوء نهاري ناصع كامل الطيف (Full Spectrum) يحاكي شمس الظهيرة',
  },
  {
    hour: 16.5,
    phaseId: 'afternoon',
    phaseAr: 'العصر وتراجع التوهج',
    kelvin: 4000,
    brightnessPct: 80,
    melanopicLux: 220,
    melatoninEffectAr: 'تهدئة تدريجية للإشارات العصبية مع الحفاظ على الإنتاجية',
    descriptionAr: 'تراجع تدريجي نحو الدفء متناغم مع تدفق خرير المياه الهادئ',
  },
  {
    hour: 18.5,
    phaseId: 'sunset',
    phaseAr: 'المغرب والغسق الذهبي',
    kelvin: 2400,
    brightnessPct: 45,
    melanopicLux: 60,
    melatoninEffectAr: 'بدء إفراز هرمون النوم (الميلاتونين) الطبيعي في الدماغ',
    descriptionAr: 'درجات ذهبية دافئة تشبه ساعة الغروب وضوء الشموع المريح',
  },
  {
    hour: 22.5,
    phaseId: 'night',
    phaseAr: 'العشاء والليل العميق',
    kelvin: 1800,
    brightnessPct: 15,
    melanopicLux: 12,
    melatoninEffectAr: 'تحفيز عميق للنوم وانعدام تام للضوء الأزرق المثير للأرق',
    descriptionAr: 'توهج كهرماني فائق الدفء (Amber Glow) خالٍ من الطيف الأزرق 480nm',
  },
];

export const INITIAL_LIGHT_ZONES: LightingZone[] = [
  {
    id: 'zone_cove',
    nameAr: 'إضاءة بيت النور المخفية (Cove Strip)',
    nameEn: 'Ceiling Cove Architectural Ribbon',
    entityId: 'light.living_room_cove_ribbon',
    protocol: 'homeassistant',
    currentKelvin: 2700,
    targetKelvin: 2700,
    currentBrightnessPct: 60,
    targetBrightnessPct: 60,
    isOn: true,
    hexColor: '#ffc17a',
    shimmerMode: true,
  },
  {
    id: 'zone_majlis',
    nameAr: 'سبوتات المجلس الموجهة (Majlis Spots)',
    nameEn: 'Majlis Downlights Cluster',
    entityId: 'light.majlis_ceiling_spots',
    protocol: 'zigbee2mqtt',
    currentKelvin: 3200,
    targetKelvin: 3200,
    currentBrightnessPct: 75,
    targetBrightnessPct: 75,
    isOn: true,
    hexColor: '#ffd8a8',
    shimmerMode: false,
  },
  {
    id: 'zone_bedroom',
    nameAr: 'محيط غرفة النوم الرئيسي (Master Bed)',
    nameEn: 'Master Bedroom Perimeter',
    entityId: 'light.master_bedroom_circadian',
    protocol: 'hue',
    currentKelvin: 2200,
    targetKelvin: 2200,
    currentBrightnessPct: 30,
    targetBrightnessPct: 30,
    isOn: true,
    hexColor: '#ffa857',
    shimmerMode: false,
  },
  {
    id: 'zone_corridor',
    nameAr: 'إنارة مسار الممرات السفلية (Footlights)',
    nameEn: 'Corridor Low-Level Path Lights',
    entityId: 'light.corridor_path_footlights',
    protocol: 'dmx',
    currentKelvin: 1900,
    targetKelvin: 1900,
    currentBrightnessPct: 20,
    targetBrightnessPct: 20,
    isOn: true,
    hexColor: '#ff9233',
    shimmerMode: false,
  },
];

// Convert Kelvin color temperature (1500K - 7000K) to RGB Hex
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number; hex: string } {
  const temp = Math.max(1500, Math.min(7000, kelvin)) / 100;
  let r: number, g: number, b: number;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  const red = Math.round(r);
  const green = Math.round(g);
  const blue = Math.round(b);
  const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

  return { r: red, g: green, b: blue, hex };
}

// Calculate interpolated circadian target for current hour (0.0 to 24.0)
export function getCircadianLightTarget(hour: number): { kelvin: number; brightnessPct: number } {
  const schedule = CIRCADIAN_LIGHTING_SCHEDULE;
  if (hour <= schedule[0].hour) {
    return { kelvin: schedule[0].kelvin, brightnessPct: schedule[0].brightnessPct };
  }
  if (hour >= schedule[schedule.length - 1].hour) {
    return {
      kelvin: schedule[schedule.length - 1].kelvin,
      brightnessPct: schedule[schedule.length - 1].brightnessPct,
    };
  }

  for (let i = 0; i < schedule.length - 1; i++) {
    const p1 = schedule[i];
    const p2 = schedule[i + 1];
    if (hour >= p1.hour && hour <= p2.hour) {
      const t = (hour - p1.hour) / (p2.hour - p1.hour);
      const kelvin = Math.round(p1.kelvin + (p2.kelvin - p1.kelvin) * t);
      const brightnessPct = Math.round(p1.brightnessPct + (p2.brightnessPct - p1.brightnessPct) * t);
      return { kelvin, brightnessPct };
    }
  }

  return { kelvin: 3000, brightnessPct: 50 };
}

export function generateHomeAssistantLightingYaml(zones: LightingZone[]): string {
  const entityList = zones.map((z) => `      - ${z.entityId}`).join('\n');

  return `# Home Assistant Automation: Biophilic Circadian Sound & Light Sync
alias: "Biophilic Soundscape: Circadian Light & Audio Synchronizer"
description: "Dynamically synchronizes color temperature, brightness, and audio ducking with biophilic phases"
trigger:
  - platform: time_pattern
    minutes: "/5"
  - platform: state
    entity_id: input_boolean.biophilic_soundscape_active
    to: "on"
  - platform: state
    entity_id: sensor.biophilic_vad_speech_ducking
    to: "active"

action:
  - choose:
      # If speech detected in room, smooth gentle illumination bump for visual clarity
      - conditions:
          - condition: state
            entity_id: sensor.biophilic_vad_speech_ducking
            state: "active"
        sequence:
          - action: light.turn_on
            target:
              entity_id:
${entityList}
            data:
              transition: 1.2
              brightness_step_pct: 10

    # Normal Circadian Sun Elevation Tracking
    default:
      - action: light.turn_on
        target:
          entity_id:
${entityList}
        data:
          color_temp_kelvin: "{{ states('sensor.biophilic_target_kelvin') | int(3000) }}"
          brightness_pct: "{{ states('sensor.biophilic_target_brightness') | int(60) }}"
          transition: 4.5
mode: restart
`;
}

export function generateZigbee2MqttPayload(kelvin: number, brightnessPct: number): string {
  // Convert Kelvin to mireds: mireds = 1,000,000 / kelvin
  const mireds = Math.round(1000000 / Math.max(1500, Math.min(6500, kelvin)));
  const brightness255 = Math.round((brightnessPct / 100) * 254);

  return JSON.stringify(
    {
      state: 'ON',
      brightness: brightness255,
      color_temp: mireds,
      transition: 3.5,
    },
    null,
    2
  );
}
