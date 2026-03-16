'use client';

import { useState, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaFrown, FaLightbulb, FaCommentDots, FaCheckCircle, FaQrcode } from 'react-icons/fa';
import Link from 'next/link';

const FeedbackType = {
    COMPLAINT: { label: 'Şikayet', icon: FaFrown, color: 'text-red-500', bg: 'bg-red-50' },
    SUGGESTION: { label: 'Öneri', icon: FaLightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
    REQUEST: { label: 'Dilekçe/İstek', icon: FaCommentDots, color: 'text-blue-500', bg: 'bg-blue-50' },
    OTHER: { label: 'Diğer', icon: FaSmile, color: 'text-green-500', bg: 'bg-green-50' },
};

export default function TenantFeedbackPage({ params }: { params: { slug: string } }) {
    const [business, setBusiness] = useState<any>(null);
    const [type, setType] = useState('SUGGESTION');
    const [content, setContent] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/public/business/${params.slug}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setBusiness(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [params.slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Lütfen mesajınızı yazın.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    type,
                    content,
                    customerName,
                    customerContact,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const data = await response.json();
                setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (err) {
            setError('Bağlantı hatası. Lütfen internetinizi kontrol edin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const primaryColor = business?.systemSettings?.primaryColor || '#704d39';
    const secondaryColor = business?.systemSettings?.secondaryColor || '#5a3d2a';

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}></div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">İşletme Bulunamadı</h1>
                <p className="text-gray-500 mb-8">Üzgünüz, aradığınız geri bildirim sayfası bulunamadı.</p>
                <Link href="/" className="px-8 py-3 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: '#704d39' }}>
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-md w-full animate-in zoom-in duration-500">
                    <FaCheckCircle className="text-7xl mx-auto mb-6" style={{ color: primaryColor }} />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Teşekkür Ederiz!</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                        Geri bildiriminiz başarıyla {business.name} ekibine iletildi. Deneyiminizi geliştirmemize yardımcı olduğunuz için teşekkürler.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full py-4 text-white rounded-2xl font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Yeni Geri Bildirim Gönder
                    </button>
                    <Link
                        href={`/menu/${params.slug}`}
                        className="block mt-6 text-sm font-black uppercase tracking-widest transition-opacity hover:opacity-70"
                        style={{ color: primaryColor }}
                    >
                        Menüye Göz At
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 sm:px-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 right-0 h-64 opacity-[0.03] pointer-events-none" style={{ backgroundColor: primaryColor }} />
            
            <div className="max-w-md mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-white ring-1 ring-black/5">
                        {business.systemSettings?.logoUrl || business.logoUrl ? (
                            <img src={business.systemSettings?.logoUrl || business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">☕</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{business.name}</h1>
                    <p className="mt-2 text-gray-500 font-bold italic mb-8">Sizden gelen her fikir bizim için değerlidir.</p>

                    <Link 
                        href={`/menu/${params.slug}`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 text-xs rounded-2xl font-black shadow-xl hover:text-white transition-all transform active:scale-95 uppercase tracking-widest ring-1 ring-black/5"
                        style={{ 
                            borderColor: primaryColor, 
                            color: primaryColor,
                            // Hover state managed via Tailwind arbitrary or style but for simplicity here:
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = primaryColor;
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = primaryColor;
                        }}
                    >
                        📖 DİJİTAL MENÜMÜZÜ GÖR
                    </Link>
                </div>

                {/* Form */}
                <div className="bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
                    <div className="h-2" style={{ backgroundColor: primaryColor }}></div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-xs font-black text-gray-400 mb-4 px-1 uppercase tracking-[0.2em]">
                                Geri Bildirim Türü
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(FeedbackType).map(([key, config]) => {
                                    const Icon = config.icon;
                                    const isSelected = type === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setType(key)}
                                            className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 ${isSelected
                                                ? `scale-[1.03] shadow-lg shadow-black/5`
                                                : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                                                }`}
                                            style={isSelected ? { 
                                                borderColor: primaryColor,
                                                backgroundColor: `${primaryColor}08` // 08 is approx 3% opacity
                                            } : {}}
                                        >
                                            <Icon className={`text-2xl mb-2 ${isSelected ? config.color : 'text-gray-300'}`} />
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {config.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block text-xs font-black text-gray-400 mb-3 px-1 uppercase tracking-[0.2em]">
                                Mesajınız <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                rows={5}
                                required
                                className="w-full px-6 py-5 rounded-[32px] bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 transition-all outline-none resize-none placeholder-gray-300 font-bold text-gray-800"
                                style={{ '--tw-ring-color': `${primaryColor}15` } as any}
                                placeholder="Görüşlerinizi buraya yazabilirsiniz..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Personal Info (Optional) */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                <div className="h-px bg-gray-100 flex-1"></div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">İletişim</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <input
                                type="text"
                                placeholder="Adınız Soyadınız"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 transition-all outline-none text-sm font-bold placeholder-gray-300"
                                style={{ '--tw-ring-color': `${primaryColor}15` } as any}
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="E-posta veya Telefon"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 transition-all outline-none text-sm font-bold placeholder-gray-300"
                                style={{ '--tw-ring-color': `${primaryColor}15` } as any}
                                value={customerContact}
                                onChange={(e) => setCustomerContact(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black border border-red-100 text-center animate-shake uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 text-white rounded-[32px] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98] hover:scale-[1.01]"
                            style={{ 
                                backgroundColor: primaryColor,
                                boxShadow: `0 20px 40px -10px ${primaryColor}40`
                            }}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaPaperPlane size={18} />
                                    BİZE GÖNDER
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 mb-4 opacity-20 hover:opacity-100 transition-opacity">
                         <span className="font-black text-xl tracking-tighter text-gray-900 italic">PROBREW</span>
                    </div>
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.4em]">
                        SaaS Hospitality Solutions
                    </p>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
}
