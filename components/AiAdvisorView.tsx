'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, Check, RefreshCw, Sliders, ArrowLeft, HeartPulse, ShieldCheck } from 'lucide-react';
import { ContinuousLayerId, StochasticEventId } from '@/lib/audio-engine';

interface RecommendationData {
  titleAr: string;
  titleEn: string;
  rationaleAr: string;
  rationaleEn: string;
  neuroBenefit: string;
  vadRecommendedDuckingDb: number;
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
}

interface AiAdvisorViewProps {
  onApplyRecommendation: (rec: RecommendationData) => void;
}

export function AiAdvisorView({ onApplyRecommendation }: AiAdvisorViewProps) {
  const [timeOfDay, setTimeOfDay] = useState('الصباح الباكر (07:00)');
  const [roomContext, setRoomContext] = useState('الصالة العائلية ومجلس المعيشة');
  const [stressLevel, setStressLevel] = useState('إجهاد ذهني وضغط عمل مرتفع');
  const [householdActivity, setHouseholdActivity] = useState('قراءة وعمل مكتبي هادئ');
  const [preferredVibe, setPreferredVibe] = useState('طبيعة منعشة ومياه جارية');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setAppliedSuccess(false);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeOfDay,
          roomContext,
          stressLevel,
          householdActivity,
          preferredVibe,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'تعذر الحصول على التوصية من المستشار الذكي');
      }

      setRecommendation(data.recommendation);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!recommendation) return;
    onApplyRecommendation(recommendation);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Brain className="w-4 h-4 text-emerald-400" />
          <span>المستشار العصبي الصوتي (Gemini 3.8 Flash Biophilic Intelligence)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
          استشارة الذكاء الاصطناعي لتوليف البيئة الصوتية
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
          يقوم نموذج الذكاء الاصطناعي بتحليل الحالة المزاجية، ونشاط أفراد المنزل، والوقت الحالي،
          ثم يوصي بتوليفة صوتية متوازنة فسيولوجياً تعمل على تنظيم الجهاز العصبي وتخفيف الإجهاد.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Consultation Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
            <h2 className="text-base font-semibold text-stone-100 pb-2 border-b border-stone-800">
              معطيات السياق المنزلي الحالي
            </h2>

            {/* Time of Day */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">وقت اليوم الحالي:</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="الفجر وبزوغ الشمس (05:30)">الفجر وبزوغ الشمس (05:30)</option>
                <option value="الصباح الباكر (07:00)">الصباح الباكر (07:00)</option>
                <option value="منتصف النهار وساعات العمل (11:30)">منتصف النهار وساعات العمل (11:30)</option>
                <option value="العصر والشفق الذهبي (17:00)">العصر والشفق الذهبي (17:00)</option>
                <option value="المساء والاجتماع الأسري (20:00)">المساء والاجتماع الأسري (20:00)</option>
                <option value="الليل المتأخر والاستعداد للنوم (23:30)">الليل المتأخر والاستعداد للنوم (23:30)</option>
              </select>
            </div>

            {/* Room Context */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">الغرفة أو الحيز المطلوب:</label>
              <select
                value={roomContext}
                onChange={(e) => setRoomContext(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="الصالة العائلية ومجلس المعيشة">الصالة العائلية ومجلس المعيشة</option>
                <option value="المكتب المنزلي وغرفة القراءة">المكتب المنزلي وغرفة القراءة</option>
                <option value="جناح النوم الرئيسي">جناح النوم الرئيسي</option>
                <option value="الفناء الداخلي والممر المائي">الفناء الداخلي والممر المائي</option>
              </select>
            </div>

            {/* Stress Level */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">الحالة الجسدية / النفسية المراد علاجها:</label>
              <select
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="إجهاد ذهني وضغط عمل مرتفع">إجهاد ذهني وضغط عمل مرتفع (تخفيف الكورتيزول)</option>
                <option value="تشتت انتباه وضوضاء خارجية">تشتت انتباه وضوضاء خارجية (قناع صوتي للتركيز)</option>
                <option value="صعوبة في النوم وأرق ليلي">صعوبة في النوم وأرق ليلي (تحفيز موجات دلتا)</option>
                <option value="استرخاء وهدوء طبيعي متوازن">استرخاء وهدوء طبيعي متوازن</option>
              </select>
            </div>

            {/* Household Activity */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">طبيعة نشاط السكان في هذا الوقت:</label>
              <select
                value={householdActivity}
                onChange={(e) => setHouseholdActivity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="محادثات وحوارات عائلية متبادلة">محادثات وحوارات عائلية متبادلة (تتطلب كتم صوت ذكي)</option>
                <option value="قراءة وعمل مكتبي هادئ">قراءة وعمل مكتبي هادئ وتأمل</option>
                <option value="استعداد للنوم وراحة تامة">استعداد للنوم وراحة تامة</option>
                <option value="استقبال ضيوف ومناسبة اجتماعية">استقبال ضيوف ومناسبة اجتماعية</option>
              </select>
            </div>

            {/* Preferred Vibe */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">الطابع الصوتي المفضل:</label>
              <select
                value={preferredVibe}
                onChange={(e) => setPreferredVibe(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="طبيعة منعشة ومياه جارية">طبيعة منعشة ومياه جارية</option>
                <option value="أمواج ساحلية وإيقاع هادئ">أمواج ساحلية وإيقاع هادئ</option>
                <option value="نسيم غابات ربيعي خفيف">نسيم غابات ربيعي خفيف</option>
                <option value="رذاذ مطر هادئ متواصل">رذاذ مطر هادئ متواصل</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري استشارة الذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد التوليفة البيوفيلية المثالية</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Recommendation Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl border border-rose-800 bg-rose-950/40 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {!recommendation && !isLoading && (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-stone-800 bg-stone-900/30 text-stone-500 space-y-3">
              <Brain className="w-10 h-10 text-stone-700" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-400">بانتظار استشارتك</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  حدد معطيات منزلك واضغط على زر التوليد ليقوم النموذج بتركيب أفضل ترددات طبيعية متناغمة مع حالتك.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-stone-800 bg-stone-900/40 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-200">تحليل الأثر السمعي الفسيولوجي...</h3>
                <p className="text-xs text-stone-400">
                  نقوم بتوليف مستويات التراكب الديناميكي وضبط حساسية VAD لمعادلة الجهاز العصبي اللاودي (Parasympathetic).
                </p>
              </div>
            </div>
          )}

          {recommendation && !isLoading && (
            <div className="p-6 rounded-2xl border border-emerald-800/80 bg-stone-900/80 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توصية بيوفيلية مخصصة</span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-100">{recommendation.titleAr}</h2>
                  <p className="text-xs text-stone-400">{recommendation.titleEn}</p>
                </div>

                <div className="text-left font-mono text-xs text-stone-400">
                  <span>كتم VAD:</span>
                  <span className="text-amber-400 font-bold block tabular-nums">
                    {recommendation.vadRecommendedDuckingDb} dB
                  </span>
                </div>
              </div>

              {/* Rationale & Neuro benefit */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {recommendation.rationaleAr}
                </p>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-300">
                  <HeartPulse className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">الأثر العصبي والفسيولوجي المباشر:</span>
                    <span>{recommendation.neuroBenefit}</span>
                  </div>
                </div>
              </div>

              {/* Layers mix summary */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <span className="text-xs text-stone-400 font-mono block">التوليفة المقترحة للطبقات:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">خرير المياه:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {Math.round(recommendation.layers.water * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">نسيم الغابة:</span>
                    <span className="text-teal-400 font-bold tabular-nums">
                      {Math.round(recommendation.layers.breeze * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">المطر الهادئ:</span>
                    <span className="text-cyan-400 font-bold tabular-nums">
                      {Math.round(recommendation.layers.rain * 100)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">أمواج البحر:</span>
                    <span className="text-blue-400 font-bold tabular-nums">
                      {Math.round(recommendation.layers.ocean * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Apply Button */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleApply}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Sliders className="w-4 h-4" />
                  <span>تطبيق هذه التوليفة الآن على المحرك الصوتي</span>
                </button>

                {appliedSuccess && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تم ضبط المحرك الصوتي بنجاح!</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
