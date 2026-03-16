import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Hakkımızda | ProBrew Technology Group',
    description: 'ProBrew\'nin hikayesi, misyonu ve vizyonu. Kafe ve restoranlar için teknoloji üreten tutkulu ekibimizle tanışın.',
    alternates: {
        canonical: 'https://www.probrew.com.tr/about',
    },
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-brand-dark/80 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2670&auto=format&fit=crop"
                    alt="ProBrew Team"
                    fill
                    className="object-cover scale-110 blur-[2px]"
                    priority
                />
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase">HİKAYEMİZ</h1>
                    <div className="w-24 h-3 bg-brand-primary mx-auto rounded-full" />
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 py-32">
                <div className="prose prose-lg prose-brand mx-auto">
                    <h2 className="text-4xl font-black text-brand-dark mb-10 text-center tracking-tight uppercase">Teknoloji ve Lezzeti <br /><span className="text-brand-primary">Buluşturuyoruz</span></h2>

                    <p className="text-gray-500 leading-relaxed mb-10 text-xl font-medium">
                        ProBrew, 2024 yılında perakende ve teknoloji dünyasının kesişim noktasında doğdu. Amacımız, kafe ve restoran işletmeciliğinin önündeki hantal operasyonel engelleri, ileri nesil yazılım çözümleriyle ortadan kaldırmaktır.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-20">
                        <div className="bg-[#FAF9F6] p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <h3 className="text-2xl font-black text-brand-primary mb-6 uppercase tracking-tight">Misyonumuz</h3>
                            <p className="text-gray-500 text-base leading-relaxed font-medium">
                                İşletmelerin dijital dönüşüm süreçlerini, kullanıcı dostu ara yüzler ve yapay zeka destekli analizlerle hızlandırarak karlılıklarını artırmak.
                            </p>
                        </div>
                        <div className="bg-[#FAF9F6] p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                            <h3 className="text-2xl font-black text-brand-primary mb-6 uppercase tracking-tight">Vizyonumuz</h3>
                            <p className="text-gray-500 text-base leading-relaxed font-medium">
                                Global restorancılık ekosisteminde, en güvenilir ve en hızlı teknoloji sağlayıcısı olarak sektör standartlarını yeniden belirlemek.
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-500 leading-relaxed mb-10 text-lg font-medium">
                        Yazılım mühendislerimiz, tasarımcılarımız ve sektör deneyimli operasyon uzmanlarımızla birlikte; bulut teknolojilerini restoranların mutfağına, kasasına ve sadakat programlarına taşıyoruz. Bizim için her bir satır kod, bir işletmenin daha verimli çalışması ve bir müşterinin daha mutlu ayrılması demektir.
                    </p>

                    <div className="mt-20 p-12 bg-brand-dark rounded-[3rem] text-white text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-6 tracking-tight uppercase">Operasyonel Mükemmellik İçin <br /><span className="text-brand-primary">Geliştirildi.</span></h3>
                            <p className="text-gray-400 max-w-xl mx-auto italic text-lg">
                                "Sadece bir POS sistemi değil, işletmenizin dijital beynini inşa ediyoruz."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
