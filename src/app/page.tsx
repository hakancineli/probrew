'use client';

import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiLayers, FiTrendingUp, FiSettings, FiUsers, FiShoppingBag, FiArrowRight, FiSmartphone, FiPieChart, FiCpu, FiGlobe, FiTarget, FiZap, FiLayout, FiShield, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.2 }
  };
  const showcaseItems = [
    {
      title: 'Akıllı POS Terminali',
      tag: 'DONANIM & YAZILIM',
      desc: 'Mermer tezgahlara yakışan estetik, bulutun hızıyla birleşti. Çevrimdışı bile tıkır tıkır çalışır.',
      img: '/images/showcase/pos-terminal.png',
      color: 'bg-brand-primary'
    },
    {
      title: 'Hız Tutkunu KDS',
      tag: 'MUTFAK SİSTEMİ',
      desc: 'Siparişi mutfağa saniyeler içinde iletin. Hazırlık sürelerini takip edin, zayiata son verin.',
      img: '/images/showcase/kitchen-display.png',
      color: 'bg-orange-500'
    },
    {
      title: 'Dijital Masa Siparişi',
      tag: 'DENEYİM',
      desc: 'Müşterileriniz masadaki QR kodu okutarak anında sipariş verir, mutfağa saniyeler içinde iletilir. Garson beklemek tarihe karışıyor.',
      img: '/images/showcase/qr-menu.png',
      color: 'bg-emerald-500'
    },
    {
      title: 'Personel Tableti',
      tag: 'MOBİLİTE',
      desc: 'Garsonlar için optimize edilmiş taşınabilir güç. Stok durumunu anlık görün, hata payını sıfırlayın.',
      img: '/images/showcase/staff-steps/step-screenshot.png',
      color: 'bg-indigo-600'
    },
    {
      title: 'Sadakat Ekranı',
      tag: 'REWARDS',
      desc: 'Müşterilerinizi tanıyan tek POS. Kişiye özel puanlar ve ödüllerle sadakati %40 artırın.',
      img: '/images/showcase/customer-display.png',
      color: 'bg-pink-600'
    },
    {
      title: 'Benzersiz Masa QR Kodları',
      tag: 'OPERASYON',
      desc: 'Her masa için saniyeler içinde özel QR kod oluşturun ve yazdırın. Müşterileriniz anında dijital dünyanıza erişsin.',
      img: '/images/showcase/qr-steps/step-2.png',
      color: 'bg-blue-500'
    },
    {
      title: 'Mobil Garson Çağırma Sistemi',
      tag: 'İLETİŞİM',
      desc: 'Müşteriniz butona bastığında tüm panellerinizde anlık uyarı görün. Servis kalitesini ve hızını maksimize edin.',
      img: '/images/showcase/waiter-call/step-1.png',
      color: 'bg-orange-600'
    },
    {
      title: 'Uçtan Uca Dijital Sipariş',
      tag: 'OTOMASYON',
      desc: 'Siparişler masadan mutfağa, mutfaktan kasaya otomatik akar. İnsan hatasını sıfırlayın, verimliliği artırın.',
      img: '/images/showcase/inventory-steps/step-4.png',
      color: 'bg-indigo-700'
    },
    {
      title: 'Hızlı Masa Taşıma & Birleştirme',
      tag: 'ESNEKLİK',
      desc: 'Müşterileriniz yer değiştirdiğinde tek tıkla tüm hesabı yeni masaya aktarın veya masaları birleştirin. Karmaşıklığa son verin.',
      img: '/images/showcase/pos-steps/step-4.png',
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans selection:bg-brand-primary selection:text-white">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ProBrew",
            "operatingSystem": "Web, iOS, Android, Windows",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TRY"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "520"
            }
          })
        }}
      />
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #3E2723 !important;
          opacity: 0.2;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px !important;
          border-radius: 4px !important;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
      <Navbar />

      <main className="overflow-x-hidden">
        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-left lg:col-span-5"
              >
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black mb-8 border border-brand-primary/20 tracking-wider">
                  <FiZap className="animate-pulse" />
                  <span>PREMIUM RESTORAN OTOMASYONU</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-brand-dark leading-[0.9] mb-8 tracking-tighter">
                  Kafe POS ve <br />
                  <span className="text-brand-primary">Restoran Yönetiminde Yeni Nesil Standart.</span>
                </h1>

                <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                  Hantal sistemlerle vakit kaybetmeyin. ProBrew, yapay zeka destekli altyapısıyla işletmenizin her hücresini tek bir ekranda birleştirir.
                </p>

                <div className="flex flex-col sm:flex-row gap-5">
                  <Link href="/login?register=true" className="px-10 py-5 bg-brand-dark text-white rounded-2xl font-black text-lg hover:scale-[1.03] active:scale-[0.97] transition-all shadow-2xl shadow-brand-dark/30 flex items-center justify-center space-x-3 group">
                    <span>15 Gün Ücretsiz Deneyin</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/contact" className="px-10 py-5 bg-white border border-gray-100 text-brand-dark rounded-2xl font-black text-lg hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 shadow-xl">
                    <span>Özel Teklif Alın</span>
                  </Link>
                </div>

                <div className="mt-12 flex items-center space-x-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-[3px] border-white shadow-xl overflow-hidden bg-gray-100 relative group/avatar">
                        <img 
                          src={`/images/avatars/avatar-${i}.png`} 
                          alt={`Müşteri ${i}`} 
                          className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                          onError={(e) => { (e.target as any).src = `https://i.pravatar.cc/100?u=probrew${i}`; }}
                        />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-[3px] border-white bg-brand-primary text-white flex items-center justify-center text-[10px] font-black shadow-xl z-10">
                      +500
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-black text-brand-dark mb-1">500+ İşletme Güveniyor</p>
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(i => <FiZap key={i} size={14} className="fill-amber-500" />)}
                      <span className="ml-2 text-gray-400 font-bold text-xs">4.9 / 5.0 Memnuniyet</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative group lg:col-span-7 lg:-mr-24"
              >
                {/* Real Rendered Product Photography - Enlarged */}
                <div className="relative z-0 rounded-[4rem] overflow-hidden shadow-[0_70px_140px_-30px_rgba(0,0,0,0.6)] border-[12px] border-white bg-white">
                  <img
                    src="/images/showcase/hero-barista-pos.png?v=3"
                    alt="ProBrew Premium Customer Display"
                    className="w-full h-auto transform hover:scale-110 transition-transform duration-[2000ms] ease-out"
                  />
                  {/* Live Indicator Overlay */}
                  <div className="absolute top-10 left-10 flex items-center space-x-3 px-5 py-2.5 rounded-full bg-brand-dark/90 backdrop-blur-xl text-white border border-white/20 shadow-2xl">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-black tracking-widest uppercase">Müşteri Ekranı CANLI</span>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>
              </motion.div>
            </div>
          </div>

          {/* Background Text Overlay */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20vw] font-black text-gray-100/5 select-none pointer-events-none -z-10 tracking-tighter">
            PROBREW
          </div>
        </section>

        {/* --- REAL UI SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                Karmaşadan Uzak, <span className="text-brand-primary">Kullanıcı Dostu</span> Arayüz.
              </h2>
              <p className="text-lg text-gray-400 font-medium">
                Personelinizin dakikalar içinde ustalaşacağı, hatasız ve ultra hızlı kasa modunu keşfedin.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[16/9]"
                  >
                    {[
                      { src: '/images/showcase/pos-steps/step-1.png', alt: 'Kasa Giriş ve Ürün Listesi' },
                      { src: '/images/showcase/pos-steps/step-2.png', alt: 'Varyasyon ve Boyut Seçimi' },
                      { src: '/images/showcase/pos-steps/step-3.png', alt: 'Sepet Yönetimi ve Notlar' },
                      { src: '/images/showcase/pos-steps/step-4.png', alt: 'Personel Onay Mekanizması' },
                      { src: '/images/showcase/pos-steps/step-5.png', alt: 'Özel Tasarım Adisyon Çıktısı', contain: true }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className={`w-full h-full ${step.contain ? 'object-contain' : 'object-cover'}`}
                          />
                          <div className="absolute bottom-10 left-10 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{idx + 1}. ADIM</span>
                            <p className="text-sm font-bold text-slate-900">{step.alt}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>


            </motion.div>
          </div>
        </section>

        {/* --- CUSTOMER DISPLAY VIDEO SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-[#FAF9F6] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-5"
              >
                <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black mb-6 border border-indigo-200 tracking-widest uppercase">
                  MÜŞTERİ DENEYİMİ
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-6 tracking-tighter leading-tight">
                  Kasa Önünde <br/><span className="text-indigo-600">Premium Karşılama.</span>
                </h2>
                <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                  İkinci ekran (Customer Display) ile müşterileriniz siparişlerini anlık takip etsin. Kurumsal videolarınızı, güncel kampanyalarınızı ve Wi-Fi şifrenizi şık bir şekilde gösterin.
                </p>

                <div className="grid grid-cols-1 gap-6">
                  {[
                    { title: 'Şeffaf Ödeme Süreci', desc: 'Müşteriler sepet içeriğini ve toplamı anlık görür, hatalar önlenir.' },
                    { title: 'Dinamik Kampanya Yönetimi', desc: 'İsterseniz video, isterseniz afişlerle satışlarınızı artırın.' },
                    { title: 'Dijital Fiş & QR', desc: 'Kağıt israfına son! Müşterileriniz fişini telefonuna anında indirsin.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black shrink-0 mt-1">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-none mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-400 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:col-span-7 relative"
              >
                <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                  <div className="bg-black rounded-[1rem] overflow-hidden relative group">
                    <Swiper
                      modules={[Autoplay, Pagination, EffectFade]}
                      effect="fade"
                      spaceBetween={0}
                      slidesPerView={1}
                      autoplay={{ delay: 6000, disableOnInteraction: false }}
                      pagination={{ clickable: true }}
                      loop={true}
                      className="w-full aspect-[16/9]"
                    >
                      <SwiperSlide>
                        <div className="relative w-full h-full bg-black">
                          <video
                            src="/videos/showcase/customer-display.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Canlı Deneyim
                          </div>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="relative w-full h-full bg-gray-50">
                          <img
                            src="/images/showcase/customer-display/step-1.png"
                            alt="Şeffaf Ödeme Süreci - Müşteri Sepet Görünümü"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-10 left-10 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">ŞEFFAF ÖDEME</span>
                            <p className="text-sm font-bold text-slate-900">Müşteriler sepeti anlık takip eder</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    </Swiper>
                  </div>
                </div>

                {/* Decorative gradients */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- KDS UI SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-[#FAF9F6] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Mutfak ile <span className="text-orange-500">Kesintisiz</span> İletişim.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Geleneksel fiş yazıcılarının karmaşasından kurtulun. Hızlı, şeffaf ve ölçülebilir bir mutfak yönetimine geçin.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[1024/536]"
                  >
                    {[
                      { src: '/images/showcase/kds-steps/new-step-1.png', alt: 'Mutfak Ekranı Canlı Sipariş Takibi' },
                      { src: '/images/showcase/kds-steps/new-step-4.png', alt: 'Personel Hazırlık Başlangıç Onayı' },
                      { src: '/images/showcase/kds-steps/new-step-2.png', alt: 'Sipariş Hazırlanıyor Durumu' },
                      { src: '/images/showcase/kds-steps/new-step-3.png', alt: 'Sipariş Hazır Onayı (Yeşil Buton)' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full bg-[#f8eadd]">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-contain"
                          />
                          <div className="relative md:absolute md:bottom-10 md:left-10 mt-4 md:mt-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl opacity-100 transition-opacity duration-300 mx-4 md:mx-0 text-center md:text-left">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest block mb-1">{idx + 1}. ADIM</span>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{step.alt}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Floating feature tags for KDS */}
              <div className="absolute top-32 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-orange-500 mb-2">
                  <FiZap className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Anlık İletişim</span>
                </div>
                <p className="text-sm font-bold text-gray-600">POS'tan girilen siparişler saniyeler içerisinde mutfak ekranına düşer.</p>
              </div>

              <div className="absolute top-72 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-orange-500 mb-2">
                  <FiTarget className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Hatasız Teslimat</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Hatalı ürün üretimini sonlandırın, performans raporlamalarını takip edin.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- INVENTORY & RECIPE SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Hammadde, Reçete ve <span className="text-emerald-600">Maliyet</span> Kontrolü.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Stok kayıplarına ve maliyet sürprizlerine son. Ürünlerinizin her granülünü kontrol altında tutun.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[16/9]"
                  >
                    {[
                      { src: '/images/showcase/inventory-steps/step-1.png', alt: 'Hammadde Stok Analizi' },
                      { src: '/images/showcase/inventory-steps/step-2.png', alt: 'Hızlı Hammadde Girişi ve Birimler' },
                      { src: '/images/showcase/inventory-steps/step-3.png', alt: 'Kapsamlı Ürün Filtreleme' },
                      { src: '/images/showcase/inventory-steps/step-4.png', alt: 'Detaylı Reçete Planlaması' },
                      { src: '/images/showcase/inventory-steps/step-5.png', alt: 'Ürün Kategori ve Varyasyonları' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-contain p-2 md:p-0"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Labels outside the frame */}
              <div className="relative md:absolute md:bottom-10 md:left-10 mt-8 md:mt-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl mx-4 md:mx-0 text-center md:text-left z-20">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block mb-1">PROBREW ENVANTER</span>
                <p className="text-sm font-bold text-slate-900 leading-tight">İşletmenizin her adımını uçtan uca kontrol edin.</p>
              </div>

              {/* Floating feature tags for Inventory */}
              <div className="absolute top-12 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                  <FiPieChart className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Kârlılık</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Her satışın maliyet hesabını porsiyonlara kadar ayrıntılı analiz edin.</p>
              </div>

              <div className="absolute top-72 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                  <FiLayers className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Stok Uyarıları</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Kritik stok eşiğindeki ürünleriniz için anında panel uyarısı alın.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- REPORTING & ANALYTICS SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-[#FAF9F6] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Veriyle <span className="text-indigo-600">Büyüyen</span> İşletmeler.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Anlık raporlar, net nakit akışı ve akıllı analizlerle işletmenizin nabzını her an, her yerden (mobilden de) tutun.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[16/9]"
                  >
                    {[
                      { src: '/images/showcase/dashboard-steps/step-1.png', alt: 'Aylık ve Günlük Finansal Hareketler' },
                      { src: '/images/showcase/dashboard-steps/step-2.png', alt: 'Gün Detayı & Anlık Sipariş Geçmişi' },
                      { src: '/images/showcase/dashboard-steps/step-3.png', alt: 'Detaylı Ürün Satış Raporları' },
                      { src: '/images/showcase/dashboard-steps/step-4.png', alt: 'Günlük Operasyonel Giderler Takibi' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-contain p-2 md:p-0"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Labels outside the frame */}
              <div className="relative md:absolute md:bottom-10 md:left-10 mt-8 md:mt-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl mx-4 md:mx-0 text-center md:text-left z-20">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block mb-1">PROBREW RAPORLAMA</span>
                <p className="text-sm font-bold text-slate-900 leading-tight">İşletmenizin nabzını her an, her yerden tutun.</p>
              </div>

              {/* Floating feature tags for Analytics */}
              <div className="absolute top-12 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                  <FiTrendingUp className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Büyüme</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Her bir masanın, günün ve personelin performansını grafiklerle kıyaslayın.</p>
              </div>

              <div className="absolute top-72 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                  <FiSmartphone className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Mobil Rapor</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Nerede olursanız olun, kasanızdaki her kuruş telefonunuzdan izlenebilir.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- STAFF PERFORMANCE SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Adil ve Ölçülebilir <span className="text-rose-600">Performans</span>.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                Hangi personeliniz daha çok satış yapıyor? Hangi ürünleri öneriyor? Ekibinizi verilerle yönetin ve ödüllendirin.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[16/9]"
                  >
                    {[
                      { src: '/images/showcase/staff-steps/step-1.png', alt: 'Personel Yetkilendirme ve Kasa Seçimi' },
                      { src: '/images/showcase/staff-steps/step-2.png', alt: 'Personel Satış ve Hasılat Analizi' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-contain p-2 md:p-0"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Labels outside the frame */}
              <div className="relative md:absolute md:bottom-10 md:left-10 mt-8 md:mt-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl mx-4 md:mx-0 text-center md:text-left z-20">
                <span className="text-xs font-black text-rose-600 uppercase tracking-widest block mb-1">PROBREW PERSONEL</span>
                <p className="text-sm font-bold text-slate-900 leading-tight">Takımınızı şeffaf ve ölçülebilir verilerle yönetin.</p>
              </div>

              {/* Floating feature tags for Staff */}
              <div className="absolute top-12 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-rose-600 mb-2">
                  <FiUsers className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Takım Ruhu</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Her çalışanın bireysel net hasılatını analiz edip primleri şeffaflaştırın.</p>
              </div>

              <div className="absolute top-72 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-rose-600 mb-2">
                  <FiCheckCircle className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Yetkilendirme</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Size özel şifrelerle kasanın, raporların ve mutfağın erişimini sınırlayın.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- CONSUMPTION & LOSS PREVENTION SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-[#FAF9F6] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Personel Tüketimi ve <span className="text-indigo-600">Kayıp Önleme</span>.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 İşletme içi tüketimi ve ikramları kayıt altına alın. Stok kayıplarını minimuma indirerek kârlılığınızı koruyun.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[16/9]"
                  >
                    {[
                      { src: '/images/showcase/kitchen/step-1.png', alt: 'Personel Tüketim Kaydı Ekranı' },
                      { src: '/images/showcase/staff-steps/step-consumption.png', alt: 'Personel Tüketim Takibi ve Analizi' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-contain p-2 md:p-0"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Labels outside the frame */}
              <div className="relative md:absolute md:bottom-10 md:left-10 mt-8 md:mt-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl mx-4 md:mx-0 text-center md:text-left z-20">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block mb-1">DİJİTAL KAYIT</span>
                <p className="text-sm font-bold text-slate-900 leading-tight">Personel tüketimlerini ve ikramları anında kayıt altına alın.</p>
              </div>

              {/* Floating tags for Consumption */}
              <div className="absolute top-12 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-indigo-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                  <FiShoppingBag className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Kontrol Sizde</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Tüm personel tüketimleri anında stoktan düşer ve raporlanır.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- AI ANALYTICS SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Yapay Zeka Destekli <span className="text-orange-500">Strateji</span>.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Gemini AI entegrasyonu ile stok ihtiyaçlarınızı öngörün, personel verimliliğini optimize edin ve yarının satışlarını bugünden tahmin edin.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-6xl mx-auto"
            >
              <div className="bg-gray-900 rounded-[2rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[4px] md:border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[16/9]"
                  >
                    {[
                      { src: '/images/showcase/analytics-steps/step-1.png', alt: 'AI Karar Destek Dashboard' },
                      { src: '/images/showcase/analytics-steps/step-2.png', alt: 'Karlılık ve Popülarite Matrisi' },
                      { src: '/images/showcase/analytics-steps/step-3.png', alt: 'Aylık Hammadde Tahmini' },
                      { src: '/images/showcase/analytics-steps/step-4.png', alt: 'Müşteri Hub & Geri Kazanım' },
                      { src: '/images/showcase/analytics-steps/step-5.png', alt: 'Saatlik Yoğunluk ve Vardiya Tavsiyesi' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-white">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-contain p-2 md:p-0"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Labels outside the frame */}
              <div className="relative md:absolute md:bottom-10 md:left-10 mt-8 md:mt-0 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl mx-4 md:mx-0 text-center md:text-left z-20">
                <span className="text-xs font-black text-orange-500 uppercase tracking-widest block mb-1">PROBREW PREMIUM AI</span>
                <p className="text-sm font-bold text-slate-900 leading-tight">Yapay zeka ile yarının satışlarını bugünden tahmin edin.</p>
              </div>

              {/* Floating tags */}
              <div className="absolute top-12 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-orange-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-orange-500 mb-2">
                  <FiCpu className="font-black text-xl" />
                  <span className="font-black text-xs uppercase tracking-widest">Gemini Altyapısı</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Karmaşık verileri tek bir saniyede anlamlı stratejilere dönüştürün.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- QR MENU & ORDERING SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-[#FAF9F6] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Müşterilerinizle <span className="text-amber-500">Dijital</span> Bağ Kurun.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Garson bekleme devrine son! Masadaki QR kodu okutan misafirleriniz iştah açıcı menünüzü incelesin ve hemen sipariş versin.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-[340px] mx-auto"
            >
              <div className="bg-gray-900 rounded-[2.5rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[2px] md:border-[6px] border-gray-800">
                <div className="bg-white rounded-[2rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[420/924]"
                  >
                    {[
                      { src: '/images/showcase/qr-steps/step-4.png', alt: 'Sipariş Onay ve Not Ekleme' },
                      { src: '/images/showcase/qr-steps/step-1.png', alt: 'Göz Alıcı Dijital Menü Girişi' },
                      { src: '/images/showcase/qr-steps/step-2.png', alt: 'Zengin Görselli Ürün Kategorileri' },
                      { src: '/images/showcase/qr-steps/step-3.png', alt: 'Tek Tuşla Sepete Ekleme' },
                      { src: '/images/showcase/qr-steps/step-5.png', alt: 'Siparişiniz Alındı Onayı' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-white">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-10 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-black text-amber-500 uppercase tracking-widest block mb-1">{idx + 1}. ADIM</span>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{step.alt}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Floating feature tags for QR Menu */}
              <div className="absolute top-24 -left-10 md:-left-64 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-amber-500 mb-2">
                  <FiSmartphone className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Kolay Sipariş</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Telefon kamerasından okutulan menüyle saniyeler içinde mutfağa sipariş yollayın.</p>
              </div>

              <div className="absolute top-80 -right-10 md:-right-64 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-amber-500 mb-2">
                  <FiZap className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Hızlı Garson</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Tek butona basarak ilgili masaya garson uyarısı gönderilmesini sağlayın.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- WAITER CALL SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-[#FAF9F6] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Masa Servisinde <span className="text-sky-500">Işık Hızı</span>.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Müşterileriniz garson aramak zorunda kalmasın! Tek bir dokunuşla masadan servis talebi gönderilsin, verimliliğiniz artsın.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-[340px] mx-auto"
            >
              <div className="bg-gray-900 rounded-[2.5rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[2px] md:border-[6px] border-gray-800">
                <div className="bg-white rounded-[2rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={false}
                    className="w-full aspect-[414/928]"
                  >
                    {[
                      { src: '/images/showcase/waiter-call/step-1.png', alt: 'Hızlı Garson Çağırma Onayı' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-white">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-10 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-black text-sky-500 uppercase tracking-widest block mb-1">MÜŞTERİ DENEYİMİ</span>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{step.alt}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Floating feature tags for Waiter Call */}
              <div className="absolute top-24 -left-10 md:-left-64 bg-[#F0F9FF] p-6 rounded-3xl shadow-2xl border border-sky-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-sky-600 mb-2">
                  <FiZap className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Sinyal Hızı</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Masa numarasıyla birlikte ilgili garsonun cihazına anında bildirim düşer.</p>
              </div>

              <div className="absolute top-80 -right-10 md:-right-64 bg-[#F0F9FF] p-6 rounded-3xl shadow-2xl border border-sky-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-sky-600 mb-2">
                  <FiClock className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Sıfır Bekleme</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Müşterileriniz sesini duyurmaya veya el sallamaya çalışmak zorunda kalmaz.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- FEEDBACK SHOWCASE --- */}
        <section className="md:py-24 pt-32 pb-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tighter">
                 Müşterilerinizin <span className="text-indigo-600">Sesi Olun</span>.
              </h2>
              <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto">
                 Geri bildirimleri anlık olarak toplayın, müşteri deneyimini mükemmelleştirin. Misafirlerinizden gelen her fikir işinizi büyütür.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" as const }}
              className="relative max-w-[340px] mx-auto"
            >
              <div className="bg-white rounded-[2.5rem] p-1 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-[2px] md:border-[6px] border-slate-100">
                <div className="bg-white rounded-[2rem] overflow-hidden group">
                  <Swiper
                    modules={[Autoplay, Pagination, EffectFade]}
                    effect="fade"
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={true}
                    className="w-full aspect-[414/928]"
                  >
                    {[
                      { src: '/images/showcase/feedback/step-1.png', alt: 'Öneri Bildirimi' },
                      { src: '/images/showcase/feedback/step-3.png', alt: 'Şikayet / Geri Bildirim' },
                      { src: '/images/showcase/feedback/step-4.png', alt: 'İletişim Bilgileri' },
                      { src: '/images/showcase/feedback/step-5.png', alt: 'Başarılı Gönderim Onayı' }
                    ].map((step, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="relative w-full h-full flex items-center justify-center bg-white">
                          <img
                            src={step.src}
                            alt={step.alt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-10 left-4 right-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block mb-1">MÜŞTERİ SESİ</span>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{step.alt}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>

              {/* Floating feature tags for Feedback */}
              <div className="absolute top-24 -left-10 md:-left-64 bg-white p-6 rounded-3xl shadow-2xl border border-indigo-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                  <FiLayers className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Kategorize Edin</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Şikayet, öneri veya dileklerinizi anlık olarak kategorilere ayırın.</p>
              </div>

              <div className="absolute top-80 -right-10 md:-right-64 bg-white p-6 rounded-3xl shadow-2xl border border-indigo-50 max-w-[220px] hidden lg:block z-10">
                <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                  <FiTrendingUp className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Performans Takibi</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Müşteri memnuniyetini grafiklerle izleyin, işletmenizi verilere dayanarak yönetin.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- DYNAMIC ECOSYSTEM SHOWCASE --- */}
        <section className="py-24 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeInUp} className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-brand-dark mb-6 tracking-tighter">
                Eksiksiz Bir <span className="text-brand-primary">Ekosistem</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
                Kasanızdan mutfağınıza, garsonunuzdan sadık müşterinize kadar her noktayı birbirine bağlayan kusursuz bir ağ.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {showcaseItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-50 flex flex-col group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                      <span className="text-[10px] font-black tracking-widest uppercase text-brand-dark">{item.tag}</span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-brand-dark mb-4">{item.title}</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6 flex-1">
                      {item.desc}
                    </p>
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <Link href="#solutions" className="text-brand-primary font-black text-sm flex items-center space-x-2 hover:opacity-70 group/btn">
                        <span>Detayları Gör</span>
                        <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* --- AI & ANALYTICS SECTION --- */}
        <section className="py-32 bg-brand-dark relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div {...fadeInUp}>
                <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white/10 text-brand-primary text-xs font-black mb-8">
                  <FiCpu />
                  <span>GEMINI AI ENTEGRASYONU</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-10 tracking-tighter">
                  İşletmenizi <br /> <span className="text-brand-primary">Öngörülerle</span> Yönetin.
                </h2>
                <ul className="space-y-6 text-white/70 text-lg font-medium">
                  <li className="flex items-center space-x-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                    <span>Yapay zeka ile haftalık stok ihtiyacı tahminleme.</span>
                  </li>
                  <li className="flex items-center space-x-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                    <span>Saatlik yoğunluk analizi ve personel optimizasyonu.</span>
                  </li>
                  <li className="flex items-center space-x-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                    <span>Müşteri alışkanlıklarına göre otomatik kampanya önerileri.</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="bg-white/5 rounded-[3rem] p-10 border border-white/10 backdrop-blur-xl"
              >
                <div className="space-y-6">
                  <div className="h-4 w-1/3 bg-white/10 rounded-full"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-brand-primary/20 rounded-2xl flex items-center justify-center">
                      <FiPieChart className="text-4xl text-brand-primary" />
                    </div>
                    <div className="h-32 bg-white/5 rounded-2xl flex items-center justify-center">
                      <FiTrendingUp className="text-4xl text-emerald-500" />
                    </div>
                  </div>
                  <div className="h-40 bg-white/5 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-white font-bold text-sm">
                      <span>Satış Tahmini</span>
                      <span className="text-brand-primary">+%24</span>
                    </div>
                    <div className="flex items-end space-x-1 h-12">
                      {[40, 70, 50, 90, 60, 80, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-brand-primary/40 rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- BRANDING & TRUST SECTION --- */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div {...fadeInUp} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg">
                  <FiSettings size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Senin Markan, Senin Kuralların</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  İşletme logonuzdan ana renklerinize, fiş tasarımınızdan 6 farklı özel temaya kadar her detayı markanızın kimliğiyle eşleştirin.
                </p>
              </motion.div>

              <motion.div {...fadeInUp} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg">
                  <FiShield size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Hukuki Güvence Altındasınız</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Dinamik MSS ve KVKK altyapısı ile dijital satışlarınızı yasal zemine oturtun. Her siparişte hukuki onay mekanizması otomatik çalışır.
                </p>
              </motion.div>

              <motion.div {...fadeInUp} className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-brand-dark rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg">
                  <FiTarget size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Enterprise Seviye Güvenlik</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  SuperAdmin katmanı ve çok aşamalı şifre doğrulama protokolleri ile işletme verileriniz en üst düzeyde koruma altında tutulur.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Yıllık İşlem', value: '25M+' },
              { label: 'Aktif Şube', value: '1.200+' },
              { label: 'Destek Süresi', value: '2 Dakika' },
              { label: 'Veritabanı Hızı', value: '0.8sn' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-black text-brand-dark mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* --- COMPARISON (SIMPRA VS PROBREW) --- */}
        <section className="py-32 bg-[#FAF9F6]">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-black text-brand-dark mb-16 tracking-tighter leading-tight">
              Neden <span className="text-brand-primary hover:underline transition-all">Geleneksel</span> POS'lardan <br /> Farklıyız?
            </motion.h2>

            <div className="overflow-hidden rounded-[3rem] shadow-2xl bg-white border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-dark text-white">
                    <th className="p-8 font-black text-xl">Özellik</th>
                    <th className="p-8 font-black text-xl text-brand-primary">ProBrew</th>
                    <th className="p-8 font-black text-xl text-white/30">Klasik Sistemler</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 font-bold">
                  <tr className="border-b border-gray-50">
                    <td className="p-8">Yapay Zeka Tahminleme</td>
                    <td className="p-8 text-brand-primary"><FiCheckCircle className="text-2xl" /></td>
                    <td className="p-8 opacity-20"><FiX className="text-2xl" /></td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="p-8">Gerçek Zamanlı Bulut Senk.</td>
                    <td className="p-8 text-brand-primary"><FiCheckCircle className="text-2xl" /></td>
                    <td className="p-8 opacity-20"><FiCircle className="text-2xl" /></td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="p-8">Ücretsiz Entegrasyonlar</td>
                    <td className="p-8 text-brand-primary"><FiCheckCircle className="text-2xl" /></td>
                    <td className="p-8 opacity-20"><FiX className="text-2xl" /></td>
                  </tr>
                  <tr>
                    <td className="p-8">7/24 Teknik Destek</td>
                    <td className="p-8 text-brand-primary"><FiCheckCircle className="text-2xl" /></td>
                    <td className="p-8 text-emerald-500"><FiCheckCircle className="text-2xl" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto rounded-[4rem] bg-brand-primary p-12 md:p-24 text-center text-white relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]"
          >
            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-[ -0.05em] leading-[0.85]">
                Yarının İşletmesini <br /> Bugün İnşa Edin.
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                Saniyeler içinde kayıt olun, dakikalar içinde şubenizi aktif edin. Donanım zorunluluğu yok, karmaşa yok.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/login?register=true" className="px-12 py-6 bg-brand-dark text-white rounded-[2rem] font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                  15 Gün Ücretsiz Başlatın
                </Link>
                <Link href="/contact" className="px-12 py-6 bg-white text-brand-primary rounded-[2rem] font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                  Sizi Arayalım
                </Link>
              </div>
            </div>

            {/* Decorative graphic */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FiX(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function FiCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
