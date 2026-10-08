// Family Social Contexts & Cultural Hospitality Presets Engine
// Context-aware acoustic, photobiological, and spatial orchestration for family moments.

export interface ContextAcousticConfig {
  waterVolume: number;
  waterEnabled: boolean;
  breezeVolume: number;
  breezeEnabled: boolean;
  rainVolume: number;
  rainEnabled: boolean;
  oceanVolume: number;
  oceanEnabled: boolean;
  birdDensity: number; // 0 to 1
  vadSensitivity: number; // 0 to 100%
  vadDuckingDepthDb: number; // e.g. -12dB to -24dB
  targetKelvin: number;
  targetBrightnessPct: number;
}

export interface FamilySocialContext {
  id: string;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  taglineAr: string;
  descriptionAr: string;
  socialDynamicAr: string;
  acousticPhilosophyAr: string;
  lightingDescriptionAr: string;
  color: string;
  iconName: string;
  config: ContextAcousticConfig;
}

export const INITIAL_FAMILY_CONTEXTS: FamilySocialContext[] = [
  {
    id: 'hospitality_majlis',
    nameAr: 'استقبال الضيوف والمجلس العربي',
    nameEn: 'Formal Majlis & Arabian Hospitality',
    badgeAr: 'كرم الضيافة والحديث الدافئ',
    taglineAr: 'حضور بيوفيلي خافت يثري الأجواء دون مقاطعة الأحاديث',
    descriptionAr: 'بيئة صوتية متزنة تحاكي رقة خرير النوافير الأندلسية، مع كشف فائق السرعة للكلام لخفض الصوت تلقائياً (-22dB) بمجرد بدء تبادل أطراف الحديث.',
    socialDynamicAr: 'مجلس عامر، ضيوف كرام، وأحاديث متصلة تحتاج صوتاً خلفياً ناعماً لا يرفع أصوات الجالسين.',
    acousticPhilosophyAr: 'خرير ماء خافت جداً، انعدام الزقزقة المفاجئة، وخفض عميق للحوار (-22dB Ducking).',
    lightingDescriptionAr: 'إضاءة دافئة مرحبة 2,700K مع إبراز سبوتات المجلس وتخفيف الوهج المباشر.',
    color: '#f59e0b',
    iconName: 'coffee',
    config: {
      waterVolume: 0.35,
      waterEnabled: true,
      breezeVolume: 0.25,
      breezeEnabled: true,
      rainVolume: 0.0,
      rainEnabled: false,
      oceanVolume: 0.0,
      oceanEnabled: false,
      birdDensity: 0.1,
      vadSensitivity: 90, // very quick to duck
      vadDuckingDepthDb: -22,
      targetKelvin: 2700,
      targetBrightnessPct: 65,
    },
  },
  {
    id: 'family_tea',
    nameAr: 'شاي العصر وجلسة الأهل والوالدين',
    nameEn: 'Family Afternoon Tea & Elder Comfort',
    badgeAr: 'دفء العائلة وصلة الرحم',
    taglineAr: 'أجواء عائلية مريحة تعيد ذكريات بساتين النخيل والنسيم العليل',
    descriptionAr: 'مزيج ناعم من حفيف سعف النخيل في واحة الأحساء مع زقزقة ناعمة لبلبل الصباح وتدفق مائي مريح يبعث السكينة في نفوس الوالدين والأبناء.',
    socialDynamicAr: 'جلسة صالة المعيشة بعد العصر، تبادل الأحاديث وشرب الشاي والقهوة مع العائلة.',
    acousticPhilosophyAr: 'نسيم معتدل متصل، زقزقة بلابل منتظمة، وخرير مائي رقراق يعزز المزاج الإيجابي.',
    lightingDescriptionAr: 'ضوء ذهبي ناعم 3,200K يحاكي ساعة ما قبل الغروب الذهبية.',
    color: '#06b6d4',
    iconName: 'heart',
    config: {
      waterVolume: 0.6,
      waterEnabled: true,
      breezeVolume: 0.55,
      breezeEnabled: true,
      rainVolume: 0.0,
      rainEnabled: false,
      oceanVolume: 0.0,
      oceanEnabled: false,
      birdDensity: 0.65,
      vadSensitivity: 75,
      vadDuckingDepthDb: -16,
      targetKelvin: 3200,
      targetBrightnessPct: 70,
    },
  },
  {
    id: 'study_focus',
    nameAr: 'جلسة مذاكرة وتركيز الأبناء',
    nameEn: 'Kids Deep Study & Exam Focus',
    badgeAr: 'تركيز ذهني وذاكرة نشطة',
    taglineAr: 'قناع صوتي طبيعي يحجب مشتتات المنزل الخارجية بنسبة 40%',
    descriptionAr: 'تدفق مائي إجرائي متصل يحاكي الضوضاء الوردية الحيوية (Pink Noise Mask) لحجب أصوات التلفاز وأقدام الممرات، مع انعدام تام لأي زقزقة مفاجئة لتثبيت التدفق الذهني.',
    socialDynamicAr: 'فترة الامتحانات والواجبات المدرسية، يحتاج الأبناء تركيزاً عميقاً وهدوءاً عازلاً للمشتتات.',
    acousticPhilosophyAr: 'خرير ماء إجرائي متوازن (0.75) + حجب كامل للعصافير والأصوات العشوائية.',
    lightingDescriptionAr: 'ضوء كامل الطيف 4,500K نهاري ينشط اليقظة والتركيز البصري بدون إجهاد.',
    color: '#8b5cf6',
    iconName: 'book-open',
    config: {
      waterVolume: 0.75,
      waterEnabled: true,
      breezeVolume: 0.35,
      breezeEnabled: true,
      rainVolume: 0.0,
      rainEnabled: false,
      oceanVolume: 0.0,
      oceanEnabled: false,
      birdDensity: 0.0, // zero sudden distractions
      vadSensitivity: 60,
      vadDuckingDepthDb: -12,
      targetKelvin: 4500,
      targetBrightnessPct: 85,
    },
  },
  {
    id: 'friday_gathering',
    nameAr: 'اجتماع غداء الجمعة المبارك',
    nameEn: 'Friday Family Feast & Blessing',
    badgeAr: 'بهجة اللقاء وبركة اليوم',
    taglineAr: 'طبيعة غامرة ونفحات عطرية تملأ بهو الفيلا بالحياة والانشراح',
    descriptionAr: 'أجواء منعشة مستوحاة من بساتين الورد الطائفي وغابات عسير، مع تدفق شلالات المياه وزقزقة بلابل نشطة تضفي طاقة حيوية وفرحاً على اجتماع العائلة الكبير.',
    socialDynamicAr: 'يوم الجمعة بعد الصلاة، اجتماع الأجيال حول المائدة وتبادل التهاني والأحاديث المبهجة.',
    acousticPhilosophyAr: 'كورس طبيعي كامل وغني، تدفق مياه مبهج، وتفاعل متزن مع أصوات الأطفال والضحكات.',
    lightingDescriptionAr: 'إضاءة طبيعية ساطعة متوازنة 3,800K تعكس نضارة النهار وانشراح النفس.',
    color: '#10b981',
    iconName: 'sun',
    config: {
      waterVolume: 0.7,
      waterEnabled: true,
      breezeVolume: 0.6,
      breezeEnabled: true,
      rainVolume: 0.0,
      rainEnabled: false,
      oceanVolume: 0.0,
      oceanEnabled: false,
      birdDensity: 0.85,
      vadSensitivity: 70,
      vadDuckingDepthDb: -15,
      targetKelvin: 3800,
      targetBrightnessPct: 80,
    },
  },
  {
    id: 'mindful_reading',
    nameAr: 'القراءة الهادئة والعزلة الإيجابية',
    nameEn: 'Quiet Reading & Reflective Solitude',
    badgeAr: 'سكينة الفكر وسماع الذات',
    taglineAr: 'رذاذ مطر رقيق على زجاج النوافذ مع خرير ماء هادئ يحفز الإبداع',
    descriptionAr: 'هدوء رومانسي تأملي يجمع بين قطرات المطر الخفيفة وتيار ماء سلس، مثالي لجلسات قراءة الكتب، تلاوة القرآن الكريم، أو جلسات الكتابة والتأمل الهادئة.',
    socialDynamicAr: 'وقت شخصي في زاوية القراءة أو المكتب، انفصال مريح عن ضجيج العالم والتكنولوجيا.',
    acousticPhilosophyAr: 'مطر خفيف متناغم مع تدفق ماء ناعم، نسيم بطيء، وتناغم طيفي مهدئ للنواة الصدغية.',
    lightingDescriptionAr: 'إضاءة قراءة مريحة 2,900K توفر تبايناً مريحاً للعين دون إبهار.',
    color: '#3b82f6',
    iconName: 'feather',
    config: {
      waterVolume: 0.5,
      waterEnabled: true,
      breezeVolume: 0.4,
      breezeEnabled: true,
      rainVolume: 0.45,
      rainEnabled: true,
      oceanVolume: 0.0,
      oceanEnabled: false,
      birdDensity: 0.2,
      vadSensitivity: 80,
      vadDuckingDepthDb: -18,
      targetKelvin: 2900,
      targetBrightnessPct: 55,
    },
  },
  {
    id: 'midnight_sanctuary',
    nameAr: 'سكون ما بعد منتصف الليل',
    nameEn: 'Midnight Silent Sanctuary',
    badgeAr: 'حراسة النوم والأمان الليلي',
    taglineAr: 'همس ليلي خافت جداً يحفظ هدوء النائمين ويوجه الحركة في الممرات',
    descriptionAr: 'طبقة ليلية فائقة الخفوت (10% ديسيبل) تحاكي نسيم ليل نجد البارد مع أمواج جزر فرسان البعيدة، بدون أي صوت مفاجئ، لضمان نوم عميق للأطفال وحماية راحة الجميع.',
    socialDynamicAr: 'المنزل نائم، حركة نادرة في الممرات، حاجة ماسة لعدم صدور أي صوت حاد أو مفاجئ.',
    acousticPhilosophyAr: 'أدنى مستوى ديسيبل ممكن (30 dB SPL)، كبح كامل للترددات العالية، وهمس ليلي مهدئ.',
    lightingDescriptionAr: 'توهج عنبري كهرماني 1,800K خافت بنسبة 10% خالٍ تماماً من الطيف الأزرق.',
    color: '#ec4899',
    iconName: 'moon',
    config: {
      waterVolume: 0.15,
      waterEnabled: true,
      breezeVolume: 0.2,
      breezeEnabled: true,
      rainVolume: 0.0,
      rainEnabled: false,
      oceanVolume: 0.35,
      oceanEnabled: true,
      birdDensity: 0.0,
      vadSensitivity: 95,
      vadDuckingDepthDb: -20,
      targetKelvin: 1800,
      targetBrightnessPct: 12,
    },
  },
];

// Generate Home Assistant Scenes Configuration YAML for all family presets
export function generateHaFamilyScenesYaml(): string {
  return `# Home Assistant Scenes for Biophilic Family Contexts & Hospitality
# File: scenes.yaml (Paste into your Home Assistant configuration)

- id: biophilic_scene_majlis
  name: "المجلس واستقبال الضيوف (Biophilic Majlis)"
  icon: "mdi:coffee"
  entities:
    input_select.biophilic_preset: "hospitality_majlis"
    media_player.biophilic_soundscape:
      state: "playing"
      volume_level: 0.55
      sound_mode: "wadi_hanifah"
    light.villa_ambient_lights:
      state: "on"
      color_temp_kelvin: 2700
      brightness_pct: 65

- id: biophilic_scene_family_tea
  name: "شاي العصر وجلسة الأهل (Family Afternoon Tea)"
  icon: "mdi:heart-outline"
  entities:
    input_select.biophilic_preset: "family_tea"
    media_player.biophilic_soundscape:
      state: "playing"
      volume_level: 0.70
      sound_mode: "al_ahsa_oasis"
    light.villa_ambient_lights:
      state: "on"
      color_temp_kelvin: 3200
      brightness_pct: 70

- id: biophilic_scene_study_focus
  name: "مذاكرة وتركيز الأبناء (Kids Study Focus)"
  icon: "mdi:book-open-page-variant"
  entities:
    input_select.biophilic_preset: "study_focus"
    media_player.biophilic_soundscape:
      state: "playing"
      volume_level: 0.75
    light.villa_ambient_lights:
      state: "on"
      color_temp_kelvin: 4500
      brightness_pct: 85

- id: biophilic_scene_midnight
  name: "سكون الليل العميق (Midnight Silent Sanctuary)"
  icon: "mdi:weather-night"
  entities:
    input_select.biophilic_preset: "midnight_sanctuary"
    media_player.biophilic_soundscape:
      state: "playing"
      volume_level: 0.25
      sound_mode: "farasan_islands"
    light.villa_ambient_lights:
      state: "on"
      color_temp_kelvin: 1800
      brightness_pct: 12
`;
}
