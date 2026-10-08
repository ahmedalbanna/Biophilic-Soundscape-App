// Interactive Villa Floorplan & Acoustic Coverage Heatmap Engine
// Spatial architecture, in-ceiling speaker positioning, and inverse-square SPL dispersion modeling.

export interface FloorplanSpeaker {
  id: string;
  roomId: string;
  label: string;
  x: number; // percentage (0 to 100%)
  y: number; // percentage (0 to 100%)
  volumePct: number; // 0 to 100%
  baseDbfs: number; // e.g. 52 dB SPL at 1 meter
  channel: string;
  isOn: boolean;
  type: 'ceiling_coaxial' | 'invisible_plaster' | 'linear_cove' | 'subwoofer';
}

export interface VillaRoom {
  id: string;
  nameAr: string;
  nameEn: string;
  x: number; // SVG rect x%
  y: number; // SVG rect y%
  width: number; // SVG rect width%
  height: number; // SVG rect height%
  areaM2: number;
  ceilingHeightM: number;
  surfaceFinishAr: string;
  estimatedRt60Seconds: number;
  targetSplDb: number;
  currentSplDb: number;
  color: string;
  iconName: string;
  speakerIds: string[];
  satelliteId?: string;
  activeBiomeAr: string;
}

export const INITIAL_VILLA_ROOMS: VillaRoom[] = [
  {
    id: 'room_majlis',
    nameAr: 'المجلس الرئيسي (Formal Majlis)',
    nameEn: 'Formal Guest Majlis',
    x: 4,
    y: 6,
    width: 44,
    height: 40,
    areaM2: 78,
    ceilingHeightM: 4.2,
    surfaceFinishAr: 'أرضيات رخام إيطالي 80%، جص ناعم 20%',
    estimatedRt60Seconds: 0.95,
    targetSplDb: 42,
    currentSplDb: 41.5,
    color: '#f59e0b',
    iconName: 'users',
    speakerIds: ['spk_m1', 'spk_m2', 'spk_m3', 'spk_m4'],
    satelliteId: 'sat_majlis',
    activeBiomeAr: 'وادي حنيفة وخرير المياه',
  },
  {
    id: 'room_living',
    nameAr: 'صالة المعيشة والبهو المفتوح (Open Living & Atrium)',
    nameEn: 'Main Living Room & Double-Height Atrium',
    x: 52,
    y: 6,
    width: 44,
    height: 52,
    areaM2: 110,
    ceilingHeightM: 6.5,
    surfaceFinishAr: 'واجهات زجاجية بانورامية 45%، بورسلان وبوردرات خشبية',
    estimatedRt60Seconds: 0.75,
    targetSplDb: 45,
    currentSplDb: 44.8,
    color: '#0ea5e9',
    iconName: 'home',
    speakerIds: ['spk_l1', 'spk_l2', 'spk_l3', 'spk_l4', 'spk_l_sub'],
    satelliteId: 'sat_living',
    activeBiomeAr: 'سودة عسير وضباب الصباح',
  },
  {
    id: 'room_courtyard',
    nameAr: 'الفناء الداخلي والحديقة الزجاجية (Courtyard)',
    nameEn: 'Indoor Garden & Water Feature Basin',
    x: 4,
    y: 50,
    width: 28,
    height: 44,
    areaM2: 36,
    ceilingHeightM: 3.8,
    surfaceFinishAr: 'أحواض حجرية، نباتات حية، جدول مياه جارٍ',
    estimatedRt60Seconds: 0.58,
    targetSplDb: 48,
    currentSplDb: 47.6,
    color: '#10b981',
    iconName: 'trees',
    speakerIds: ['spk_c1', 'spk_c2'],
    activeBiomeAr: 'واحة الأحساء وسواقي النخيل',
  },
  {
    id: 'room_corridor',
    nameAr: 'الممر الرئيسي والموزع (Central Gallery)',
    nameEn: 'Central Gallery & Transition Corridor',
    x: 36,
    y: 50,
    width: 12,
    height: 44,
    areaM2: 24,
    ceilingHeightM: 3.2,
    surfaceFinishAr: 'بيت نور جبسي، شرائط صوتية شريطية مخفية',
    estimatedRt60Seconds: 0.45,
    targetSplDb: 36,
    currentSplDb: 35.8,
    color: '#8b5cf6',
    iconName: 'git-commit',
    speakerIds: ['spk_corr1', 'spk_corr2'],
    satelliteId: 'sat_corridor',
    activeBiomeAr: 'همس النسيم الخافت',
  },
  {
    id: 'room_bedroom',
    nameAr: 'جناح النوم الرئيسي (Master Suite)',
    nameEn: 'Master Bedroom & Relaxation Sanctuary',
    x: 52,
    y: 62,
    width: 44,
    height: 32,
    areaM2: 56,
    ceilingHeightM: 3.4,
    surfaceFinishAr: 'موكيت فاخر 60%، ستائر قماشية عاتمة ماصة 30%',
    estimatedRt60Seconds: 0.32,
    targetSplDb: 34,
    currentSplDb: 33.5,
    color: '#ec4899',
    iconName: 'moon',
    speakerIds: ['spk_b1', 'spk_b2'],
    satelliteId: 'sat_bedroom',
    activeBiomeAr: 'أمواج جزر فرسان الهادئة',
  },
];

export const INITIAL_SPEAKERS: FloorplanSpeaker[] = [
  // Majlis (4 ceiling speakers)
  { id: 'spk_m1', roomId: 'room_majlis', label: 'سماعة سقف M1', x: 14, y: 16, volumePct: 70, baseDbfs: 48, channel: 'FL', isOn: true, type: 'ceiling_coaxial' },
  { id: 'spk_m2', roomId: 'room_majlis', label: 'سماعة سقف M2', x: 38, y: 16, volumePct: 70, baseDbfs: 48, channel: 'FR', isOn: true, type: 'ceiling_coaxial' },
  { id: 'spk_m3', roomId: 'room_majlis', label: 'سماعة سقف M3', x: 14, y: 36, volumePct: 70, baseDbfs: 48, channel: 'RL', isOn: true, type: 'ceiling_coaxial' },
  { id: 'spk_m4', roomId: 'room_majlis', label: 'سماعة سقف M4', x: 38, y: 36, volumePct: 70, baseDbfs: 48, channel: 'RR', isOn: true, type: 'ceiling_coaxial' },

  // Living Room (4 ceiling + 1 sub)
  { id: 'spk_l1', roomId: 'room_living', label: 'سماعة صالة L1', x: 62, y: 18, volumePct: 75, baseDbfs: 50, channel: 'FL', isOn: true, type: 'invisible_plaster' },
  { id: 'spk_l2', roomId: 'room_living', label: 'سماعة صالة L2', x: 86, y: 18, volumePct: 75, baseDbfs: 50, channel: 'FR', isOn: true, type: 'invisible_plaster' },
  { id: 'spk_l3', roomId: 'room_living', label: 'سماعة صالة L3', x: 62, y: 44, volumePct: 75, baseDbfs: 50, channel: 'RL', isOn: true, type: 'invisible_plaster' },
  { id: 'spk_l4', roomId: 'room_living', label: 'سماعة صالة L4', x: 86, y: 44, volumePct: 75, baseDbfs: 50, channel: 'RR', isOn: true, type: 'invisible_plaster' },
  { id: 'spk_l_sub', roomId: 'room_living', label: 'مضخم جهير مخفي Sub', x: 74, y: 31, volumePct: 65, baseDbfs: 54, channel: 'SUB', isOn: true, type: 'subwoofer' },

  // Courtyard (2 speakers)
  { id: 'spk_c1', roomId: 'room_courtyard', label: 'سماعة فناء C1', x: 12, y: 65, volumePct: 80, baseDbfs: 52, channel: 'L', isOn: true, type: 'ceiling_coaxial' },
  { id: 'spk_c2', roomId: 'room_courtyard', label: 'سماعة فناء C2', x: 24, y: 80, volumePct: 80, baseDbfs: 52, channel: 'R', isOn: true, type: 'ceiling_coaxial' },

  // Corridor (2 linear cove ribbons)
  { id: 'spk_corr1', roomId: 'room_corridor', label: 'شريط بيت النور Corr1', x: 42, y: 60, volumePct: 50, baseDbfs: 42, channel: 'ZONE_C', isOn: true, type: 'linear_cove' },
  { id: 'spk_corr2', roomId: 'room_corridor', label: 'شريط بيت النور Corr2', x: 42, y: 82, volumePct: 50, baseDbfs: 42, channel: 'ZONE_C', isOn: true, type: 'linear_cove' },

  // Bedroom (2 soft speakers)
  { id: 'spk_b1', roomId: 'room_bedroom', label: 'سماعة ماستر B1', x: 64, y: 76, volumePct: 40, baseDbfs: 40, channel: 'FL', isOn: true, type: 'invisible_plaster' },
  { id: 'spk_b2', roomId: 'room_bedroom', label: 'سماعة ماستر B2', x: 84, y: 76, volumePct: 40, baseDbfs: 40, channel: 'FR', isOn: true, type: 'invisible_plaster' },
];

// Calculate estimated sound pressure level (dB SPL) at a point (px, py)
export function calculateSplAtPoint(
  px: number,
  py: number,
  speakers: FloorplanSpeaker[]
): number {
  let totalEnergy = 0;

  for (const spk of speakers) {
    if (!spk.isOn) continue;

    // Euclidean distance in percentage units
    const dx = px - spk.x;
    const dy = py - spk.y;
    const dist = Math.max(1.5, Math.sqrt(dx * dx + dy * dy));

    // Acoustic Inverse-Square Law: SPL drops approx 6 dB per doubling of distance
    // Base SPL scaled by speaker volume
    const effectiveBaseSpl = spk.baseDbfs * (spk.volumePct / 100);
    const splAtDist = Math.max(20, effectiveBaseSpl - 18 * Math.log10(dist / 2.5));

    // Sum sound energies: Energy = 10^(SPL / 10)
    totalEnergy += Math.pow(10, splAtDist / 10);
  }

  if (totalEnergy <= 0) return 25; // ambient silence
  const combinedSpl = 10 * Math.log10(totalEnergy);
  return Math.min(68, Math.max(25, combinedSpl));
}

// Generate Architectural Engineering Bill of Materials (BOM) Report
export function generateAcousticEngineeringReport(
  rooms: VillaRoom[],
  speakers: FloorplanSpeaker[]
): string {
  const totalArea = rooms.reduce((acc, r) => acc + r.areaM2, 0);
  const activeSpeakers = speakers.filter((s) => s.isOn).length;
  const invisibleSpeakers = speakers.filter((s) => s.type === 'invisible_plaster').length;
  const ceilingCoaxial = speakers.filter((s) => s.type === 'ceiling_coaxial').length;
  const linearCove = speakers.filter((s) => s.type === 'linear_cove').length;
  const subs = speakers.filter((s) => s.type === 'subwoofer').length;

  return `# تقرير المواصفات الهندسية وجدول الكميات (Acoustic Engineering Specification & BOM)
مشروع: البيئة الصوتية الحيوية للفيلا السكنية (Biophilic Villa Architectural Audio)
التاريخ: ${new Date().toLocaleDateString('ar-SA')} | المعيار: AES & WELL Building Acoustic Standard

## 1. ملخص الفراغات المعمارية (Spatial Summary)
- إجمالي المساحة المغطاة: ${totalArea} م²
- إجمالي الغرف المجهزة: ${rooms.length} مناطق مستقلة
- إجمالي السماعات السقفية: ${speakers.length} وحدة (${activeSpeakers} نشطة حالياً)
- متوسط زمن الترديد المستهدف (Target RT60): 0.58 ثانية

## 2. جدول الكميات وتجهيزات العتاد (Bill of Materials - BOM)
1. سماعات سقفية مدمجة كو-أكسيال (Coaxial In-Ceiling 6.5"): عدد ${ceilingCoaxial} وحدات
2. سماعات غير مرئية تحت الجبس (Invisible Plaster In-Wall/Ceiling): عدد ${invisibleSpeakers} وحدات
3. أشرطة صوتية شريطية مخفية لبيت النور (Linear Ribbon Architectural Strips): عدد ${linearCove} وحدات
4. مضخمات ترددات جهير مخفية (Architectural In-Ceiling Subwoofers): عدد ${subs} وحدات
5. كابلات صوتية نقية نحاسية خالية من الأكسجين (14/2 AWG Oxygen-Free Copper): تقديري 320 متر
6. محطات ESP32-S3 الطرفية الموزعة (I2S MEMS VAD Nodes): عدد 4 وحدات

## 3. المعايرة الصوتية ومستويات الضغط (Acoustic Pressure Targets)
- المستوى المستهدف في المجلس: 42 dB SPL (غير مجهد، يسمح بالحوار المريح)
- المستوى المستهدف في صالة المعيشة: 45 dB SPL (انغماس طبيعي بدون بؤر حادة)
- المستوى المستهدف في جناح النوم: 34 dB SPL (همس مريح يحفز النوم والاسترخاء)
- نسبة التوحيد الصوتي (Uniformity Metric): ±2.2 dB عبر كامل الفراغات
`;
}
