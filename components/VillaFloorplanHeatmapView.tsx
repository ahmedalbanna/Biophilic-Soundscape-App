'use client';

import React, { useState } from 'react';
import {
  Layers,
  Volume2,
  VolumeX,
  Sliders,
  Check,
  Copy,
  FileText,
  Sparkles,
  Maximize2,
  Compass,
  Radio,
  Eye,
  EyeOff,
  Flame,
  Zap,
  ShieldCheck,
  Activity,
  HardDrive,
  Home,
  Users,
  Moon,
  Trees,
  Info,
} from 'lucide-react';
import {
  VillaRoom,
  FloorplanSpeaker,
  INITIAL_VILLA_ROOMS,
  INITIAL_SPEAKERS,
  calculateSplAtPoint,
  generateAcousticEngineeringReport,
} from '@/lib/villa-floorplan';
import { getAudioEngine } from '@/lib/audio-engine';

interface VillaFloorplanHeatmapViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

export function VillaFloorplanHeatmapView({
  onEngineStartRequest,
  isEnginePlaying,
}: VillaFloorplanHeatmapViewProps) {
  const [rooms, setRooms] = useState<VillaRoom[]>(INITIAL_VILLA_ROOMS);
  const [speakers, setSpeakers] = useState<FloorplanSpeaker[]>(INITIAL_SPEAKERS);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room_majlis');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);
  const [isHeatmapVisible, setIsHeatmapVisible] = useState<boolean>(true);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const selectedSpeaker = speakers.find((s) => s.id === selectedSpeakerId) || null;

  // Toggle speaker power
  const handleToggleSpeaker = (speakerId: string) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === speakerId ? { ...s, isOn: !s.isOn } : s))
    );
  };

  // Adjust speaker volume
  const handleSpeakerVolume = (speakerId: string, val: number) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.id === speakerId ? { ...s, volumePct: val } : s))
    );
  };

  // Master room volume slider (adjusts all speakers in room)
  const handleRoomVolume = (roomId: string, val: number) => {
    setSpeakers((prev) =>
      prev.map((s) => (s.roomId === roomId ? { ...s, volumePct: val } : s))
    );
  };

  // Export Engineering BOM Report
  const handleCopyReport = () => {
    const report = generateAcousticEngineeringReport(rooms, speakers);
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const activeSpeakersCount = speakers.filter((s) => s.isOn).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>الهندسة المعمارية الصوتية (Architectural Acoustics & SPL Heatmap)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              مخطط الفيلا المعماري التفاعلي وخريطة التغطية الصوتية (dB SPL Heatmap)
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              محاكاة فيزيائية لتوزيع 14 سماعة سقفية مخفية عبر فضاءات الفيلا المختلفة لمنع البؤر المزعجة
              وضمان مستوى ضغط صوتي موحد (35-45 dB SPL) ينساب مع عمارة المنزل دون إجهاد سمعي.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setIsHeatmapVisible(!isHeatmapVisible)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-md ${
                isHeatmapVisible
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{isHeatmapVisible ? 'الخريطة الحرارية نشطة' : 'المخطط الهندسي الصافي'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'تم نسخ التقرير!' : 'تصدير جدول الكميات BOM'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Floorplan Blueprint & Room Inspector Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Giant Architectural Blueprint SVG Canvas (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl space-y-4 relative flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-2 border-b border-stone-850">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>المخطط المعماري للطابق الأرضي (Ground Floor Architectural Layout)</span>
            </div>
            <span>السماعات النشطة: {activeSpeakersCount} / {speakers.length}</span>
          </div>

          {/* Interactive SVG Blueprint Container */}
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#09090b] border border-stone-800 overflow-hidden shadow-inner flex items-center justify-center p-2">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Heatmap Gradients for each active speaker */}
                {speakers.map((spk) => {
                  const effectiveRadius = 18 * (spk.volumePct / 100);
                  return (
                    <radialGradient
                      key={`grad_${spk.id}`}
                      id={`grad_${spk.id}`}
                      cx={`${spk.x}%`}
                      cy={`${spk.y}%`}
                      r={`${effectiveRadius}%`}
                      fx={`${spk.x}%`}
                      fy={`${spk.y}%`}
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={spk.isOn ? 0.55 : 0} />
                      <stop offset="45%" stopColor="#06b6d4" stopOpacity={spk.isOn ? 0.35 : 0} />
                      <stop offset="80%" stopColor="#3b82f6" stopOpacity={spk.isOn ? 0.15 : 0} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                  );
                })}

                {/* Architectural Blueprint Grid Pattern */}
                <pattern id="blueprintGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#27272a" strokeWidth="0.2" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect x="0" y="0" width="100" height="100" fill="url(#blueprintGrid)" />

              {/* Architectural Rooms Rectangles */}
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;

                return (
                  <g
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      setSelectedSpeakerId(null);
                    }}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {/* Room Background Fill */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      rx="2"
                      fill={isSelected ? `${room.color}18` : '#18181b88'}
                      stroke={isSelected ? room.color : '#3f3f46'}
                      strokeWidth={isSelected ? '0.8' : '0.4'}
                      strokeDasharray={isSelected ? 'none' : 'none'}
                    />

                    {/* Room Title Label in SVG */}
                    <text
                      x={room.x + 2}
                      y={room.y + 4.5}
                      fill={isSelected ? room.color : '#a1a1aa'}
                      fontSize="2.4"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {room.nameAr.split(' ')[0]}
                    </text>

                    {/* Area & SPL Subtext */}
                    <text
                      x={room.x + 2}
                      y={room.y + 7.5}
                      fill="#71717a"
                      fontSize="1.8"
                      fontFamily="monospace"
                    >
                      {room.areaM2}م² · {room.currentSplDb} dB
                    </text>
                  </g>
                );
              })}

              {/* Acoustic Heatmap Overlays (if enabled) */}
              {isHeatmapVisible && (
                <g style={{ mixBlendMode: 'screen' }} pointerEvents="none">
                  {speakers.map((spk) => (
                    <circle
                      key={`heat_${spk.id}`}
                      cx={spk.x}
                      cy={spk.y}
                      r={24 * (spk.volumePct / 100)}
                      fill={`url(#grad_${spk.id})`}
                    />
                  ))}
                </g>
              )}

              {/* In-Ceiling Speakers Plotted Nodes */}
              {speakers.map((spk) => {
                const isSelected = selectedSpeakerId === spk.id;

                return (
                  <g
                    key={spk.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpeakerId(spk.id);
                      setSelectedRoomId(spk.roomId);
                    }}
                    className="cursor-pointer"
                  >
                    {/* Outer Glow Halo if Active */}
                    {spk.isOn && (
                      <circle
                        cx={spk.x}
                        cy={spk.y}
                        r="3.5"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="0.3"
                        strokeDasharray="1 1"
                        className="animate-spin"
                        style={{ transformOrigin: `${spk.x}px ${spk.y}px` }}
                      />
                    )}

                    {/* Speaker Center Circle */}
                    <circle
                      cx={spk.x}
                      cy={spk.y}
                      r={isSelected ? '2.2' : '1.8'}
                      fill={spk.isOn ? (isSelected ? '#f59e0b' : '#10b981') : '#52525b'}
                      stroke="#ffffff"
                      strokeWidth="0.4"
                      className="transition-all duration-150"
                    />

                    {/* Speaker Channel Text Label */}
                    <text
                      x={spk.x}
                      y={spk.y + 3.8}
                      textAnchor="middle"
                      fill={spk.isOn ? '#e4e4e7' : '#71717a'}
                      fontSize="1.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {spk.channel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Heatmap Legend Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-stone-400 pt-2 border-t border-stone-850 gap-2">
            <span>مقياس الضغط الصوتي المعماري (dB SPL):</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span>سكون (&lt;32 dB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>تغطية متوازنة (35-42 dB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>نطاق حيوي مثالي (42-48 dB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>ذروة (&gt;52 dB)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Room Inspector & Individual Speaker Tuning (4 cols) */}
        <div className="lg:col-span-4 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-emerald-400">الفضاء المعماري المحدد:</span>
                <h3 className="text-base font-bold text-stone-100">{selectedRoom.nameAr}</h3>
              </div>
              <span className="text-xs font-mono text-stone-400 bg-stone-950 px-2.5 py-1 rounded-xl border border-stone-800">
                {selectedRoom.areaM2} م²
              </span>
            </div>

            {/* Room Telemetry Metrics */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-400">
                <span>ارتفاع السقف:</span>
                <span className="text-stone-200">{selectedRoom.ceilingHeightM} متر</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>زمن الترديد (RT60):</span>
                <span className="text-amber-400 font-bold">{selectedRoom.estimatedRt60Seconds} ثانية</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>المستوى الفعلي:</span>
                <span className="text-emerald-400 font-bold">{selectedRoom.currentSplDb} dB SPL</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>البيئة الطبيعية:</span>
                <span className="text-stone-300">{selectedRoom.activeBiomeAr}</span>
              </div>
            </div>

            {/* Room Finishes Note */}
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-850 text-[11px] text-stone-400 leading-relaxed">
              <strong>التشطيب المعماري:</strong> {selectedRoom.surfaceFinishAr}
            </div>

            {/* Room Master Volume Slider */}
            <div className="space-y-2 pt-1 border-t border-stone-850">
              <div className="flex justify-between text-xs font-mono text-stone-400">
                <span>مستوى صوت الغرفة العام:</span>
                <span className="text-emerald-400 font-bold">
                  {speakers.find((s) => s.roomId === selectedRoom.id)?.volumePct || 70}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={speakers.find((s) => s.roomId === selectedRoom.id)?.volumePct || 70}
                onChange={(e) => handleRoomVolume(selectedRoom.id, parseInt(e.target.value))}
                className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Selected Speaker Inspector (if tapped) */}
          {selectedSpeaker && (
            <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-800/80 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-200 block">{selectedSpeaker.label}</span>
                  <span className="text-[10px] font-mono text-stone-500">
                    القناة: {selectedSpeaker.channel} · النوع: {selectedSpeaker.type}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleSpeaker(selectedSpeaker.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    selectedSpeaker.isOn ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                  }`}
                  title={selectedSpeaker.isOn ? 'إطفاء السماعة' : 'تشغيل السماعة'}
                >
                  {selectedSpeaker.isOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-stone-400">
                  <span>معايرة شدة السماعة:</span>
                  <span className="text-emerald-400 font-bold">{selectedSpeaker.volumePct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  disabled={!selectedSpeaker.isOn}
                  value={selectedSpeaker.volumePct}
                  onChange={(e) => handleSpeakerVolume(selectedSpeaker.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Quick Rooms Switcher */}
          <div className="pt-2 border-t border-stone-800">
            <span className="text-[11px] font-mono text-stone-500 block mb-2">الانتقال السريع بين الغرف:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRoomId(r.id);
                    setSelectedSpeakerId(null);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all truncate ${
                    selectedRoomId === r.id
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {r.nameAr.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
