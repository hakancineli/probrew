import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiMonitor, FiCpu, FiSmartphone, FiPieChart, FiArrowRight, FiZap, FiLayout, FiShield, FiUsers, FiClock, FiGlobe } from 'react-icons/fi';
import { FaUsers, FaGlobe } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'ProBrew POS | Her Ölçekten İşletmeye Uygun Restoran Otomasyonu',
    description: 'Yeni nesil restoran ve kafe otomasyonu. POS, Mutfak Ekranı, QR Menü ve Mobil Raporlama hepsi bir arada.',
};

export default function PosPage() {
    const modules = [
        {
            title: 'Hızlı POS Ekranı',
            desc: 'Personelinizin eğitim almadan kullanabileceği kadar basit, her detayı yönetecek kadar güçlü. Karmaşık menüleri saniyeler içinde yönetin.',
            img: '/images/showcase/tablet-pos.png',
            icon: <FiMonitor />,
            color: 'bg-emerald-50'
        },
        {
            title: 'Müşteri Bilgilendirme Ekranı',
            desc: 'Sipariş özeti, toplam tutar ve sadakat puanlarını müşterinize anında gösterin. Markanıza özel kampanya duyuruları ile satışları artırın.',
            img: '/images/showcase/hero-barista-pos.png?v=3',
            icon: <FiUsers />,
            color: 'bg-blue-50'
        },
        {
            q: 'ProBrew kullanmak için özel bir donanım satın almalı mıyım?',
            a: 'Hayır, ProBrew bulut tabanlı bir sistemdir. Mevcut tabletlerinizde, Windows bilgisayarlarınızda veya Android/iOS tabanlı el terminallerinde doğrudan kullanabilirsiniz. Ancak profesyonel bir deneyim için önerdiğimiz entegre yazıcı ve ödeme terminalleri listesine göz atabilirsiniz.'
        },
        {
            title: 'Mutfak Yönetim Sistemi (KDS)',
            desc: 'Kağıt karmaşasına son. Siparişleri dijital panellerle mutfağa anında iletin, hazırlık sürelerini ölçün ve verimliliği artırın.',
            img: '/images/showcase/kitchen-display.png',
            icon: <FiZap />,
            color: 'bg-amber-50'
        },
        {
            title: 'Gelecek Nesil QR Menü',
            desc: 'Müşterileriniz masadan sipariş versin, ödeme yapsın. Garson yükünü %30 azaltın ve daha hızlı servis sunun.',
            img: '/images/showcase/qr-menu.png',
            icon: <FiLayout />,
            color: 'bg-rose-50'
        },
        {
            title: 'Sadakat ve Ödül (Rewards)',
            desc: 'Her kahve bir puan. Müşterilerinizi tanıyan ve geri getiren akıllı sadakat programı ile marka bağlılığı yaratın.',
            img: '/images/showcase/loyalty-display.png',
            icon: <FiShield />,
            color: 'bg-indigo-50'
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--brand-primary-light)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-primary-light/30 rounded-full text-brand-primary font-bold text-sm mb-8">
                        <FiClock className="animate-spin-slow" />
                        <span>Saniyeler İçinde Kurun ve Başlayın</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-brand-dark mb-8 tracking-tighter leading-[0.85]">
                        İşletmeniz İçin <br />
                        <span className="text-brand-primary">Tam Donanımlı</span> <br />
                        Otomasyon Çözümü.
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                        ProBrew POS, sadece bir kasa değil; işletmenizin kalbi, beyni ve en güvenilir personeli haline gelir.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="/login?register=true" className="px-10 py-5 bg-brand-dark text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl">
                            15 Gün Ücretsiz Deneyin
                        </a>
                        <button className="px-10 py-5 bg-white text-brand-dark border-2 border-gray-100 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all shadow-sm">
                            Özellikleri Keşfet
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Image Showcase */}
            <section className="max-w-7xl mx-auto px-4 -mt-10 mb-32 relative z-20">
                <div className="rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white bg-white">
                    <img
                        src="/images/showcase/hero-barista-pos.png?v=3"
                        alt="ProBrew POS Customer Display"
                        className="w-full h-auto"
                    />
                </div>
            </section>

            {/* Features Detail Loop */}
            <div className="max-w-7xl mx-auto px-4 pb-32 space-y-40">
                {modules.map((m, i) => (
                    <section key={i} className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-20 items-center`}>
                        <div className="flex-1 space-y-8">
                            <div className={`w-14 h-14 ${m.color} rounded-2xl flex items-center justify-center text-3xl text-brand-primary shadow-sm`}>
                                {m.icon}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">{m.title}</h2>
                            <p className="text-xl text-gray-600 font-medium leading-relaxed">
                                {m.desc}
                            </p>
                            <button className="flex items-center space-x-3 text-brand-primary font-black text-lg hover:translate-x-2 transition-transform group">
                                <span>Detaylı İncele</span>
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="flex-1 w-full h-[450px] md:h-[600px] relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white group">
                            {m.img ? (
                                <img
                                    src={m.img}
                                    alt={m.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <FiMonitor className="text-6xl text-brand-primary/20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    </section>
                ))}
            </div>

            {/* Analytics Preview Section */}
            <section className="bg-white py-32 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tight">Kusursuz Veri Analizi.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {[
                            { title: 'Ürün Bazlı Raporlar', desc: 'Hangi ürün ne kadar satıyor, ne kadar kar ettiriyor anında görün.', icon: <FiPieChart /> },
                            { title: 'Maliyet ve Kar', desc: 'Stok maliyetleri ile entegre gerçek zamanlı kar analizi.', icon: <FiZap /> },
                            {
                                title: 'Personel Yönetimi',
                                description: 'Garson ve mutfak personelinizin performansını, çalışma saatlerini ve verimliliğini anlık olarak ölçümleyin.',
                                icon: <FaUsers className="text-4xl text-brand-primary" />
                            },
                            {
                                title: 'Global Operasyon',
                                description: 'Çoklu dil, çoklu para birimi ve farklı ülkelerin mali mevzuatlarına tam uyumlu altyapı.',
                                icon: <FaGlobe className="text-4xl text-brand-primary" />
                            },
                            {
                                title: 'Bulut Tabanlı Raporlama',
                                description: 'İşletmenizin tüm verilerine dünyanın her yerinden anlık olarak erişin ve analiz edin.',
                                icon: <FiGlobe />
                            }
                        ].map((item, id) => (
                            <div key={id} className="p-10 rounded-[2.5rem] bg-gray-50 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-gray-100">
                                <div className="text-3xl text-brand-primary mb-6">{item.icon}</div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-600 font-medium">{item.desc || item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 bg-brand-dark text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">İşletmenizin Potansiyelini <br /><span className="text-brand-primary">Serbest Bırakın.</span></h2>
                    <p className="text-xl md:text-2xl text-white/60 mb-12 font-medium">
                        Bugün geçiş yapın, operasyonunuzu modernize edin ve müşteri deneyimini bir üst seviyeye taşıyın.
                    </p>
                    <a href="/login?register=true" className="inline-block px-12 py-7 bg-brand-primary text-white rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl active:scale-95">
                        15 Gün Ücretsiz Deneyin
                    </a>
                    <p className="mt-8 text-sm text-white/30 font-bold uppercase tracking-widest">Kredi kartı gerekmez • 14 gün ücretsiz deneme</p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
