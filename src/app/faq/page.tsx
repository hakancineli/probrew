import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Sıkça Sorulan Sorular | ProBrew Destek',
    description: 'ProBrew POS sistemi kurulumu, donanım uyumluluğu, ödeme yöntemleri ve lisanslama hakkında en çok sorulan sorular.',
    alternates: {
        canonical: 'https://www.probrew.com.tr/faq',
    },
};

export default function FAQPage() {
    const faqs = [
        {
            q: 'ProBrew kullanmak için özel bir donanım satın almalı mıyım?',
            a: 'Hayır, ProBrew bulut tabanlı bir sistemdir. Mevcut tabletlerinizde, Windows bilgisayarlarınızda veya Android/iOS tabanlı el terminallerinde doğrudan kullanabilirsiniz. Ancak profesyonel bir deneyim için önerdiğimiz entegre yazıcı ve ödeme terminalleri listesine göz atabilirsiniz.'
        },
        {
            q: 'İnternet kesildiğinde sistem çalışmaya devam eder mi?',
            a: 'Evet, ProBrew "Offline-First" mimarisi ile çalışır. İnternetiniz kesilse bile sipariş almaya ve adisyon açmaya devam edebilirsiniz. Bağlantı geldiğinde tüm verileriniz otomatik olarak buluta senkronize edilir.'
        },
        {
            q: 'Mevcut yemek sepeti, getir ve trendyol siparişlerimi tek panelden yönetebilir miyim?',
            a: 'Kesinlikle. ProBrew pazar yeri entegrasyonları sayesinde tüm online sipariş platformlarını tek bir ekranda toplar ve stoklarınızı otomatik olarak günceller.'
        },
        {
            q: 'Lisanslama modeli nasıldır?',
            a: 'Yıllık veya aylık abonelik modeli ile çalışıyoruz. Herhangi bir kurulum ücreti veya gizli maliyet yoktur. Şube sayınıza ve kullanmak istediğiniz ek modüllere (Envanter, AI Analiz vb.) göre esnek paketlerimiz mevcuttur.'
        },
        {
            q: 'Verilerimiz ne kadar güvende?',
            a: 'Verileriniz Google Cloud ve AWS sunucularında, banka seviyesinde şifreleme yöntemleri ile saklanmaktadır. Günlük otomatik yedekleme sayesinde veri kaybı riskini ortadan kaldırıyoruz.'
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <section className="bg-white py-32 px-4 shadow-sm">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-black mb-6 border border-brand-primary/20 tracking-widest">
                        YARDIM MERKEZİ
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-brand-dark mb-6 tracking-tighter leading-[0.85]">
                        Size Nasıl <br /><span className="text-brand-primary">Yardımcı Olabiliriz?</span>
                    </h1>
                    <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        ProBrew POS sistemi hakkındaki teknik ve ticari sorularınızın cevaplarını burada bulabilirsiniz.
                    </p>
                </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-32">
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-brand-primary hover:shadow-2xl transition-all duration-500">
                            <h3 className="text-2xl font-black text-brand-dark mb-6 group-hover:text-brand-primary transition-colors tracking-tight uppercase leading-tight">{faq.q}</h3>
                            <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-32 text-center bg-brand-dark rounded-[3rem] p-16 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')]"></div>
                    <div className="relative z-10">
                        <p className="text-xl text-gray-400 mb-8 font-medium">Hala sorularınız mı var?</p>
                        <h2 className="text-3xl md:text-4xl font-black mb-10 tracking-tight">Teknik ekibimizle doğrudan görüşün.</h2>
                        <a href="/contact" className="inline-block bg-brand-primary text-white px-12 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20">
                            CANLI DESTEK ALIN
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
