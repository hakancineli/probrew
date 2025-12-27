import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProBrew | Yeni Nesil Kafe & Restoran Otomasyon Sistemi",
  description: "Kafenizi profesyonel seviyeye taşıyın. Bulut tabanlı POS, anlık stok takibi, reçete yönetimi ve sadakat programı çözümleriyle kârlılığınızı artırın.",
  keywords: ["kafe otomasyonu", "restoran pos sistemi", "bulut tabanlı pos", "stok takibi", "kafe yazılımı", "reçete yönetimi", "ücretsiz pos", "probrew"],
  authors: [{ name: "ProBrew Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "ProBrew | Yeni Nesil Kafe Otomasyon Sistemi",
    description: "Operasyonunuzu dijitalleştirin, stok kaçaklarını önleyin. Türkiye'nin en modern kafe yazılımı.",
    url: "https://probrew.com.tr",
    siteName: "ProBrew",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProBrew | Kafe Otomasyonu",
    description: "Kârlılığınızı artıran bulut tabanlı POS sistemi.",
  },
  alternates: {
    canonical: "https://probrew.com.tr",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
