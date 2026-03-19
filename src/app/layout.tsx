import './globals.css';
import { Inter } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'ProBrew | Yeni Nesil Kafe POS & Restoran Otomasyon Sistemi',
    template: '%s | ProBrew Kafe Yazılımı'
  },
  description: 'ProBrew POS ile işletmenizi akıllandırın. Bulut tabanlı Yeni Nesil Kafe POS, QR Menü, Stok Takibi ve Yapay Zeka destekli analizler ile kârlılığınızı %30 artırın.',
  keywords: ['kafe pos sistemi', 'restoran otomasyonu', 'qr menü sistemi', 'stok takibi yazılımı', 'bulut tabanlı pos', 'adısyon takip sistemi', 'probrew pos', 'kafe yönetim yazılımı'],
  metadataBase: new URL('https://probrew.com.tr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ProBrew | Kafe İşletme Yönetim Sistemi',
    description: 'Kafenizin operasyonunu akıllandırın. POS, stok, personel ve müşteri yönetimi tek platformda.',
    url: 'https://probrew.com.tr',
    siteName: 'ProBrew',
    images: [
      {
        url: '/og-v2.png',
        width: 1200,
        height: 630,
        alt: 'ProBrew POS Desktop',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProBrew',
    description: 'Kafe işletme yönetim sisteminiz.',
    images: ['/og-v2.png'],
    site: '@probrewpos',
    creator: '@hakancineli',
  },
  other: {
    'instagram:site': '@probrew.pos',
    'linkedin:site': 'probrew-pos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import SuspensionWrapper from '@/components/SuspensionWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <JsonLd />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                    registration.update(); // Force check for update
                  }, function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <SuspensionWrapper>
            <Providers>
              {children}
            </Providers>
          </SuspensionWrapper>
        </div>
      </body>
    </html>
  );
}
