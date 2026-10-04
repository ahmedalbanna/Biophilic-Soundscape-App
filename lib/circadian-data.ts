// Circadian Cycle & Contextual Social Presets for Biophilic Soundscape

export interface CircadianPhase {
  id: string;
  nameAr: string;
  nameEn: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  descriptionAr: string;
  descriptionEn: string;
  biologicalGoalAr: string;
  biologicalGoalEn: string;
  layerPresets: {
    water: number; // 0 to 1
    breeze: number;
    rain: number;
    ocean: number;
  };
  stochasticDensity: {
    birds: number;
    leaves: number;
    crickets: number;
    chimes: number;
  };
  colorTheme: string;
}

export interface SocialPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  iconName: string;
  descriptionAr: string;
  descriptionEn: string;
  duckingSensitivityOffset: number; // in dB
  masterVolumeTarget: number;
  layerPresets: {
    water: number;
    breeze: number;
    rain: number;
    ocean: number;
  };
}

export const CIRCADIAN_PHASES: CircadianPhase[] = [
  {
    id: 'dawn',
    nameAr: 'الفجر والشروق',
    nameEn: 'Dawn & Early Awakening',
    timeRange: '05:00 - 08:30',
    startHour: 5,
    endHour: 8.5,
    descriptionAr: 'تراكب حيوي ناعم يحاكي بزوغ الضوء وتنشيط الدورة الدموية بنسيم بارد وزقزقة طيور متباعدة.',
    descriptionEn: 'Gentle biophilic awakening stimulating natural cortisol rhythm with brisk breeze and early birdsong.',
    biologicalGoalAr: 'تحفيز الاستيقاظ الطبيعي وتصفية الذهن',
    biologicalGoalEn: 'Promote gentle circadian awakening & cortisol peak',
    layerPresets: {
      water: 0.65,
      breeze: 0.55,
      rain: 0.0,
      ocean: 0.2,
    },
    stochasticDensity: {
      birds: 0.85,
      leaves: 0.6,
      crickets: 0.05,
      chimes: 0.35,
    },
    colorTheme: 'from-amber-500/20 to-emerald-500/20',
  },
  {
    id: 'midday',
    nameAr: 'الظهيرة والتركيز العميق',
    nameEn: 'Midday Focus & Productivity',
    timeRange: '08:30 - 16:30',
    startHour: 8.5,
    endHour: 16.5,
    descriptionAr: 'تدفق مائي متسق وقناع صوتي عازل يقلل من ضوضاء المدينة الخارجية ويعزز التفكير المستمر.',
    descriptionEn: 'Consistent babbling brook acoustics masking external urban distractions to sustain deep focus.',
    biologicalGoalAr: 'حجب التشتت البصري والسمعي وزيادة الأداء المعرفي',
    biologicalGoalEn: 'Acoustic masking of distractions for cognitive flow',
    layerPresets: {
      water: 0.85,
      breeze: 0.45,
      rain: 0.15,
      ocean: 0.0,
    },
    stochasticDensity: {
      birds: 0.3,
      leaves: 0.7,
      crickets: 0.0,
      chimes: 0.1,
    },
    colorTheme: 'from-sky-500/20 to-emerald-600/20',
  },
  {
    id: 'afternoon',
    nameAr: 'العصر والشفق الذهبي',
    nameEn: 'Golden Hour & Wind-Down',
    timeRange: '16:30 - 19:30',
    startHour: 16.5,
    endHour: 19.5,
    descriptionAr: 'انتقال دافئ يخفف وتيرة العمل ويدمج أمواج شاطئية إيقاعية مع نسيم الغابة لتهدئة الجهاز العصبي.',
    descriptionEn: 'Warm harmonic transition blending rhythmic ocean swells with mild breeze to unwind the nervous system.',
    biologicalGoalAr: 'تخفيض وتيرة الإثارة العصبية بعد يوم العمل',
    biologicalGoalEn: 'Autonomic nervous system recalibration post-work',
    layerPresets: {
      water: 0.5,
      breeze: 0.65,
      rain: 0.0,
      ocean: 0.6,
    },
    stochasticDensity: {
      birds: 0.45,
      leaves: 0.5,
      crickets: 0.25,
      chimes: 0.4,
    },
    colorTheme: 'from-orange-500/20 to-amber-600/20',
  },
  {
    id: 'evening',
    nameAr: 'المساء والسكينة الأسرية',
    nameEn: 'Evening Gathering & Serenity',
    timeRange: '19:30 - 23:00',
    startHour: 19.5,
    endHour: 23,
    descriptionAr: 'أصوات دافئة تجمع بين صرار الليل الهادئ، حفيف الأوراق وأجراس خافتة تمنح المكان طابعاً هادئاً.',
    descriptionEn: 'Warm nocturnal landscape featuring low cicadas, leafy whispers and resonant bell decays.',
    biologicalGoalAr: 'تحفيز إفراز الميلاتونين وتسهيل التفاعل الأسري الهادئ',
    biologicalGoalEn: 'Melatonin priming and calm conversational ambience',
    layerPresets: {
      water: 0.4,
      breeze: 0.5,
      rain: 0.0,
      ocean: 0.35,
    },
    stochasticDensity: {
      birds: 0.05,
      leaves: 0.4,
      crickets: 0.8,
      chimes: 0.6,
    },
    colorTheme: 'from-indigo-600/20 to-emerald-900/20',
  },
  {
    id: 'night',
    nameAr: 'الليل والراحة العميقة',
    nameEn: 'Deep Nocturnal Sleep',
    timeRange: '23:00 - 05:00',
    startHour: 23,
    endHour: 29, // wraps past midnight
    descriptionAr: 'قناع صوتي وردي فائق النعومة، مع إيقاف تام للعصافير والأصوات المفاجئة لحماية دورات النوم العميق.',
    descriptionEn: 'Subtle brownian pink mask without abrupt transient events, protecting deep delta sleep cycles.',
    biologicalGoalAr: 'استقرار موجات الدماغ البطيئة (دلتا) ومنع اضطرابات النوم',
    biologicalGoalEn: 'Delta brainwave entrainment & undisturbed REM cycles',
    layerPresets: {
      water: 0.3,
      breeze: 0.4,
      rain: 0.2,
      ocean: 0.25,
    },
    stochasticDensity: {
      birds: 0.0,
      leaves: 0.1,
      crickets: 0.2,
      chimes: 0.0,
    },
    colorTheme: 'from-slate-900/40 to-blue-950/30',
  },
];

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: 'serene_friday',
    nameAr: 'هدوء يوم الجمعة',
    nameEn: 'Serene Friday Rhythm',
    iconName: 'Sparkles',
    descriptionAr: 'طابع روحي هادئ يركز على نقاء خرير المياه وأجراس الرياح الخافتة ببطء متزن.',
    descriptionEn: 'Spiritual tranquility emphasizing pure water clarity and long resonant chime decays.',
    duckingSensitivityOffset: -2,
    masterVolumeTarget: 0.7,
    layerPresets: {
      water: 0.75,
      breeze: 0.5,
      rain: 0.0,
      ocean: 0.2,
    },
  },
  {
    id: 'hospitality',
    nameAr: 'مجلس الضيافة والعائلة',
    nameEn: 'Family Gathering & Majlis',
    iconName: 'Users',
    descriptionAr: 'حساسية كشف كلام قصوى (-8dB) مع تنظيم ذكي فوري حتى تظل المحادثات واضحة تماماً دون إجهاد سمعي.',
    descriptionEn: 'Enhanced VAD ducking sensitivity ensuring effortless dialogue without acoustic clutter.',
    duckingSensitivityOffset: +6,
    masterVolumeTarget: 0.5,
    layerPresets: {
      water: 0.4,
      breeze: 0.35,
      rain: 0.0,
      ocean: 0.25,
    },
  },
  {
    id: 'deep_study',
    nameAr: 'جلسة عمل وتركيز',
    nameEn: 'Deep Study & Focus',
    iconName: 'BookOpen',
    descriptionAr: 'قناع مائي ومطري بيوفيلي يحجب ضوضاء الشوارع وأصوات الأجهزة المنزلية بفاعلية مثبتة.',
    descriptionEn: 'Biophilic water & rain mask proven to insulate from intrusive street and household noises.',
    duckingSensitivityOffset: 0,
    masterVolumeTarget: 0.8,
    layerPresets: {
      water: 0.9,
      breeze: 0.4,
      rain: 0.4,
      ocean: 0.0,
    },
  },
  {
    id: 'stress_recovery',
    nameAr: 'تفريغ الإجهاد والتأمل',
    nameEn: 'Stress Relief & Meditation',
    iconName: 'HeartPulse',
    descriptionAr: 'أمواج شاطئية ونبضات نسيم متناغمة مع وتيرة التنفس العميق (6 دورات بالدقيقة) لخفض ضربات القلب.',
    descriptionEn: 'Tidal waves and breeze paced with slow deep breath work to reduce heart rate variability stress.',
    duckingSensitivityOffset: -4,
    masterVolumeTarget: 0.65,
    layerPresets: {
      water: 0.5,
      breeze: 0.6,
      rain: 0.0,
      ocean: 0.85,
    },
  },
];

export function getPhaseForHour(hour: number): CircadianPhase {
  // Normalize hour to 0 - 24
  const h = (hour + 24) % 24;

  if (h >= 5 && h < 8.5) return CIRCADIAN_PHASES[0]; // dawn
  if (h >= 8.5 && h < 16.5) return CIRCADIAN_PHASES[1]; // midday
  if (h >= 16.5 && h < 19.5) return CIRCADIAN_PHASES[2]; // afternoon
  if (h >= 19.5 && h < 23) return CIRCADIAN_PHASES[3]; // evening
  return CIRCADIAN_PHASES[4]; // night
}
