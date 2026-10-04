// Spatial 2D Audio Positioning & Soundscape Preset Studio

export type SoundEmitterType = 'water' | 'breeze' | 'rain' | 'ocean' | 'birds' | 'chimes';

export interface SoundSource2D {
  id: string;
  type: SoundEmitterType;
  nameAr: string;
  nameEn: string;
  x: number; // 0 to 100% of room width
  y: number; // 0 to 100% of room height
  volume: number; // 0 to 1
  color: string;
  icon: string;
}

export interface ListenerPosition {
  x: number; // 0 to 100%
  y: number; // 0 to 100%
  headAngleDeg: number; // 0 to 360
}

export interface SoundscapePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'nature' | 'focus' | 'sleep' | 'zen' | 'custom';
  descriptionAr: string;
  descriptionEn: string;
  tone: 'warm_wood' | 'crisp_canopy' | 'mineral_water' | 'coastal_breeze';
  layers: {
    water: number;
    breeze: number;
    rain: number;
    ocean: number;
  };
  stochastic: {
    birds: number;
    leaves: number;
    crickets: number;
    chimes: number;
  };
  sources: SoundSource2D[];
  listener: ListenerPosition;
  vadDuckingDepthDb: number;
  isCustom: boolean;
  createdAt: string;
}

export const INITIAL_SOUND_SOURCES: SoundSource2D[] = [
  {
    id: 'source_water',
    type: 'water',
    nameAr: 'نافورة المياه / الجدول',
    nameEn: 'Indoor Water Feature',
    x: 25,
    y: 35,
    volume: 0.7,
    color: '#10b981',
    icon: 'droplets',
  },
  {
    id: 'source_breeze',
    type: 'breeze',
    nameAr: 'نسيم الشرفة والأشجار',
    nameEn: 'Balcony Foliage Breeze',
    x: 80,
    y: 30,
    volume: 0.55,
    color: '#14b8a6',
    icon: 'wind',
  },
  {
    id: 'source_birds',
    type: 'birds',
    nameAr: 'أعالي الطيور ومحط التغريد',
    nameEn: 'Ceiling Canopy Songbirds',
    x: 75,
    y: 75,
    volume: 0.6,
    color: '#f59e0b',
    icon: 'bird',
  },
  {
    id: 'source_rain',
    type: 'rain',
    nameAr: 'رذاذ المطر على الزجاج',
    nameEn: 'Windowpane Rain Mask',
    x: 20,
    y: 80,
    volume: 0.0,
    color: '#06b6d4',
    icon: 'cloud-rain',
  },
  {
    id: 'source_chimes',
    type: 'chimes',
    nameAr: 'أجراس الرياح المعلقة',
    nameEn: 'Resonant Wind Chimes',
    x: 85,
    y: 15,
    volume: 0.35,
    color: '#38bdf8',
    icon: 'bell',
  },
];

export const CURATED_PRESETS: SoundscapePreset[] = [
  {
    id: 'oasis_springs',
    nameAr: 'واحة النخيل والعيون العذبة',
    nameEn: 'Desert Oasis & Palm Canopy',
    category: 'nature',
    descriptionAr: 'خرير مياه رقراقة منبعثة من زاوية الصالون مع نسيم عليل دافئ وزقزقة طيور متباعدة توحي بالنقاء.',
    descriptionEn: 'Pure bubbling desert spring with warm canopy breeze and distant songbirds.',
    tone: 'mineral_water',
    layers: {
      water: 0.8,
      breeze: 0.45,
      rain: 0.0,
      ocean: 0.2,
    },
    stochastic: {
      birds: 0.75,
      leaves: 0.5,
      crickets: 0.1,
      chimes: 0.4,
    },
    sources: [
      { id: 'source_water', type: 'water', nameAr: 'نبع الواحة', nameEn: 'Spring', x: 22, y: 30, volume: 0.8, color: '#10b981', icon: 'droplets' },
      { id: 'source_breeze', type: 'breeze', nameAr: 'نسيم النخيل', nameEn: 'Palms Breeze', x: 80, y: 25, volume: 0.45, color: '#14b8a6', icon: 'wind' },
      { id: 'source_birds', type: 'birds', nameAr: 'طيور الواحة', nameEn: 'Oasis Birds', x: 70, y: 80, volume: 0.75, color: '#f59e0b', icon: 'bird' },
      { id: 'source_rain', type: 'rain', nameAr: 'رذاذ خافت', nameEn: 'Light Mist', x: 15, y: 85, volume: 0.0, color: '#06b6d4', icon: 'cloud-rain' },
      { id: 'source_chimes', type: 'chimes', nameAr: 'أجراس الواحة', nameEn: 'Chimes', x: 88, y: 15, volume: 0.4, color: '#38bdf8', icon: 'bell' },
    ],
    listener: { x: 50, y: 50, headAngleDeg: 0 },
    vadDuckingDepthDb: -18,
    isCustom: false,
    createdAt: '2026-03-01',
  },
  {
    id: 'atlas_rainforest',
    nameAr: 'غابة الأطلس السحابية',
    nameEn: 'Atlas Mountain Cloud Forest',
    category: 'focus',
    descriptionAr: 'قناع صوتي كثيف من رذاذ المطر وحفيف أوراق الصنوبر لعزل التشتت البصري والسمعي الخارجي.',
    descriptionEn: 'Dense canopy pine rustle and rhythmic rainfall masking all external distractions.',
    tone: 'crisp_canopy',
    layers: {
      water: 0.65,
      breeze: 0.6,
      rain: 0.45,
      ocean: 0.0,
    },
    stochastic: {
      birds: 0.3,
      leaves: 0.85,
      crickets: 0.0,
      chimes: 0.2,
    },
    sources: [
      { id: 'source_water', type: 'water', nameAr: 'سيل الجبل', nameEn: 'Mountain Stream', x: 30, y: 20, volume: 0.65, color: '#10b981', icon: 'droplets' },
      { id: 'source_breeze', type: 'breeze', nameAr: 'رياح الغابة', nameEn: 'Canopy Wind', x: 75, y: 35, volume: 0.6, color: '#14b8a6', icon: 'wind' },
      { id: 'source_birds', type: 'birds', nameAr: 'طيور السحب', nameEn: 'Cloud Birds', x: 85, y: 70, volume: 0.3, color: '#f59e0b', icon: 'bird' },
      { id: 'source_rain', type: 'rain', nameAr: 'مطر السقف', nameEn: 'Roof Rain', x: 20, y: 75, volume: 0.45, color: '#06b6d4', icon: 'cloud-rain' },
      { id: 'source_chimes', type: 'chimes', nameAr: 'أجراس خافتة', nameEn: 'Soft Chimes', x: 82, y: 15, volume: 0.2, color: '#38bdf8', icon: 'bell' },
    ],
    listener: { x: 50, y: 50, headAngleDeg: 0 },
    vadDuckingDepthDb: -16,
    isCustom: false,
    createdAt: '2026-03-01',
  },
  {
    id: 'zen_garden',
    nameAr: 'حديقة الزن والتأمل الحجري',
    nameEn: 'Kyoto Stone Zen Garden',
    category: 'zen',
    descriptionAr: 'توليفة تأملية فائقة السكون تعتمد على قطرات مائية دورية ورنين أجراس خماسية متلاشية ببطء.',
    descriptionEn: 'Deep stillness featuring meditative water droplets and long resonant bell rings.',
    tone: 'warm_wood',
    layers: {
      water: 0.5,
      breeze: 0.35,
      rain: 0.0,
      ocean: 0.25,
    },
    stochastic: {
      birds: 0.15,
      leaves: 0.4,
      crickets: 0.5,
      chimes: 0.85,
    },
    sources: [
      { id: 'source_water', type: 'water', nameAr: 'نافورة الخيزران', nameEn: 'Bamboo Fountain', x: 20, y: 25, volume: 0.5, color: '#10b981', icon: 'droplets' },
      { id: 'source_breeze', type: 'breeze', nameAr: 'نسيم الفناء', nameEn: 'Courtyard Air', x: 80, y: 35, volume: 0.35, color: '#14b8a6', icon: 'wind' },
      { id: 'source_birds', type: 'birds', nameAr: 'عصافير الصباح', nameEn: 'Morning Sparrows', x: 85, y: 80, volume: 0.15, color: '#f59e0b', icon: 'bird' },
      { id: 'source_rain', type: 'rain', nameAr: 'رذاذ حوض الحصى', nameEn: 'Gravel Mist', x: 15, y: 75, volume: 0.0, color: '#06b6d4', icon: 'cloud-rain' },
      { id: 'source_chimes', type: 'chimes', nameAr: 'جرس التأمل النحاسي', nameEn: 'Zen Bell', x: 80, y: 15, volume: 0.85, color: '#38bdf8', icon: 'bell' },
    ],
    listener: { x: 50, y: 50, headAngleDeg: 0 },
    vadDuckingDepthDb: -22,
    isCustom: false,
    createdAt: '2026-03-01',
  },
  {
    id: 'mediterranean_surf',
    nameAr: 'أمواج الغروب الساحلية',
    nameEn: 'Mediterranean Sunset Surf',
    category: 'sleep',
    descriptionAr: 'أمواج بحرية بطيئة متناغمة مع وتيرة التنفس العميق، تساعد على استرخاء العضلات والتهيئة لنوم هانئ.',
    descriptionEn: 'Rhythmic tidal swells paced to slow respiration for deep parasympathetic restoration.',
    tone: 'coastal_breeze',
    layers: {
      water: 0.35,
      breeze: 0.55,
      rain: 0.0,
      ocean: 0.85,
    },
    stochastic: {
      birds: 0.1,
      leaves: 0.3,
      crickets: 0.7,
      chimes: 0.3,
    },
    sources: [
      { id: 'source_water', type: 'water', nameAr: 'مجرى مائي هادئ', nameEn: 'Quiet Stream', x: 25, y: 30, volume: 0.35, color: '#10b981', icon: 'droplets' },
      { id: 'source_breeze', type: 'breeze', nameAr: 'نسيم الشاطئ', nameEn: 'Sea Breeze', x: 75, y: 30, volume: 0.55, color: '#14b8a6', icon: 'wind' },
      { id: 'source_birds', type: 'birds', nameAr: 'نورس الغروب', nameEn: 'Twilight Gulls', x: 70, y: 85, volume: 0.1, color: '#f59e0b', icon: 'bird' },
      { id: 'source_rain', type: 'rain', nameAr: 'رذاذ البحر', nameEn: 'Sea Spray', x: 15, y: 80, volume: 0.0, color: '#06b6d4', icon: 'cloud-rain' },
      { id: 'source_chimes', type: 'chimes', nameAr: 'أجراس الشاطئ', nameEn: 'Coast Chimes', x: 85, y: 15, volume: 0.3, color: '#38bdf8', icon: 'bell' },
    ],
    listener: { x: 50, y: 50, headAngleDeg: 0 },
    vadDuckingDepthDb: -20,
    isCustom: false,
    createdAt: '2026-03-01',
  },
];

// Calculate spatial audio pan and attenuation distance relative to the room listener
export function calculateSpatialParameters(source: { x: number; y: number }, listener: { x: number; y: number }) {
  const dx = source.x - listener.x; // -50 to +50 approx
  const dy = source.y - listener.y; // -50 to +50 approx

  // Pan: -1 (left) to +1 (right)
  const pan = Math.max(-1, Math.min(1, dx / 45));

  // Distance from 0 to ~100
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Attenuation: 1.0 (very close) to 0.4 (far corner)
  const distanceFactor = Math.max(0.4, 1.0 - (distance / 120));

  return {
    pan: Math.round(pan * 100) / 100,
    distance: Math.round(distance),
    distanceFactor: Math.round(distanceFactor * 100) / 100,
  };
}

// LocalStorage Persistence
const STORAGE_KEY = 'biophilic_soundscape_custom_presets_v1';

export function loadSavedPresets(): SoundscapePreset[] {
  if (typeof window === 'undefined') return CURATED_PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return CURATED_PRESETS;
    const custom: SoundscapePreset[] = JSON.parse(raw);
    return [...CURATED_PRESETS, ...custom];
  } catch (e) {
    console.error('Failed to load custom presets from storage', e);
    return CURATED_PRESETS;
  }
}

export function saveCustomPreset(preset: SoundscapePreset): SoundscapePreset[] {
  if (typeof window === 'undefined') return CURATED_PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let custom: SoundscapePreset[] = raw ? JSON.parse(raw) : [];

    // Filter out if existing id
    custom = custom.filter((p) => p.id !== preset.id);
    custom.push(preset);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return [...CURATED_PRESETS, ...custom];
  } catch (e) {
    console.error('Failed to save preset to storage', e);
    return CURATED_PRESETS;
  }
}

export function deleteCustomPreset(id: string): SoundscapePreset[] {
  if (typeof window === 'undefined') return CURATED_PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let custom: SoundscapePreset[] = raw ? JSON.parse(raw) : [];
    custom = custom.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return [...CURATED_PRESETS, ...custom];
  } catch (e) {
    console.error('Failed to delete preset', e);
    return CURATED_PRESETS;
  }
}
