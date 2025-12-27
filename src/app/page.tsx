'use client';

import { useState } from 'react';
import {
  FaRocket,
  FaChartLine,
  FaQrcode,
  FaConciergeBell,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaCoffee,
  FaLayerGroup,
  FaCloud,
  FaLock
} from 'react-icons/fa';

export default function Home() {
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('success');
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#2A1B15] font-sans selection:bg-[#D4A373] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDF5E6]/80 backdrop-blur-md border-b border-[#2A1B15]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2A1B15] rounded-xl flex items-center justify-center text-white text-xl font-black">P</div>
              <span className="text-2xl font-black tracking-tighter text-[#2A1B15]">PROBREW</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-bold hover:text-[#D4A373] transition-colors">Özellikler</a>
              <a href="#showcase" className="text-sm font-bold hover:text-[#D4A373] transition-colors">Referanslar</a>
              <a href="#faq" className="text-sm font-bold hover:text-[#D4A373] transition-colors">SSS</a>
              <a href="#pricing" className="text-sm font-bold hover:text-[#D4A373] transition-colors">Fiyatlandırma</a>
              <a href="#demo" className="px-5 py-2.5 bg-[#2A1B15] text-white rounded-full text-sm font-bold hover:bg-[#3E2723] transition-all">Demo İste</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 lg:pt-56 lg:pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A1B15]/5 rounded-full text-[#3E2723] text-sm font-bold mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-[#D4A373] animate-pulse"></span>
            Yeni Nesil Kafe Otomasyon Sistemi
          </div>
          <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            İşletmenizi <span className="text-[#D4A373]">Profesyonel</span> <br />Seviyeye Taşıyın.
          </h1>
          <p className="text-xl lg:text-2xl text-[#3E2723]/70 max-w-3xl mx-auto mb-12 leading-relaxed">
            Sadece bir POS cihazı değil, kafenizin tüm operasyonlarını yöneten akıllı bir yol arkadaşı. Mutfaktan kasaya, stoktan sadakat programına her şey tek bir noktada.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <a href="#demo" className="px-10 py-5 bg-[#2A1B15] text-white font-black rounded-2xl hover:bg-[#3E2723] transition-all transform hover:scale-105 shadow-2xl shadow-[#2A1B15]/20 flex items-center justify-center gap-3 text-lg">
              Hemen Başlayın <FaArrowRight />
            </a>
            <div className="flex items-center gap-4 px-6 text-sm font-bold text-[#3E2723]/60">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#FDF5E6] bg-gray-200"></div>)}
              </div>
              50+ İşletme Güveniyor
            </div>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-to-tr from-[#D4A373]/10 to-transparent rounded-full blur-[120px] -z-0"></div>
      </section>

      {/* Trust Section - NOCCA */}
      <section id="showcase" className="py-20 border-y border-[#2A1B15]/5 bg-white/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-black text-[#3E2723]/40 uppercase tracking-[0.2em] mb-10">GURURLA SUNARIZ</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-4">
              <FaCoffee className="text-4xl text-[#2A1B15]" />
              <span className="text-2xl font-black tracking-tighter">NOCCA COFFEE</span>
            </div>
            <div className="w-px h-8 bg-[#2A1B15]/10 hidden md:block"></div>
            <p className="text-lg font-medium italic text-[#3E2723]/70">
              "ProBrew sayesinde operasyonumuzu tamamen dijitalleştirdik ve müşteri memnuniyetini %40 artırdık."
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">
                Kafenizin Tüm Kontrolü <br />Parmaklarınızın Ucunda.
              </h2>
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#D4A373]/10 rounded-2xl flex items-center justify-center text-2xl text-[#D4A373]">
                    <FaCloud />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Bulut Tabanlı Erişim</h3>
                    <p className="text-[#3E2723]/60 italic">Mağazada olmanıza gerek yok. Siparişleri, ciroyu ve stokları dünyanın her yerinden anlık takip edin.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#D4A373]/10 rounded-2xl flex items-center justify-center text-2xl text-[#D4A373]">
                    <FaLayerGroup />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Hassas Reçete Yönetimi</h3>
                    <p className="text-[#3E2723]/60 italic">Her bir latte için kaç gram kahve, kaç ml süt gittiğini bilin. Fireyi sıfıra indirin, kârınızı maksimize edin.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#D4A373]/10 rounded-2xl flex items-center justify-center text-2xl text-[#D4A373]">
                    <FaConciergeBell />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Senfonik Mutfak Ekranı</h3>
                    <p className="text-[#3E2723]/60 italic">Hata payını ortadan kaldıran görsel ve sesli bildirimler ile mutfak akışını optimize edin.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#2A1B15] to-[#3E2723] rounded-[3rem] shadow-2xl p-10 flex flex-col justify-between text-white transform hover:rotate-2 transition-transform duration-500">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-nocca-green text-xs font-black uppercase mb-2">Anlık Ciro</div>
                    <div className="text-4xl font-black">₺14.250,00</div>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">📈</div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4A373]" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                  <div className="text-sm opacity-50">Son Güncelleme: 12:45</div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                    <div className="w-8 h-8 rounded-lg bg-white/10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR & Mobile Section */}
      <section className="py-32 bg-[#2A1B15] text-[#FDF5E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">Müşterilerinizi Şaşırtın.</h2>
          <p className="text-xl opacity-60 max-w-2xl mx-auto">Sıra beklemeden sipariş, temassız ödeme ve puan sistemiyle dijital çağın standartlarını belirleyin.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FaQrcode />, title: "Self-Order QR", desc: "Masadan saniyeler içinde sipariş verin." },
              { icon: <FaRocket />, title: "Trendyol Entegre", desc: "Tüm platform siparişleri tek bir ekranda." },
              { icon: <FaChartLine />, title: "Puan Sistemi", desc: "Müşterilerinizi sadık kahve severlere dönüştürün." },
              { icon: <FaShieldAlt />, title: "E-Fatura Uyumlu", desc: "Yasal tüm süreçlerle tam entegrasyon." }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all text-center">
                <div className="text-3xl text-[#D4A373] mb-6 flex justify-center">{f.icon}</div>
                <h4 className="text-xl font-bold mb-4">{f.title}</h4>
                <p className="text-sm opacity-60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center mb-16">Sıkça Sorulan Sorular</h2>
          <div className="space-y-6">
            {[
              { q: "Sistemi kullanmak için özel bir donanım gerekiyor mu?", a: "Hayır. ProBrew bulut tabanlıdır; herhangi bir tablet, bilgisayar veya akıllı telefondan anında kullanmaya başlayabilirsiniz." },
              { q: "Trendyol ve Yemeksepeti siparişleri kafa karıştırır mı?", a: "Tam tersi! Tüm platform siparişlerini tek merkezde topluyoruz, mutfak ekranında saniyeler içinde beliriyor." },
              { q: "İnternet kesilirse ne olur?", a: "Çevrimdışı çalışma modumuz sayesinde sipariş almaya devam edebilir, internet geldiğinde verilerinizi eşitleyebilirsiniz." },
              { q: "Verilerimiz güvende mi?", a: "Evet. Tüm verileriniz banka düzeyinde şifreleme ile Vercel ve AWS üzerinde yedekli olarak saklanmaktadır." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#2A1B15]/5">
                <h4 className="text-lg font-bold mb-3 flex gap-3 text-[#2A1B15]">
                  <span className="text-[#D4A373]">Q:</span> {item.q}
                </h4>
                <p className="text-[#3E2723]/70 leading-relaxed pl-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 bg-white border-y border-[#2A1B15]/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-black text-[#3E2723]/30 uppercase tracking-[0.2em] mb-12">GÜVENDİĞİMİZ TEKNOLOJİLER</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            <span className="text-2xl font-black">Next.js</span>
            <span className="text-2xl font-black">Prisma</span>
            <span className="text-2xl font-black">PostgreSQL</span>
            <span className="text-2xl font-black">TailwindCSS</span>
            <span className="text-2xl font-black">Vercel</span>
          </div>
        </div>
      </section>

      {/* Demo Form Section */}
      <section id="demo" className="py-32 bg-white relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FDF5E6] rounded-[4rem] p-10 lg:p-20 shadow-xl relative overflow-hidden">
            {formStatus === 'success' ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8">
                  <FaCheckCircle />
                </div>
                <h3 className="text-3xl font-black mb-4">Mükemmel!</h3>
                <p className="text-xl text-[#3E2723]/60">Sizinle 24 saat içinde iletişime geçeceğiz. Kahvenizi hazırlayın.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-4xl lg:text-5xl font-black mb-6">Demo Yolculuğunuz <br />Bugün Başlıyor.</h2>
                  <p className="text-lg text-[#3E2723]/60 italic font-medium">Uzmanlarımız işletmenizi incelesin, en uygun çözümü sunalım.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required type="text" placeholder="Ad Soyad" className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373] outline-none font-medium shadow-sm" />
                    <input required type="text" placeholder="İşletme Adı" className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373] outline-none font-medium shadow-sm" />
                  </div>
                  <input required type="email" placeholder="E-posta" className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373] outline-none font-medium shadow-sm" />
                  <input required type="tel" placeholder="Telefon" className="w-full px-6 py-4 bg-white rounded-2xl border-none ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373] outline-none font-medium shadow-sm" />
                  <button type="submit" className="w-full py-5 bg-[#2A1B15] text-white font-black text-xl rounded-2xl hover:bg-[#3E2723] transition-all transform active:scale-95 shadow-lg shadow-[#2A1B15]/30">
                    DEMO TALEBİ GÖNDER
                  </button>
                </form>
              </>
            )}

            {/* Decoration */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D4A373]/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#FDF5E6] border-t border-[#2A1B15]/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#2A1B15] rounded-lg flex items-center justify-center text-white text-sm font-black">P</div>
            <span className="text-xl font-black tracking-tighter">PROBREW</span>
          </div>
          <p className="text-sm text-[#3E2723]/40">© 2025 ProBrew Software Systems. Tüm hakları saklıdır. <br /> Caddebostan, İstanbul.</p>
        </div>
      </footer>
    </div>
  );
}
