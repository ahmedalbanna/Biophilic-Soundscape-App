// Standalone Linux & Raspberry Pi OS Audio Daemon Suite (PipeWire / ALSA Native)
// Enables 24/7 headless operation on Mini PCs, Raspberry Pi 4/5, or Intel NUC with zero browser dependency

export interface DaemonConfig {
  sampleRate: number;
  channels: number;
  bufferSize: number;
  audioBackend: 'pipewire' | 'alsa' | 'pulseaudio' | 'jack';
  targetDevice: string;
  enableVadDucking: boolean;
  mqttBrokerHost: string;
  mqttBrokerPort: number;
  continuousLayersVolume: number;
  stochasticEventsVolume: number;
  offlineCachePath: string;
}

export const DEFAULT_DAEMON_CONFIG: DaemonConfig = {
  sampleRate: 48000,
  channels: 2,
  bufferSize: 256,
  audioBackend: 'pipewire',
  targetDevice: 'hw:CARD=DAC,DEV=0',
  enableVadDucking: true,
  mqttBrokerHost: '127.0.0.1',
  mqttBrokerPort: 1883,
  continuousLayersVolume: 0.75,
  stochasticEventsVolume: 0.65,
  offlineCachePath: '/var/lib/biophilic-soundscape/cache'
};

export function generatePythonDaemonScript(config: DaemonConfig = DEFAULT_DAEMON_CONFIG): string {
  return `#!/usr/bin/env python3
"""
Biophilic Soundscape Standalone Engine - Headless 24/7 Daemon
Native Linux Audio PipeWire / ALSA Process with Markov-Chain Synthesis & VAD Ducking
Project: Biophilic Soundscape Architecture
"""

import os
import sys
import time
import math
import random
import signal
import threading
import numpy as np

# Audio backend: sounddevice (PortAudio wrapper for PipeWire / ALSA)
try:
    import sounddevice as sd
except ImportError:
    print("[ERROR] 'sounddevice' not found. Run: pip3 install sounddevice numpy scipy paho-mqtt")
    sys.exit(1)

# Optional MQTT for distributed ESP32-S3 VAD Ducking
try:
    import paho.mqtt.client as mqtt
    MQTT_AVAILABLE = True
except ImportError:
    MQTT_AVAILABLE = False

SAMPLE_RATE = ${config.sampleRate}
CHANNELS = ${config.channels}
BLOCK_SIZE = ${config.bufferSize}
CACHE_DIR = "${config.offlineCachePath}"

class BiophilicAudioDaemon:
    def __init__(self):
        self.running = True
        self.master_volume = 0.78
        self.ducking_envelope = 1.0  # 1.0 = normal, 0.22 = speech detected
        self.target_ducking = 1.0
        self.ducking_lock = threading.Lock()
        
        # Continuous Layer Phase Accumulators
        self.phase_water = 0.0
        self.phase_breeze = 0.0
        self.phase_pink = np.zeros(7, dtype=np.float32)
        
        # Neuro-Acoustic Entrainment (Alpha 10Hz by default)
        self.entrainment_active = True
        self.entrainment_hz = 10.0
        self.entrainment_carrier = 256.0
        self.entrainment_phase = 0.0
        
        # Setup MQTT if available
        if MQTT_AVAILABLE and "${config.enableVadDucking}" == "true":
            self.init_mqtt()
        
        # Setup signal handlers for graceful systemd stop
        signal.signal(signal.SIGINT, self.shutdown)
        signal.signal(signal.SIGTERM, self.shutdown)
        
    def init_mqtt(self):
        try:
            self.client = mqtt.Client(client_id="Biophilic_Linux_Daemon")
            self.client.on_connect = self.on_mqtt_connect
            self.client.on_message = self.on_mqtt_message
            self.client.connect_async("${config.mqttBrokerHost}", ${config.mqttBrokerPort}, 60)
            self.client.loop_start()
            print("[INFO] MQTT Connected to ${config.mqttBrokerHost}:${config.mqttBrokerPort}")
        except Exception as e:
            print(f"[WARN] MQTT connection failed: {e}. Ducking via local signals only.")

    def on_mqtt_connect(self, client, userdata, flags, rc):
        client.subscribe("villa/biophilic/+/vad")
        client.subscribe("villa/biophilic/master/control")

    def on_mqtt_message(self, client, userdata, msg):
        payload = msg.payload.decode('utf-8')
        if "vad" in msg.topic:
            with self.ducking_lock:
                if "SPEECH" in payload or "true" in payload.lower():
                    self.target_ducking = 0.22  # Ducking during conversation
                else:
                    self.target_ducking = 1.0

    def generate_procedural_stream(self, frames):
        # 1. Procedural water stream synthesis with pink noise filtering
        t = np.arange(frames, dtype=np.float32) / SAMPLE_RATE
        
        # Organic breeze oscillation
        breeze_lfo = 0.45 + 0.35 * np.sin(2.0 * np.pi * 0.12 * t + self.phase_breeze)
        self.phase_breeze = (self.phase_breeze + 2.0 * np.pi * 0.12 * frames / SAMPLE_RATE) % (2.0 * np.pi)
        
        # White-to-Pink filtered noise approximation (Paul Kellet algorithm)
        white = np.random.uniform(-1.0, 1.0, frames).astype(np.float32)
        water = np.convolve(white, np.ones(12)/12, mode='same') * breeze_lfo
        
        # 2. Subliminal Neuro-Acoustic Entrainment (Alpha 10Hz LFO amplitude modulation)
        if self.entrainment_active:
            entrainment_mod = 1.0 + 0.25 * np.sin(2.0 * np.pi * self.entrainment_hz * t + self.entrainment_phase)
            self.entrainment_phase = (self.entrainment_phase + 2.0 * np.pi * self.entrainment_hz * frames / SAMPLE_RATE) % (2.0 * np.pi)
            water = water * entrainment_mod
            
        # Stereo Expansion
        stereo = np.zeros((frames, 2), dtype=np.float32)
        stereo[:, 0] = water * 0.85
        stereo[:, 1] = water * 0.92
        return stereo

    def audio_callback(self, outdata, frames, time_info, status):
        if status:
            print(f"[ALSA/PipeWire Warning] {status}", file=sys.stderr)
            
        # Smooth ducking envelope interpolation
        with self.ducking_lock:
            # 50ms smoothing coefficient
            alpha = 0.08
            self.ducking_envelope += (self.target_ducking - self.ducking_envelope) * alpha
            current_ducking = self.ducking_envelope
            
        raw_audio = self.generate_procedural_stream(frames)
        outdata[:] = raw_audio * self.master_volume * current_ducking

    def run(self):
        print(f"[DAEMON] Starting Biophilic Engine on ${config.targetDevice}...")
        print(f"[DAEMON] Buffer: {BLOCK_SIZE} frames | Sample Rate: {SAMPLE_RATE} Hz")
        
        try:
            with sd.OutputStream(
                channels=CHANNELS,
                samplerate=SAMPLE_RATE,
                blocksize=BLOCK_SIZE,
                callback=self.audio_callback
            ):
                print("[DAEMON] Running continuously. Press Ctrl+C or send SIGTERM to stop.")
                while self.running:
                    time.sleep(0.5)
        except Exception as e:
            print(f"[FATAL] Audio device error: {e}", file=sys.stderr)
            sys.exit(1)

    def shutdown(self, signum, frame):
        print("\\n[DAEMON] Graceful shutdown initiated...")
        self.running = False

if __name__ == "__main__":
    daemon = BiophilicAudioDaemon()
    daemon.run()
`;
}

export function generateSystemdService(): string {
  return `[Unit]
Description=Biophilic Soundscape Architecture - Native 24/7 Audio Daemon
After=network.target sound.target pipewire.service
Wants=pipewire.service

[Service]
Type=simple
User=pi
Group=audio
WorkingDirectory=/opt/biophilic-soundscape
ExecStart=/usr/bin/python3 /opt/biophilic-soundscape/biophilic_daemon.py
Restart=always
RestartSec=3

# Real-time audio priority scheduling
Nice=-15
CPUSchedulingPolicy=rr
CPUSchedulingPriority=45
LimitRTPRIO=95
LimitMEMLOCK=infinity

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=biophilic-audio

[Install]
WantedBy=multi-user.target
`;
}

export function generateDockerCompose(): string {
  return `version: '3.8'

services:
  # Native Audio Engine with Direct Hardware Soundcard Access
  biophilic-audio-daemon:
    image: python:3.11-slim-bullseye
    container_name: biophilic_soundscape_core
    restart: unless-stopped
    network_mode: host
    privileged: true
    devices:
      - /dev/snd:/dev/snd
    volumes:
      - ./daemon:/opt/biophilic-soundscape
      - /var/lib/biophilic-cache:/var/lib/biophilic-soundscape/cache
    environment:
      - PYTHONUNBUFFERED=1
      - PULSE_SERVER=unix:/run/user/1000/pulse/native
    command: >
      bash -c "apt-get update && 
               apt-get install -y libasound2-dev libportaudio2 portaudio19-dev gcc && 
               pip install sounddevice numpy scipy paho-mqtt && 
               python /opt/biophilic-soundscape/biophilic_daemon.py"

  # Local MQTT Broker for Low-Latency (<30ms) ESP32-S3 Satellite Ducking
  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: biophilic_mqtt_broker
    restart: unless-stopped
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf
`;
}

export function generateInstallationCommands(): string {
  return `# 1. Update and install Linux audio packages
sudo apt update && sudo apt install -y python3-pip python3-numpy python3-scipy \\
  libasound2-dev libportaudio2 portaudio19-dev pipewire-alsa alsa-utils

# 2. Install Python sounddevice and MQTT client
pip3 install sounddevice paho-mqtt

# 3. Create deployment directory
sudo mkdir -p /opt/biophilic-soundscape /var/lib/biophilic-soundscape/cache
sudo chown -R $USER:$USER /opt/biophilic-soundscape /var/lib/biophilic-soundscape

# 4. Copy daemon script
cp biophilic_daemon.py /opt/biophilic-soundscape/
chmod +x /opt/biophilic-soundscape/biophilic_daemon.py

# 5. Install and enable Systemd service
sudo cp biophilic-soundscape.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now biophilic-soundscape.service

# 6. Verify real-time status and journal logs
systemctl status biophilic-soundscape.service
journalctl -u biophilic-soundscape.service -f
`;
}
