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
  description: 'ProBrew ile işletmenizi dijitalleştirin. Bulut tabanlı Kafe POS, interaktif QR Menü, stok takibi, personel yönetimi ve yapay zeka destekli analizler tek platformda.',
  keywords: ['kafe pos sistemi', 'restoran otomasyonu', 'qr menü sistemi', 'stok takibi yazılımı', 'kafe yönetim sistemi', 'bulut tabanlı pos', 'temassız sipariş', 'probrew', 'adısyon takip sistemi'],
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
        url: '/images/logo/probrew-logo.png',
        width: 800,
        height: 600,
        alt: 'ProBrew Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProBrew',
    description: 'Kafe işletme yönetim sisteminiz.',
    images: ['/images/logo/probrew-logo.png'],
    site: '@probrew',
    creator: '@hakancineli',
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
  themeColor: '#2563EB',
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
