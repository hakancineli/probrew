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
  FaWhatsapp,
  FaTabletAlt,
  FaPrint,
  FaHeadset
} from 'react-icons/fa';

export default function Home() {
  const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('success');
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProBrew",
    "operatingSystem": "Web, Android, iOS",
    "applicationCategory": "BusinessApplication",
    "description": "Yeni Nesil Kafe & Restoran Otomasyon Sistemi",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "50"
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] text-[#2A1B15] font-sans selection:bg-[#D4A373] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/905432695442"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 font-bold px-6"
      >
        <FaWhatsapp className="text-2xl" /> <span>Hızlı Destek</span>
      </a>

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
              <a href="#integrations" className="text-sm font-bold hover:text-[#D4A373] transition-colors">Entegrasyonlar</a>
              <a href="#faq" className="text-sm font-bold hover:text-[#D4A373] transition-colors">SSS</a>
              <a href="#demo" className="px-5 py-2.5 bg-[#2A1B15] text-white rounded-full text-sm font-bold hover:bg-[#3E2723] transition-all">Ücretsiz Deneyin</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 lg:pt-56 lg:pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A1B15]/5 rounded-full text-[#3E2723] text-sm font-bold mb-8 animate-fade-in text-center">
            <span className="flex h-2 w-2 rounded-full bg-[#D4A373] animate-pulse"></span>
            Kafenizin Yeni Beyniyle Tanışın
          </div>
          <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
            Karmaşıklığı Bitirin, <br /><span className="text-[#D4A373]">Kâra Odaklanın.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-[#3E2723]/70 max-w-3xl mx-auto mb-12 leading-relaxed">
            Eski nesil POS sistemlerinin yarattığı stok kaçaklarına ve yavaşlığa son verin. ProBrew ile operasyonunuzu saniyeler içinde dijitalleştirin.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <a href="#demo" className="px-10 py-5 bg-[#2A1B15] text-white font-black rounded-2xl hover:bg-[#3E2723] transition-all transform hover:scale-105 shadow-2xl shadow-[#2A1B15]/20 flex items-center justify-center gap-3 text-lg">
              Demoyu İncele <FaArrowRight />
            </a>
            <a href="https://wa.me/905432695442" className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#2A1B15] font-black rounded-2xl border-2 border-[#2A1B15]/10 hover:border-[#2A1B15] transition-all text-lg">
              <FaWhatsapp className="text-[#25D366]" /> Satış Ekibine Yazın
            </a>
          </div>
        </div>
      </section>

      {/* ROI Section - Why ProBrew? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Neden ProBrew'e Geçmelisiniz?</h2>
            <p className="text-lg opacity-60">Bir yazılımdan fazlası, işletme maliyetlerinizi düşüren bir yatırım.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-8 rounded-[3rem] bg-[#FDF5E6]/50 border border-[#2A1B15]/5">
              <div className="w-14 h-14 bg-[#2A1B15] text-[#D4A373] rounded-2xl flex items-center justify-center text-3xl mb-6">
                <FaChartLine />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-black">%25'e Varan Tasarruf</h3>
              <p className="text-[#3E2723]/70 leading-relaxed font-medium">Hassas reçete takibi ve otomatik stok düşümü ile hammadde zayiatının ve kaçakların önüne geçin.</p>
            </div>
            <div className="p-8 rounded-[3rem] bg-[#FDF5E6]/50 border border-[#2A1B15]/5">
              <div className="w-14 h-14 bg-[#2196F3] text-white rounded-2xl flex items-center justify-center text-3xl mb-6">
                <FaRocket />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-black">X2 Sipariş Hızı</h3>
              <p className="text-[#3E2723]/70 leading-relaxed font-medium">Garson-Mutfak iletişimini saniyeler indirgeyin. Siparişlerin masaya ulaşma süresini yarı yarıya düşürün.</p>
            </div>
            <div className="p-8 rounded-[3rem] bg-[#FDF5E6]/50 border border-[#2A1B15]/5">
              <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-6">
                <FaShieldAlt />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-black">Sıfır Donanım Maliyeti</h3>
              <p className="text-[#3E2723]/70 leading-relaxed font-medium">Özel terminallere binlerce dolar harcamayın. Mevcut tablet ve telefonlarınızı anında terminale dönüştürün.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-[#2A1B15] text-[#FDF5E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="text-[#D4A373] font-black mb-4 uppercase tracking-widest text-sm">TAM ENTEGRASYON</div>
              <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Mevcut Araçlarınızla <br />Tam Uyumlu.</h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  "Trendyol Go", "Yemeksepeti", "Getir Yemek", "E-Fatura / E-Arşiv", "Beko X30TR", "Geniş Yazıcı Desteği"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <FaCheckCircle className="text-[#D4A373]" />
                    <span className="font-bold text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-[#FF6000] p-10 rounded-[3rem] flex items-center justify-center min-h-[160px] shadow-xl">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Trendyol_logo.svg" alt="Trendyol" className="h-10 invert brightness-0" />
                </div>
                <div className="bg-[#ea004b] p-10 rounded-[3rem] flex items-center justify-center min-h-[160px] shadow-xl">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/62/Yemeksepeti_logo.svg" alt="Yemeksepeti" className="h-8 invert brightness-0" />
                </div>
              </div>
              <div className="pt-12 space-y-4">
                <div className="bg-[#5d3ebd] p-10 rounded-[3rem] flex items-center justify-center min-h-[160px] shadow-xl">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Getir_logo.svg" alt="Getir" className="h-10" />
                </div>
                <div className="bg-[#FDF5E6] text-[#2A1B15] p-10 rounded-[3rem] flex flex-col items-center justify-center min-h-[160px] shadow-xl border border-[#2A1B15]/5">
                  <span className="text-3xl font-black">E-Fatura</span>
                  <span className="text-xs font-bold opacity-40 uppercase tracking-widest mt-2">Tam Uyum</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware & Support Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[#D4A373]/20 rounded-[4rem] blur-[100px] -z-10"></div>
              <div className="bg-[#FDF5E6] p-12 rounded-[4rem] border border-[#2A1B15]/5 shadow-2xl">
                <div className="flex gap-4 mb-8">
                  <div className="w-4 h-4 rounded-full bg-red-400"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                    <FaTabletAlt className="text-3xl text-[#2A1B15]" />
                    <span className="font-bold">IOS / Android Tabletler</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                    <FaPrint className="text-3xl text-[#2A1B15]" />
                    <span className="font-bold">Termal Fiş Yazıcıları</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
                    <FaHeadset className="text-3xl text-[#2A1B15]" />
                    <span className="font-bold">7/24 Teknik Destek Hattı</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Cihaz Seçmez, <br />Sorun Çıkarmaz.</h2>
              <p className="text-lg text-[#3E2723]/70 mb-10 leading-relaxed font-medium">
                Sizi belirli bir donanıma hapsetmiyoruz. Elinizdeki mevcut Android veya IOS tabletleri sisteme saniyeler içinde dahil edebilirsiniz. Üstelik bir sorun yaşarsanız, ekibimiz 7/24 telefonun ucunda.
              </p>
              <div className="flex items-center gap-4 p-6 bg-[#2A1B15] text-[#FDF5E6] rounded-[2rem]">
                <div className="w-12 h-12 bg-[#D4A373] rounded-full flex items-center justify-center text-2xl text-[#2A1B15]">
                  <FaHeadset />
                </div>
                <div>
                  <div className="text-sm opacity-60 font-bold uppercase tracking-widest leading-none mb-1">DESTEK HATTI</div>
                  <div className="text-xl font-black">0850 000 00 00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center mb-16">İşletme Sahiplerinin Merak Ettikleri</h2>
          <div className="space-y-6">
            {[
              { q: "Kurulum süreci ne kadar sürüyor?", a: "Uzman ekibimiz menünüzü ve stoklarınızı sisteme aynı gün içinde tanımlar. Ertesi sabah satışa hazır olursunuz." },
              { q: "Maliyetler neden bu kadar uygun?", a: "Bulut tabanlı mimarimiz sayesinde yerinde sunucu (server) maliyetlerini ortadan kaldırıyoruz. Siz sadece yazılım hizmeti için ödeme yapıyorsunuz." },
              { q: "Garsonlarım sistemi kolayca öğrenebilir mi?", a: "Sistemimiz 'eğitimsiz kullanım' prensibiyle tasarlandı. Bir garsonun tüm süreci öğrenmesi ortalama 15 dakikadır." },
              { q: "Aynı anda birden fazla dükkanımı yönetebilir miyim?", a: "Evet! Tek bir panelden tüm şubelerinizin anlık cirosunu ve stok durumunu merkezi olarak görebilirsiniz." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#2A1B15]/5 hover:border-[#D4A373] transition-colors group cursor-default">
                <h4 className="text-lg font-bold mb-3 flex gap-3 text-[#2A1B15] group-hover:text-[#D4A373] transition-colors">
                  <span className="opacity-40">#</span> {item.q}
                </h4>
                <p className="text-[#3E2723]/70 leading-relaxed pl-7 font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA / Form */}
      <section id="demo" className="py-32 bg-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2A1B15] rounded-[4rem] p-10 lg:p-20 shadow-2xl relative overflow-hidden text-[#FDF5E6]">
            {formStatus === 'success' ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8">
                  <FaCheckCircle />
                </div>
                <h3 className="text-3xl font-black mb-4">Harika! Talebiniz Ulaştı.</h3>
                <p className="text-xl opacity-60">Sizinle 24 saat içinde iletişime geçeceğiz. ProBrew ailesine hoş geldiniz.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                  <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">Yarın Daha <br /><span className="text-[#D4A373]">Huzurlu</span> Açın.</h2>
                  <p className="text-xl opacity-60 mb-10 leading-relaxed italic">"Kasada açık kaldı mı? Stok bitti mi? Mutfak yetişiyor mu?" sorularını tarihe gömüyoruz.</p>
                  <ul className="space-y-4 font-bold">
                    <li className="flex items-center gap-3"><FaCheckCircle className="text-[#D4A373]" /> Ücretsiz Kurulum Desteği</li>
                    <li className="flex items-center gap-3"><FaCheckCircle className="text-[#D4A373]" /> İlk 15 Gün Para İade Garantisi</li>
                    <li className="flex items-center gap-3"><FaCheckCircle className="text-[#D4A373]" /> Gizli Ücretlendirme Yok</li>
                  </ul>
                </div>
                <div className="bg-[#FDF5E6] p-10 rounded-[3rem] text-[#2A1B15]">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <input required type="text" placeholder="Ad Soyad" className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none font-bold shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373]" />
                    <input required type="text" placeholder="İşletme Adı" className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none font-bold shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373]" />
                    <input required type="tel" placeholder="Telefon (05...)" className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none font-bold shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-[#D4A373]" />
                    <button type="submit" className="w-full py-5 bg-[#2A1B15] text-white font-black text-xl rounded-2xl hover:bg-[#3E2723] transition-all transform active:scale-95">
                      HEMEN BAŞLAYALIM
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#FDF5E6] border-t border-[#2A1B15]/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className="w-8 h-8 bg-[#2A1B15] rounded-lg flex items-center justify-center text-white text-sm font-black">P</div>
                <span className="text-xl font-black tracking-tighter uppercase">PROBREW</span>
              </div>
              <p className="text-sm text-[#3E2723]/40 font-bold">Kafenizin yeni dijital işletim sistemi. <br /> Caddebostan, İstanbul.</p>
            </div>
            <div className="flex justify-center gap-10 font-black text-sm text-[#3E2723]/60">
              <a href="#features" className="hover:text-[#D4A373] transition-colors">Özellikler</a>
              <a href="#integrations" className="hover:text-[#D4A373] transition-colors">Entegrasyonlar</a>
              <a href="#faq" className="hover:text-[#D4A373] transition-colors">Destek</a>
            </div>
            <div className="flex justify-center md:justify-end gap-5">
              <div className="w-10 h-10 bg-[#2A1B15]/5 rounded-full flex items-center justify-center text-xl hover:bg-[#D4A373] hover:text-white transition-all cursor-pointer">
                <FaWhatsapp />
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#2A1B15]/5 text-center text-xs text-[#3E2723]/20 font-bold uppercase tracking-widest">
            © 2025 PROBREW SOFTWARE SYSTEMS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
