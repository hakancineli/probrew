'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaProjectDiagram, FaGlobe, FaUsers, FaChartBar, FaServer } from 'react-icons/fa';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function CorporatePage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) {
            setError('Lütfen sözleşmeleri onaylayınız.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    businessName,
                    isBusinessOwner: true,
                    businessId: 'probrew-main'
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Bir hata oluştu');

            localStorage.setItem('authToken', data.token);
            setSuccess('Hesabınız oluşturuldu! Yönlendiriliyorsunuz...');
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1500);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const services = [
        {
            title: 'Merkezi Yönetim',
            description: 'Yüzlerce şubeyi tek bir merkezden yönetin. Menü güncellemeleri ve fiyat değişikliklerini anında tüm şubelere yansıtın.',
            icon: <FaProjectDiagram className="text-4xl text-brand-primary" />
        },
        {
            title: 'Personel Yönetimi',
            description: 'Garson ve mutfak personelinizin performansını, çalışma saatlerini ve verimliliğini anlık olarak ölçümleyin.',
            icon: <FaUsers className="text-4xl text-brand-primary" />
        },
        {
            title: 'Bulut Tabanlı Raporlama',
            description: 'İşletmenizin tüm verilerine dünyanın her yerinden anlık olarak erişin ve analiz edin.',
            icon: <FaChartBar className="text-4xl text-brand-primary" />
        },
        {
            title: 'Global Operasyon',
            description: 'Çoklu dil, çoklu para birimi ve farklı ülkelerin mali mevzuatlarına tam uyumlu altyapı.',
            icon: <FaGlobe className="text-4xl text-brand-primary" />
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="bg-brand-dark py-32 px-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase">KURUMSAL ÇÖZÜMLER</h1>
                    <p className="text-gray-400 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
                        PROBREW Enterprise ile zincir işletmenizin verimliliğini AI destekli analizler ve ölçeklenebilir bulut mimarimizle en üst seviyeye taşıyın.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {services.map((service, index) => (
                        <div key={index} className="p-10 border border-gray-100 rounded-[2.5rem] bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                            <div className="mb-8 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                            <h3 className="text-xl font-black text-brand-dark mb-4 uppercase tracking-tight">{service.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">{service.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-brand-primary/5 border-2 border-brand-primary/10 rounded-[4rem] p-10 md:p-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-8 tracking-tight font-primary leading-tight">İşinizi Bizimle <br /><span className="text-brand-primary">Dijitalleştirin</span></h2>
                            <p className="text-gray-600 mb-12 text-lg leading-relaxed">
                                ProBrew kurumsal çözümleri ile karmaşıklığı sonlandırın. Hemen hesabınızı oluşturun ve tüm şubelerinizi saniyeler içinde tek merkezden yönetmeye başlayın.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-brand-primary text-2xl">
                                        <FaServer />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-brand-dark uppercase tracking-tight">On-Premise veya Cloud</h4>
                                        <p className="text-sm text-gray-500 font-medium">Verilerinizi kendi serverlarınızda veya güvenli bulutumuzda saklayın.</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-brand-primary text-2xl">
                                        <FaProjectDiagram />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-brand-dark uppercase tracking-tight">7/24 VIP Destek</h4>
                                        <p className="text-sm text-gray-500 font-medium">Kurumsal müşterilerimize özel, 15 dakika içinde çözüm garantili teknik destek.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl">
                            <h3 className="text-2xl font-black text-brand-dark mb-8 uppercase text-center tracking-tight">Kurumsal Kayıt Formu</h3>
                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">AD</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-gray-900 font-bold"
                                            placeholder="Adınız"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SOYAD</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-gray-900 font-bold"
                                            placeholder="Soyadınız"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ŞİRKET / ZİNCİR ADI</label>
                                    <input
                                        type="text"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-gray-900 font-bold"
                                        placeholder="Şirket ismini giriniz"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-POSTA</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-gray-900 font-bold"
                                            placeholder="name@company.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ŞİFRE</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-gray-900 font-bold"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}
                                {success && <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold border border-green-100">{success}</div>}

                                <div className="flex items-start space-x-3 ml-1">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary/20"
                                    />
                                    <span className="text-sm text-gray-500 leading-tight font-medium">
                                        <Link href="/terms" className="text-brand-dark font-black hover:underline uppercase text-[10px] tracking-tighter">Sözleşmeleri</Link> ve kullanıcı koşullarını onaylıyorum.
                                    </span>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-dark/20 disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span>Hemen Başlayın</span>
                                            <FiArrowRight />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
