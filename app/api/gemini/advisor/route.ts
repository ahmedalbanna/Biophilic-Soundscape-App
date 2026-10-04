import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { timeOfDay, roomContext, stressLevel, householdActivity, preferredVibe } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        recommendation: {
          titleAr: 'توليفة الهدوء البيوفيلي المتزن',
          titleEn: 'Balanced Biophilic Equilibrium',
          rationaleAr: 'بناءً على المعطيات المدخلة، ننصح بدمج خرير الماء المتوسط بنسبة 70% مع نسيم ناعم 45% وزقزقة طيور متقطعة لتحفيز اليقظة الهادئة وخفض معدل هرمون الكورتيزول.',
          rationaleEn: 'Recommended 70% babbling stream with 45% forest canopy breeze and intermittent songbirds to reduce sympathetic nervous tension.',
          layers: {
            water: 0.7,
            breeze: 0.45,
            rain: 0.1,
            ocean: 0.25,
          },
          stochastic: {
            birds: 0.6,
            leaves: 0.5,
            crickets: 0.1,
            chimes: 0.3,
          },
          vadRecommendedDuckingDb: -18,
          neuroBenefit: 'تعزيز موجات ألفا الدماغية (8-12 هرتز) المسؤولة عن الاسترخاء والتركيز دون نعاس.',
        },
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `أنت خبير واستشاري في الهندسة الصوتية الحيوية (Biophilic Acoustic Engineering) وعلم الأعصاب السمعي.
قم بتحليل السياق المنزلي التالي وتوليد التوليفة الصوتية المثلى لنظام البيئة الصوتية الحيوية:
- وقت اليوم: ${timeOfDay || 'الصباح الباكر'}
- الغرفة أو المساحة: ${roomContext || 'الصالة العائلية'}
- مستوى التوتر المطلوب معالجته: ${stressLevel || 'متوسط'}
- طبيعة النشاط في البيت: ${householdActivity || 'حديث هادئ وقراءة'}
- الطابع المفضل: ${preferredVibe || 'طبيعي مريح'}

أخرج التوصية بدقة مع قيم رقمية بين 0.0 و 1.0 لكل طبقة مستمرة وكل حدث عشوائي، مع تفسير علمي لفوائد التوليفة للجهاز العصبي ونبض القلب.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleAr: { type: Type.STRING, description: 'عنوان جذاب للتوليفة باللغة العربية' },
            titleEn: { type: Type.STRING, description: 'Title in English' },
            rationaleAr: { type: Type.STRING, description: 'الشرح الهندسي والبيولوجي للتوليفة بالعربية' },
            rationaleEn: { type: Type.STRING, description: 'Scientific explanation in English' },
            neuroBenefit: { type: Type.STRING, description: 'الأثر العصبي والفسيولوجي (مثل موجات ألفا، الكورتيزول، نبض القلب)' },
            vadRecommendedDuckingDb: { type: Type.NUMBER, description: 'مستوى التنظيم الذكي الموصى به عند الكلام (مثلاً -16 أو -20)' },
            layers: {
              type: Type.OBJECT,
              properties: {
                water: { type: Type.NUMBER, description: 'مستوى صوت المياه من 0.0 إلى 1.0' },
                breeze: { type: Type.NUMBER, description: 'مستوى صوت النسيم من 0.0 إلى 1.0' },
                rain: { type: Type.NUMBER, description: 'مستوى صوت المطر من 0.0 إلى 1.0' },
                ocean: { type: Type.NUMBER, description: 'مستوى صوت الأمواج من 0.0 إلى 1.0' },
              },
              required: ['water', 'breeze', 'rain', 'ocean'],
            },
            stochastic: {
              type: Type.OBJECT,
              properties: {
                birds: { type: Type.NUMBER, description: 'كثافة زقزقة الطيور من 0.0 إلى 1.0' },
                leaves: { type: Type.NUMBER, description: 'كثافة حفيف الشجر من 0.0 إلى 1.0' },
                crickets: { type: Type.NUMBER, description: 'كثافة صرار الليل من 0.0 إلى 1.0' },
                chimes: { type: Type.NUMBER, description: 'كثافة رنين الأجراس من 0.0 إلى 1.0' },
              },
              required: ['birds', 'leaves', 'crickets', 'chimes'],
            },
          },
          required: ['titleAr', 'titleEn', 'rationaleAr', 'rationaleEn', 'neuroBenefit', 'layers', 'stochastic', 'vadRecommendedDuckingDb'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json({
      success: true,
      source: 'gemini',
      recommendation: parsed,
    });
  } catch (error: unknown) {
    console.error('Gemini Advisor Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to consult AI advisor',
      },
      { status: 500 }
    );
  }
}
