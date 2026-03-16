import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FranchiseBanner from '@/components/FranchiseBanner';
import Image from 'next/image';
import { FaHandshake, FaChartLine, FaCogs, FaHeadset } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'Çözüm Ortaklığı | ProBrew Bayilik Sistemi',
    description: 'ProBrew POS sistemlerinin satış ve kurulum süreçlerinde çözüm ortağımız olun. Teknoloji odaklı bayilik modelimizle birlikte büyüyelim.',
};

export default function FranchisingPage() {
    return (
        <main className="bg-white">
            <Navbar />

            {/* Hero Section for Partner Page */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-brand-dark z-0">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
                </div>
                <div className="relative z-10 text-center px-6 max-w-4xl">
                    <div className="inline-block px-4 py-2 bg-brand-primary/20 text-brand-primary rounded-full text-sm font-bold mb-6 border border-brand-primary/30">
                        TEKNOLOJİ İŞ ORTAKLIĞI
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 animate-slide-up leading-tight tracking-tighter">
                        Geleceği Birlikte <br className="hidden sm:block" /> <span className="text-brand-primary">Kuralım</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
                        Yazılım satış ve teknik servis firmaları için tasarlanmış ProBrew Çözüm Ortaklığı programı ile bölgenizdeki kafe ve restoranlara yeni nesil bir deneyim sunun.
                    </p>
                </div>
            </section>

            {/* Why Partner Section */}
            <section className="py-24 bg-[#FAF9F6]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tight uppercase">Neden Çözüm Ortağı?</h2>
                        <div className="w-24 h-2 bg-brand-primary mx-auto rounded-full"></div>
                        <p className="mt-8 text-gray-500 max-w-2xl mx-auto font-medium">
                            Sadece bir yazılım değil, bayilerimiz için yüksek kazançlı ve sürdürülebilir bir iş ekosistemi inşa ettik.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 group">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <FaChartLine />
                            </div>
                            <h3 className="text-xl font-black text-brand-dark mb-4 uppercase tracking-tight">Yüksek Kar Marjı</h3>
                            <p className="text-gray-500 leading-relaxed text-sm font-medium">SaaS abonelikleri ve donanım satışlarından elde edilen rekabetçi komisyon oranları ile gelirinizi katlayın.</p>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 group">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <FaCogs />
                            </div>
                            <h3 className="text-xl font-black text-brand-dark mb-4 uppercase tracking-tight">API & Entegrasyon</h3>
                            <p className="text-gray-500 leading-relaxed text-sm font-medium">Esnek yapımız sayesinde mevcut donanımlarınızla kolayca entegre olun, müşterilerinize özel çözümler üretin.</p>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 group">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                <FaHeadset />
                            </div>
                            <h3 className="text-xl font-black text-brand-dark mb-4 uppercase tracking-tight">Teknik Destek</h3>
                            <p className="text-gray-500 leading-relaxed text-sm font-medium">Uzak bağlantı ve yerinde kurulum süreçlerinde ProBrew mühendislerinden 7/24 kesintisiz destek alın.</p>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 group">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-3xl mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <FaHandshake />
                            </div>
                            <h3 className="text-xl font-black text-brand-dark mb-4 uppercase tracking-tight">Özel Partner Portalı</h3>
                            <p className="text-gray-500 leading-relaxed text-sm font-medium">Müşteri portföyünüzü, lisans sürelerini ve hakedişlerinizi size özel panelden anlık olarak yönetin.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Banner component might need update too but lets see the page first */}
            <FranchiseBanner />

            <Footer />
        </main>
    );
}
