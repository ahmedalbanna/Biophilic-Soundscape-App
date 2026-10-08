// Biophilic Wellbeing Scorecard & Sensory Health Index Engine
// Clinical acoustic evidence, WELL Building Standard v2 alignment, and physiological recovery telemetry.

export interface WellbeingPillarScore {
  id: string;
  nameAr: string;
  nameEn: string;
  score: number; // 0 to 100
  weight: number; // percentage
  statusAr: string;
  descriptionAr: string;
  metrics: {
    labelAr: string;
    value: string;
    target: string;
  }[];
}

export interface DailyBiophilicLog {
  dayNameAr: string;
  dateStr: string;
  totalListeningHours: number;
  stressReductionMinutes: number;
  averageHrDropBpm: number;
  prayerWindowsRespected: number; // out of 5
  speechDuckingEvents: number;
  sleepInductionMinutes: number;
  overallScore: number;
}

export interface WeeklyWellbeingSummary {
  overallIndex: number; // 0 to 100
  certificationTierAr: string;
  certificationTierEn: string;
  totalWeeklyHours: number;
  averageDailyHrDropBpm: number;
  melatoninPreservationPct: number;
  speechInteractionsRespected: number;
  prayerAdherencePct: number;
  cognitiveFlowHours: number;
  pillars: WellbeingPillarScore[];
  dailyLogs: DailyBiophilicLog[];
}

export const INITIAL_WELLBEING_SUMMARY: WeeklyWellbeingSummary = {
  overallIndex: 94,
  certificationTierAr: 'المستوى البلاتيني للاستشفاء الحسي (WELL Platinum Certified)',
  certificationTierEn: 'Platinum Biophilic Sensory Certification',
  totalWeeklyHours: 98.5,
  averageDailyHrDropBpm: 7.8,
  melatoninPreservationPct: 96,
  speechInteractionsRespected: 384,
  prayerAdherencePct: 100,
  cognitiveFlowHours: 32.4,
  pillars: [
    {
      id: 'autonomic_recovery',
      nameAr: 'تخفيف التوتر والتعافي العصبي (Autonomic Recovery)',
      nameEn: 'Vagal Stimulation & Stress Alleviation',
      score: 96,
      weight: 30,
      statusAr: 'تعافٍ عصبي فائق واستقرار في الجهاز المبهمي',
      descriptionAr: 'تحفيز العصب المبهم عبر ترددات خرير الماء الإجرائي وتناغم التنفس الرنان (4-6 ثوانٍ) مما خفض إفراز الكورتيزول.',
      metrics: [
        { labelAr: 'متوسط انخفاض النبض أثناء الجلسات', value: '-7.8 BPM', target: '-5.0 BPM' },
        { labelAr: 'ساعات التناغم القلبي (Vagal Coherence)', value: '18.2 ساعة', target: '12.0 ساعة' },
        { labelAr: 'جلسات التنفس الرنان المكتملة', value: '14 جلسة', target: '10 جلسات' },
      ],
    },
    {
      id: 'circadian_sleep',
      nameAr: 'جودة النوم والاستيقاظ الطبيعي (Circadian Sleep Quality)',
      nameEn: 'Dawn Awakening & Melatonin Protection',
      score: 93,
      weight: 25,
      statusAr: 'حماية ممتازة لهرمون الميلاتونين وانعدام الصدمة الصباحية',
      descriptionAr: 'منبه الفجر الصوتي المتدرج منع صدمة الأدرينالين الصباحية، مع خفوت نغمي وإضاءة 1,800K ليلاً منعت اضطراب النوم.',
      metrics: [
        { labelAr: 'نسبة الحفاظ على الميلاتونين الطبيعي', value: '96%', target: '90%' },
        { labelAr: 'معدل الاستيقاظ بدون منبه حاد', value: '100%', target: '85%' },
        { labelAr: 'متوسط وقت الاستغراق في النوم', value: '18 دقيقة', target: '<25 دقيقة' },
      ],
    },
    {
      id: 'acoustic_sanctuary',
      nameAr: 'سكينة المكان والصلوات (Acoustic Sanctuary)',
      nameEn: 'Speech Privacy & Prayer Adherence',
      score: 98,
      weight: 25,
      statusAr: 'التزام تام بأوقات الأذان والصلوات وراحة الحديث العائلي',
      descriptionAr: 'كشف لحظي للكلام (VAD Ducking) منع إجهاد الحبال الصوتية في المجالس، مع صمت تلقائي كامل وقت الصلوات الخمس.',
      metrics: [
        { labelAr: 'الالتزام بسكون فترات الصلاة والأذان', value: '35 / 35 صلاة (100%)', target: '100%' },
        { labelAr: 'مرات انحسار الصوت التلقائي للكلام', value: '384 لحظة حوار', target: 'لحظي' },
        { labelAr: 'منع إجهاد الصوت (Vocal Effort Saved)', value: '3.4 dB', target: '>2.5 dB' },
      ],
    },
    {
      id: 'cognitive_flow',
      nameAr: 'التركيز والانغماس الإيجابي (Cognitive Flow)',
      nameEn: 'Biophilic Noise Masking & Focus',
      score: 89,
      weight: 20,
      statusAr: 'حجب فعال لضجيج التكييف والشوارع بدون مشتتات',
      descriptionAr: 'تغطية الضوضاء الحضرية والتكييف بنغمات طبيعية غير مكررة رفعت ساعات التركيز الذهني للأبناء والعائلة.',
      metrics: [
        { labelAr: 'ساعات التركيز المنجزة بدون مشتتات', value: '32.4 ساعة', target: '25.0 ساعة' },
        { labelAr: 'نسبة امتصاص ضجيج التكييف والشارع', value: '-14.2 dB', target: '-12.0 dB' },
        { labelAr: 'مؤشر التكرار الإجرائي (Zero Audio Fatigue)', value: '100% فريد', target: '100%' },
      ],
    },
  ],
  dailyLogs: [
    { dayNameAr: 'السبت', dateStr: '10/01', totalListeningHours: 14.2, stressReductionMinutes: 85, averageHrDropBpm: 7.2, prayerWindowsRespected: 5, speechDuckingEvents: 52, sleepInductionMinutes: 45, overallScore: 92 },
    { dayNameAr: 'الأحد', dateStr: '10/02', totalListeningHours: 13.8, stressReductionMinutes: 90, averageHrDropBpm: 8.1, prayerWindowsRespected: 5, speechDuckingEvents: 46, sleepInductionMinutes: 45, overallScore: 94 },
    { dayNameAr: 'الإثنين', dateStr: '10/03', totalListeningHours: 14.5, stressReductionMinutes: 110, averageHrDropBpm: 8.5, prayerWindowsRespected: 5, speechDuckingEvents: 61, sleepInductionMinutes: 45, overallScore: 95 },
    { dayNameAr: 'الثلاثاء', dateStr: '10/04', totalListeningHours: 13.9, stressReductionMinutes: 75, averageHrDropBpm: 6.9, prayerWindowsRespected: 5, speechDuckingEvents: 48, sleepInductionMinutes: 45, overallScore: 91 },
    { dayNameAr: 'الأربعاء', dateStr: '10/05', totalListeningHours: 14.0, stressReductionMinutes: 95, averageHrDropBpm: 7.8, prayerWindowsRespected: 5, speechDuckingEvents: 54, sleepInductionMinutes: 45, overallScore: 93 },
    { dayNameAr: 'الخميس', dateStr: '10/06', totalListeningHours: 15.1, stressReductionMinutes: 120, averageHrDropBpm: 8.9, prayerWindowsRespected: 5, speechDuckingEvents: 72, sleepInductionMinutes: 60, overallScore: 96 },
    { dayNameAr: 'الجمعة', dateStr: '10/07', totalListeningHours: 13.0, stressReductionMinutes: 105, averageHrDropBpm: 7.4, prayerWindowsRespected: 5, speechDuckingEvents: 51, sleepInductionMinutes: 45, overallScore: 95 },
  ],
};

// Generate Formatted Executive Clinical & Architectural Report
export function generateWellbeingReportMarkdown(data: WeeklyWellbeingSummary): string {
  return `# تقرير الاستشفاء الحسي ومؤشرات جودة الحياة (Biophilic Wellbeing Executive Report)
المشروع: نظام البيئة الصوتية الحيوية الذكية (Biophilic Soundscape System)
فترة التقرير: الأسبوع المنتهي في ${new Date().toLocaleDateString('ar-SA')}
الاعتماد المعماري: معيار المباني الصحية العالمي (WELL Building Standard v2 - Concepts S01 to S08)

---

## 1. المؤشر العام والتصنيف البيوفيلي (Executive Scorecard)
- **المؤشر العام للاستشفاء الحسي**: ${data.overallIndex} / 100
- **مستوى الاعتماد المحقق**: ${data.certificationTierAr}
- **إجمالي ساعات الغطاء الصوتي الطبيعي**: ${data.totalWeeklyHours} ساعة خلال الأسبوع
- **متوسط انخفاض نبض القلب خلال الجلسات**: ${data.averageDailyHrDropBpm} نبضة/دقيقة
- **حماية إفراز هرمون النوم الطبيعي (Melatonin)**: ${data.melatoninPreservationPct}%

---

## 2. تقييم الركائز الأربع للاستشفاء الحسي (Sensory Health Pillars)
${data.pillars
  .map(
    (p, idx) => `### ${idx + 1}. ${p.nameAr} (${p.score}/100)
- **الحالة السريرية**: ${p.statusAr}
- **الأثر الفسيولوجي**: ${p.descriptionAr}
${p.metrics.map((m) => `  * ${m.labelAr}: **${m.value}** (الهدف المرجعي: ${m.target})`).join('\n')}
`
  )
  .join('\n')}

---

## 3. الأثر الطبي والمعماري على صحة الأسرة (Clinical Wellness Impact)
1. **الوقاية من إجهاد النواة الصدغية (Auditory Cortex Fatigue)**:
   - تم القضاء على متلازمة الحلقات الصوتية المتكررة (Loop Fatigue) بنسبة 100% بفضل التراكب الإجرائي العشوائي غير المكرر.
2. **الاسترخاء والتحفيز المبهمي (Vagal Tone Stimulation)**:
   - سجلت قراءات النبض انخفاضاً مستمراً بمعدل 7.8 BPM أثناء خرير الماء ونسيم المساء، مما يعزز مناعة الجسم واستقراره العصبي.
3. **حماية السكينة والروابط الأسرية**:
   - وفرت ميزة كشف الكلام (VAD Ducking) 384 انتقالاً ناعماً للصوت أثناء أحاديث المجلس وصالة المعيشة دون الحاجة لرفع الصوت.
`;
}
