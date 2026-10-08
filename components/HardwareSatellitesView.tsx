'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Radio,
  Server,
  Activity,
  Check,
  Copy,
  Terminal,
  Volume2,
  Mic,
  ShieldCheck,
  Zap,
  Code,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  HardDrive,
  Network,
} from 'lucide-react';
import {
  SatelliteNode,
  INITIAL_SATELLITE_NODES,
  generateEspHomeYaml,
  generateArduinoCppFirmware,
  generateDockerComposeYaml,
  generateAlsaConfig,
} from '@/lib/hardware-satellites';
import { getAudioEngine } from '@/lib/audio-engine';

interface HardwareSatellitesViewProps {
  onEngineStartRequest: () => void;
  isEnginePlaying: boolean;
}

export function HardwareSatellitesView({
  onEngineStartRequest,
  isEnginePlaying,
}: HardwareSatellitesViewProps) {
  const [nodes, setNodes] = useState<SatelliteNode[]>(INITIAL_SATELLITE_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sat_majlis');
  const [activeCodeTab, setActiveCodeTab] = useState<'esphome' | 'arduino' | 'docker' | 'alsa'>('esphome');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string>('');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Copy code helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Simulate Speech event on a specific satellite node
  const handleSimulateSpeech = (nodeId: string) => {
    const engine = getAudioEngine();
    if (!isEnginePlaying) {
      onEngineStartRequest();
    }

    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: 'active_vad',
              currentSplDb: 69.4,
            }
          : n
      )
    );

    // Trigger Smart Ducking on engine
    engine.applyDucking(true, -18, 0.12, 1.8);
    setStatusNotification(`تم استلام إشارة VAD من ${nodes.find((n) => n.id === nodeId)?.nameAr} (انحسار الصوت -18dB)`);

    // Reset after 4 seconds
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: 'online',
                currentSplDb: 38.5,
              }
            : n
        )
      );
      engine.applyDucking(false, -18, 0.12, 1.8);
      setStatusNotification('');
    }, 4000);
  };

  // Adjust node sensitivity
  const handleSensitivityChange = (nodeId: string, val: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, vadSensitivity: val } : n))
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <section className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>العتاد والطرفيات الفيزيائية (Hardware Edge Satellites & Nodes)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">
              أقمار ESP32-S3 الطرفية الموزعة وحزمة Docker المستقلة
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mt-1">
              توزيع ميكروفونات رقمية I2S مصغرة (INMP441) في مفاتيح الإضاءة وأسقف الغرف لرصد الكلام فورياً
              عبر بروتوكول MQTT، مع حزمة Docker Appliance كاملة لتشغيل النظام كخادم منزلي مستقل بدون سحابة.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>الأقمار النشطة: <strong>{nodes.length} وحدات</strong></span>
            </span>
          </div>
        </div>

        {statusNotification && (
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-xs text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusNotification}</span>
          </div>
        )}
      </section>

      {/* Satellite Fleet Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-stone-100">
              أسطول الأقمار الطرفية في غرف المنزل (Distributed Satellite Nodes Fleet)
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">· تحديث لحظي للاتصال والديسيبل</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isVadActive = node.status === 'active_vad';

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-4 relative overflow-hidden ${
                  isSelected
                    ? 'bg-stone-900 border-cyan-500 shadow-xl ring-1 ring-cyan-500/40'
                    : 'bg-stone-950/80 border-stone-800 hover:border-stone-750'
                }`}
              >
                {/* VAD Trigger Glow */}
                {isVadActive && (
                  <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none animate-pulse" />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isVadActive
                            ? 'bg-amber-400 animate-ping'
                            : node.status === 'online'
                            ? 'bg-emerald-400'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400 uppercase">
                        {node.hardwareModel}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-100">{node.nameAr}</h3>
                  </div>

                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 shrink-0">
                    {node.pingMs} ms
                  </span>
                </div>

                {/* Telemetry rows */}
                <div className="space-y-2 text-xs font-mono pt-1 border-t border-stone-850">
                  <div className="flex justify-between text-stone-400">
                    <span>عنوان IP:</span>
                    <span className="text-stone-200">{node.ipAddress}</span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>مستوى الصوت (SPL):</span>
                    <span className={`font-bold ${isVadActive ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {node.currentSplDb.toFixed(1)} dB
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>قوة الإشارة (RSSI):</span>
                    <span className="text-stone-300">{node.rssiDb} dBm</span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>ميكروفون I2S:</span>
                    <span className="text-stone-300">{node.micType}</span>
                  </div>
                </div>

                {/* Simulate Speech Button */}
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateSpeech(node.id);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                      isVadActive
                        ? 'bg-amber-500 text-stone-950 animate-pulse'
                        : 'bg-stone-850 hover:bg-stone-800 text-cyan-300 border border-stone-750'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isVadActive ? 'جاري الكلام (Ducked)' : 'محاكاة كلام بالغرفة'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Node Details & Wiring Guide */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Node Tuning & Specs (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-3xl border border-stone-800 bg-stone-900/80 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-stone-100">
                مواصفات وضبط: {selectedNode.nameAr}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-stone-500">{selectedNode.macAddress}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span>حساسية كشف الكلام (VAD Sensitivity):</span>
              <span className="text-cyan-400 font-bold">{selectedNode.vadSensitivity}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={95}
              step={5}
              value={selectedNode.vadSensitivity}
              onChange={(e) => handleSensitivityChange(selectedNode.id, parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-[10px] text-stone-500 block font-mono">
              عتبة المشغل: {selectedNode.vadSensitivity > 75 ? '58.0 dB (استجابة سريعة للهمس)' : '64.0 dB (عزل الضوضاء العالية)'}
            </span>
          </div>

          {/* I2S Physical Wiring Table */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-850 space-y-2 text-xs">
            <span className="text-cyan-400 font-bold block text-xs">
              مخطط توصيل ميكروفون INMP441 مع ESP32:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-stone-300">
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-500 block">SCK (BCLK):</span>
                <span className="text-cyan-300 font-bold">GPIO 5</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-500 block">WS (LRCLK):</span>
                <span className="text-cyan-300 font-bold">GPIO 4</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-500 block">SD (Serial Data):</span>
                <span className="text-cyan-300 font-bold">GPIO 6</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-800">
                <span className="text-stone-500 block">L/R & VDD:</span>
                <span className="text-cyan-300 font-bold">GND (Left) / 3.3V</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Studio & Firmware Generator (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-3xl border border-stone-800 bg-stone-900/60 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-100">
                  مستودع البرمجيات مفتوحة المصدر (Firmware & Docker Studio)
                </h3>
              </div>
              <span className="text-xs text-stone-400 mt-0.5 block">
                ملفات إعداد وتثبيت جاهزة للتشغيل المباشر على الأجهزة
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveCodeTab('esphome')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                  activeCodeTab === 'esphome'
                    ? 'bg-cyan-600 text-stone-950 font-bold'
                    : 'bg-stone-850 text-stone-400'
                }`}
              >
                ESPHome YAML
              </button>
              <button
                onClick={() => setActiveCodeTab('arduino')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                  activeCodeTab === 'arduino'
                    ? 'bg-cyan-600 text-stone-950 font-bold'
                    : 'bg-stone-850 text-stone-400'
                }`}
              >
                Arduino C++
              </button>
              <button
                onClick={() => setActiveCodeTab('docker')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                  activeCodeTab === 'docker'
                    ? 'bg-cyan-600 text-stone-950 font-bold'
                    : 'bg-stone-850 text-stone-400'
                }`}
              >
                Docker Compose
              </button>
              <button
                onClick={() => setActiveCodeTab('alsa')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                  activeCodeTab === 'alsa'
                    ? 'bg-cyan-600 text-stone-950 font-bold'
                    : 'bg-stone-850 text-stone-400'
                }`}
              >
                ALSA DAC
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
              <span>
                {activeCodeTab === 'esphome' && `ملف تكامل ESPHome لـ ${selectedNode.nameAr}:`}
                {activeCodeTab === 'arduino' && `كود فيرموير DMA لـ ESP32-S3 (${selectedNode.id}.ino):`}
                {activeCodeTab === 'docker' && 'حزمة الخادم المنزلي المستقل (docker-compose.yml):'}
                {activeCodeTab === 'alsa' && 'إعدادات بطاقة الصوت Hi-Res DAC (/etc/asound.conf):'}
              </span>

              <button
                onClick={() => {
                  if (activeCodeTab === 'esphome') handleCopy(generateEspHomeYaml(selectedNode));
                  if (activeCodeTab === 'arduino') handleCopy(generateArduinoCppFirmware(selectedNode));
                  if (activeCodeTab === 'docker') handleCopy(generateDockerComposeYaml());
                  if (activeCodeTab === 'alsa') handleCopy(generateAlsaConfig());
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            <pre
              className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-72 leading-relaxed"
              dir="ltr"
            >
              {activeCodeTab === 'esphome' && generateEspHomeYaml(selectedNode)}
              {activeCodeTab === 'arduino' && generateArduinoCppFirmware(selectedNode)}
              {activeCodeTab === 'docker' && generateDockerComposeYaml()}
              {activeCodeTab === 'alsa' && generateAlsaConfig()}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
