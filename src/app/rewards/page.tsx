'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MenuHero from '@/components/MenuHero';
import RewardsDashboard from '@/components/RewardsDashboard';

export default function RewardsPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDashboard, setShowDashboard] = useState(true);

  const slides = [
    '/images/instagram/bir yudum estetik.jpeg',
    '/images/instagram/brownie.jpg',
    '/images/instagram/mevsim-degisir.jpeg',
    '/images/instagram/siparişiniz hazır.jpg',
    '/images/instagram/zamansız tatlar.jpg',
    '/images/instagram/🍰Bazı Tatlar Zamanı Durdurur…Her Yudumda Zamansız Bir Keyif☕📍Yenibosna Yıldırım Beyazıt Cad. 8.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // Her 3 saniyede bir geçiş

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MenuHero />

      {/* Dashboard Toggle */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowDashboard(true)}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${showDashboard
              ? 'bg-brand-secondary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setShowDashboard(false)}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${!showDashboard
              ? 'bg-brand-secondary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Kampanyalar
          </button>
        </div>

        {showDashboard ? (
          <RewardsDashboard />
        ) : (
          <>
            {/* Campaign Section */}
            <div className="bg-[#f1f8f5] rounded-lg overflow-hidden shadow-lg">
              <div className="md:flex">
                <div className="md:w-1/2 p-8 md:p-12">
                  <h2 className="text-3xl font-bold text-brand-secondary mb-4">
                    Özel Kampanya
                  </h2>
                  <div className="space-y-4 text-lg text-gray-700 mb-6">
                    <p>🎉 <span className="font-semibold">Günün 2. Kahvesi %50 İndirimli!</span></p>
                    <p>☕ İlk kahveden 1 saat sonra...</p>
                    <p>🎁 2. içeceğiniz %50 indirimli!</p>
                    <p className="text-sm text-gray-500 mt-2">Kampanya 31 Aralık 2026 tarihine kadar geçerlidir.</p>
                  </div>
                  <Link href="/menu" className="inline-block bg-brand-secondary text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-primary transition-colors text-center">
                    Hemen Sipariş Ver
                  </Link>
                </div>
                <div className="md:w-1/2 bg-[#d4e9e2] p-8">
                  <div className="relative w-full h-64 md:h-full">
                    {slides.map((slide, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                          }`}
                      >
                        <Image
                          src={slide}
                          alt={`Instagram Görsel ${index + 1}`}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    ))}

                    {/* Slayt İndikatörleri */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-3 h-3 rounded-full transition-colors duration-200 ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                            }`}
                          aria-label={`Slayt ${index + 1}'e git`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center text-brand-secondary mb-12">Nasıl Çalışır?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    number: '1',
                    title: 'Üye Ol',
                    description: 'ProBrew Rewards\'a ücretsiz üye olun.'
                  },
                  {
                    number: '2',
                    title: 'Puan Topla',
                    description: 'Her alışverişinizde puan kazanın.'
                  },
                  {
                    number: '3',
                    title: 'Ödülleri Keşfet',
                    description: 'Kazandığınız puanlarla ödüllerinizi alın.'
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-brand-secondary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
