// Hardware Topology and Multi-Room Spatial Audio Zone Definitions

export type SpeakerMountType = 'ceiling_slot' | 'in_ceiling_coaxial' | 'drywall_transducer' | 'architectural_perimeter';

export interface AudioZone {
  id: string;
  nameAr: string;
  nameEn: string;
  speakerTypeAr: string;
  speakerTypeEn: string;
  mountType: SpeakerMountType;
  speakerCount: number;
  amplifierChannel: string;
  vadSensorActive: boolean;
  volume: number; // 0 to 100
  isMuted: boolean;
  isSolo: boolean;
  dynamicOverlayRate: number; // 0 to 100
  currentDuckingReductionDb: number;
  status: 'active' | 'standby' | 'syncing';
}

export interface CentralHubSpecs {
  deviceModel: string;
  architecture: string;
  masterDac: string;
  samplingRate: string;
  dspLatencyMs: number;
  cpuLoadPercent: number;
  coreTempCelsius: number;
  storageUsage: string;
  amplifierType: string;
  activeNodesCount: number;
  firmwareVersion: string;
}

export const INITIAL_ZONES: AudioZone[] = [
  {
    id: 'zone_living',
    nameAr: 'الصالة العائلية ومجلس المعيشة',
    nameEn: 'Main Living Room & Family Majlis',
    speakerTypeAr: 'سماعات شريطية مخفية في فواصل السقف الخشبي',
    speakerTypeEn: 'Hidden Linear Slot Architectural Speakers',
    mountType: 'architectural_perimeter',
    speakerCount: 4,
    amplifierChannel: 'CH 1 & 2 (GaN Class-D)',
    vadSensorActive: true,
    volume: 75,
    isMuted: false,
    isSolo: false,
    dynamicOverlayRate: 85,
    currentDuckingReductionDb: 0,
    status: 'active',
  },
  {
    id: 'zone_office',
    nameAr: 'المكتب المنزلي وغرفة القراءة',
    nameEn: 'Home Office & Study Room',
    speakerTypeAr: 'سماعات سقفية متحدة المحور عالية النقاوة',
    speakerTypeEn: 'In-Ceiling Coaxial Biophilic Monitors',
    mountType: 'in_ceiling_coaxial',
    speakerCount: 2,
    amplifierChannel: 'CH 3 & 4 (GaN Class-D)',
    vadSensorActive: true,
    volume: 68,
    isMuted: false,
    isSolo: false,
    dynamicOverlayRate: 90,
    currentDuckingReductionDb: 0,
    status: 'active',
  },
  {
    id: 'zone_bedroom',
    nameAr: 'جناح النوم الرئيسي',
    nameEn: 'Master Bedroom Suite',
    speakerTypeAr: 'محولات صوتية غير مرئية خلف الجدران الجبسية',
    speakerTypeEn: 'Invisible Drywall Acoustic Transducers',
    mountType: 'drywall_transducer',
    speakerCount: 2,
    amplifierChannel: 'CH 5 & 6 (Subdued Class-D)',
    vadSensorActive: false,
    volume: 52,
    isMuted: false,
    isSolo: false,
    dynamicOverlayRate: 40,
    currentDuckingReductionDb: 0,
    status: 'active',
  },
  {
    id: 'zone_courtyard',
    nameAr: 'الفناء الداخلي والموزع المائي',
    nameEn: 'Indoor Courtyard & Water Feature Corridor',
    speakerTypeAr: 'سماعات محيطية متزامنة مع خرير النافورة الداخلية',
    speakerTypeEn: 'Water-Synchronized Perimeter Line Arrays',
    mountType: 'ceiling_slot',
    speakerCount: 4,
    amplifierChannel: 'CH 7 & 8 (Weather-Sealed Line)',
    vadSensorActive: false,
    volume: 82,
    isMuted: false,
    isSolo: false,
    dynamicOverlayRate: 95,
    currentDuckingReductionDb: 0,
    status: 'active',
  },
];

export const CENTRAL_HUB_SPECS: CentralHubSpecs = {
  deviceModel: 'Mini PC Biophilic DSP Controller / Raspberry Pi 5 Core',
  architecture: 'Quad-Core 64-bit ARM Cortex-A76 @ 2.4 GHz',
  masterDac: 'Dual ESS Sabre ES9038Q2M Audiophile DAC (24-bit/96kHz)',
  samplingRate: '96.0 kHz / 24-bit PCM Flac/Procedural',
  dspLatencyMs: 3.8,
  cpuLoadPercent: 12.4,
  coreTempCelsius: 41.2,
  storageUsage: '48.2 GB / 512 GB NVMe High-Purity Soundbank',
  amplifierType: '8-Channel GaN Discrete Distributed Power Stage (400W Total)',
  activeNodesCount: 12,
  firmwareVersion: 'v2.8.4-biophilic-dsp',
};
