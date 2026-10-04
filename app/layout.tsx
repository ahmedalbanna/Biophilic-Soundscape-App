import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Tajawal } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Biophilic Soundscape | نظام البيئة الصوتية الحيوية والتكيفية',
  description:
    'نظام ذكي متكامل للمنازل العصرية يحول البيت إلى بيئة صوتية حيوية متفاعلة مع فترات اليوم، بتقنية التراكب الديناميكي وكشف الكلام (VAD) والتنظيم الذكي لمستوى الصوت وتوزيع الغرف المتعددة.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Biophilic',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Biophilic Soundscape | نظام البيئة الصوتية الحيوية',
    description:
      'نظام ذكي متكامل للمنازل العصرية يحول البيت إلى بيئة صوتية حيوية متفاعلة مع فترات اليوم بتقنية التراكب الديناميكي وكشف الكلام (VAD).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Biophilic Soundscape | نظام البيئة الصوتية الحيوية',
    description:
      'نظام ذكي متكامل للمنازل العصرية يحول البيت إلى بيئة صوتية حيوية متفاعلة مع فترات اليوم.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${tajawal.variable} ${plusJakarta.variable}`}>
      <body className="bg-stone-950 text-stone-100 min-h-screen antialiased selection:bg-emerald-800 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
