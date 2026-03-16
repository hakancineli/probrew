'use client';

import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTrendingUp, FiSettings, FiUsers, FiShoppingBag, FiArrowRight, FiSmartphone, FiPieChart, FiCpu, FiGlobe, FiTarget, FiZap, FiLayout } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

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
      img: '/images/showcase/tablet-pos.png',
      color: 'bg-indigo-600'
    },
    {
      title: 'Sadakat Ekranı',
      tag: 'REWARDS',
      desc: 'Müşterilerinizi tanıyan tek POS. Kişiye özel puanlar ve ödüllerle sadakati %40 artırın.',
      img: '/images/showcase/customer-display.png',
      color: 'bg-pink-600'
    }
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans selection:bg-brand-primary selection:text-white">
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
                  Kafe ve Restoran <br />
                  <span className="text-brand-primary">Yönetimini Sanata Dönüştürün.</span>
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

                <div className="mt-12 flex items-center space-x-6 text-gray-400">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"></div>
                    ))}
                  </div>
                  <p className="text-sm font-bold tracking-tight">500+ İşletme Güveniyor</p>
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
        <section className="py-24 bg-white relative overflow-hidden">
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
              {/* Device Frame Simulation */}
              <div className="bg-gray-900 rounded-[2rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-gray-800">
                <div className="bg-white rounded-[1rem] overflow-hidden">
                  <img
                    src="/images/showcase/admin-panel-ui.png"
                    alt="ProBrew Admin Dashboard"
                    className="w-full h-auto object-cover transform-gpu"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
              </div>

              {/* Floating feature tags */}
              <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block">
                <div className="flex items-center space-x-3 text-brand-primary mb-2">
                  <FiZap className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Süper Hızlı</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Tek tıkla ödeme ve parça parça tahsilat özelliği.</p>
              </div>

              <div className="absolute bottom-20 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 max-w-[200px] hidden lg:block">
                <div className="flex items-center space-x-3 text-brand-primary mb-2">
                  <FiLayout className="font-black" />
                  <span className="font-black text-xs uppercase tracking-widest">Görsel Menü</span>
                </div>
                <p className="text-sm font-bold text-gray-600">Ürün fotoğrafları ile hatasız sipariş yönetimi.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- DYNAMIC ECOSYSTEM SHOWCASE --- */}
        <section className="py-24 bg-white">
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
                  className="bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden border border-gray-50 flex flex-col group"
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
                      <Link href="/pos" className="text-brand-primary font-black text-sm flex items-center space-x-2 hover:opacity-70">
                        <span>Detayları Gör</span>
                        <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TABLE SERVICE REVOLUTION --- */}
        <section className="py-24 bg-brand-dark/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div {...fadeInUp} className="relative order-2 lg:order-1">
                <div className="bg-white rounded-[3rem] p-4 shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-900 flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="bg-white p-6 rounded-3xl mb-6 inline-block shadow-2xl">
                            <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-slate-800">
                                <span className="text-4xl font-black">QR</span>
                            </div>
                        </div>
                        <h4 className="text-white text-2xl font-black mb-2">Masa No: 12</h4>
                        <div className="flex justify-center gap-2">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-widest uppercase">AKTİF</span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black tracking-widest uppercase">DİJİTAL SİPARİŞ</span>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 -right-10 -translate-y-1/2 bg-slate-900 p-6 rounded-3xl shadow-2xl text-white max-w-[240px] border border-white/10 hidden lg:block">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <FiSmartphone />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest">YENİ BİLDİRİM</span>
                    </div>
                    <p className="text-sm font-bold text-slate-300 mb-3">Masa 12 garson çağırıyor! 🔔</p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
                </div>
              </motion.div>

              <motion.div {...fadeInUp} className="order-1 lg:order-2">
                <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-xs font-black mb-8">
                  <FiLayout />
                  <span>MASA SERVİS DEVRİMİ</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-brand-dark leading-[0.9] mb-8 tracking-tighter">
                    Masadan Sipariş, <br />
                    <span className="text-blue-600">Tek Tıkla Garson.</span>
                </h2>
                <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                  Masaya servis yapan işletmeler için özel olarak tasarlandı. Kağıt menü maliyetinden kurtulun, garson verimliliğini %50 artırın.
                </p>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FiTarget size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-brand-dark">Benzersiz Masa QR Kodları</h4>
                            <p className="text-sm text-gray-400 font-medium">Her masa için saniyeler içinde özel QR kod oluşturun ve yazdırın.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FiSmartphone size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-brand-dark">Mobil Garson Çağırma Sistemi</h4>
                            <p className="text-sm text-gray-400 font-medium">Müşteriniz butona bastığında tüm panellerinizde anlık uyarı görün.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <FiShoppingBag size={24} />
                        </div>
                        <div>
                            <h4 className="font-black text-brand-dark">Uçtan Uca Dijital Sipariş</h4>
                            <p className="text-sm text-gray-400 font-medium">Siparişler masadan mutfağa, mutfaktan kasaya otomatik akar.</p>
                        </div>
                    </div>
                </div>
              </motion.div>
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
