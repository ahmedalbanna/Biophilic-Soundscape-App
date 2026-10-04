// Snapcast Multi-Room Synchronization & Media Overlay Engine

export interface SnapcastZoneClient {
  id: string;
  nameAr: string;
  nameEn: string;
  hardwareType: 'Raspberry Pi 5' | 'Raspberry Pi 4' | 'Mini PC x86' | 'ESP32 Audio' | 'Ceiling Amp';
  ipAddress: string;
  latencyJitterMs: number;
  latencyOffsetMs: number;
  volume: number; // 0.0 to 1.0
  muted: boolean;
  status: 'synced' | 'connecting' | 'standby';
  speakerSpecsAr: string;
}

export const INITIAL_SNAPCAST_CLIENTS: SnapcastZoneClient[] = [
  {
    id: 'snap_living',
    nameAr: 'غرفة المعيشة والصالون',
    nameEn: 'Living Room & Majlis',
    hardwareType: 'Raspberry Pi 5',
    ipAddress: '192.168.1.101',
    latencyJitterMs: 0.8,
    latencyOffsetMs: 0,
    volume: 0.8,
    muted: false,
    status: 'synced',
    speakerSpecsAr: 'مكبرات سقفية ثنائية مخفية بقوة 40W لكل قناة',
  },
  {
    id: 'snap_office',
    nameAr: 'المكتب المنزلي (Workstation)',
    nameEn: 'Home Office',
    hardwareType: 'Mini PC x86',
    ipAddress: '192.168.1.102',
    latencyJitterMs: 0.6,
    latencyOffsetMs: -5,
    volume: 0.7,
    muted: false,
    status: 'synced',
    speakerSpecsAr: 'شريط صوتي شريطي استريو مخفي تحت حافة المكتب',
  },
  {
    id: 'snap_bedroom',
    nameAr: 'غرفة النوم الرئيسية',
    nameEn: 'Master Bedroom',
    hardwareType: 'Raspberry Pi 4',
    ipAddress: '192.168.1.103',
    latencyJitterMs: 1.1,
    latencyOffsetMs: 5,
    volume: 0.55,
    muted: false,
    status: 'synced',
    speakerSpecsAr: 'مكبرات محيطية ناعمة مدمجة في زوايا السقف',
  },
  {
    id: 'snap_courtyard',
    nameAr: 'الفناء والحديقة الداخلية',
    nameEn: 'Internal Courtyard & Patio',
    hardwareType: 'ESP32 Audio',
    ipAddress: '192.168.1.104',
    latencyJitterMs: 1.4,
    latencyOffsetMs: 10,
    volume: 0.75,
    muted: false,
    status: 'synced',
    speakerSpecsAr: 'مكبرات صخرية مقاومة للرطوبة والعوامل الجوية',
  },
];

export interface CuratedMediaTrack {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  readerOrAuthorAr: string;
  audioUrl: string;
  defaultDuckingDb: number;
}

export const CURATED_MEDIA_TRACKS: CuratedMediaTrack[] = [
  {
    id: 'quran_rahman',
    titleAr: 'تلاوة سورة الرحمن (سكينة وخشوع)',
    titleEn: 'Surah Ar-Rahman (Peaceful Recitation)',
    categoryAr: 'تلاوات قرآنية',
    categoryEn: 'Quran Recitation',
    readerOrAuthorAr: 'تلاوة خاشعة هادئة بنغم حجازي',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=meditation-spiritual-112191.mp3',
    defaultDuckingDb: -16,
  },
  {
    id: 'quran_kahf',
    titleAr: 'تلاوة سورة الكهف (ترتيل هادئ)',
    titleEn: 'Surah Al-Kahf (Quiet Flow)',
    categoryAr: 'تلاوات قرآنية',
    categoryEn: 'Quran Recitation',
    readerOrAuthorAr: 'ترتيل عذب يبعث الطمأنينة',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-mountains-rivers-1828.mp3',
    defaultDuckingDb: -18,
  },
  {
    id: 'adhkar_morning',
    titleAr: 'أذكار الصباح والسكينة اليومية',
    titleEn: 'Morning Remembrance & Calm',
    categoryAr: 'أذكار وتأمل',
    categoryEn: 'Adhkar & Reflection',
    readerOrAuthorAr: 'صوت رخيم هادئ لبداية اليوم',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73bb2b43b3.mp3?filename=peace-meditation-flute-13837.mp3',
    defaultDuckingDb: -14,
  },
];

export function generateSnapserverConf(): string {
  return `# /etc/snapserver.conf
# Biophilic Soundscape Synchronous Multi-Room Streaming Engine

[general]
threads = 4
datadir = /var/lib/snapserver

[stream]
# High-Fidelity 48kHz / 16-bit stereo FIFO pipe fed by Biophilic Core
source = pipe:///tmp/snapfifo?name=BiophilicCore&sampleformat=48000:16:2&codec=flac

# Secondary Overlay Pipe for Quran Recitation / Media
source = pipe:///tmp/snapmediafifo?name=MediaOverlay&sampleformat=48000:16:2&codec=flac

buffer = 1000
chunk_ms = 20

[http]
enabled = true
bind_to_address = 0.0.0.0
port = 1780
doc_root = /usr/share/snapserver/snapweb

[tcp]
enabled = true
bind_to_address = 0.0.0.0
port = 1704
`;
}

export function generateSnapclientService(zoneId: string, latencyOffsetMs: number): string {
  return `[Unit]
Description=Snapcast Audio Client (${zoneId})
After=sound.target network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/snapclient -h 127.0.0.1 -p 1704 --latency ${latencyOffsetMs} --soundcard default
Restart=always
RestartSec=3
User=audio
Group=audio

[Install]
WantedBy=multi-user.target
`;
}
