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

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#704d39] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">İşletme Bulunamadı</h1>
                <p className="text-gray-500 mb-8">Üzgünüz, aradığınız geri bildirim sayfası bulunamadı.</p>
                <Link href="/" className="px-8 py-3 bg-[#704d39] text-white rounded-xl font-bold">
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-[40px] shadow-xl max-w-md w-full animate-in zoom-in duration-500">
                    <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Teşekkür Ederiz!</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Geri bildiriminiz başarıyla {business.name} ekibine iletildi. Deneyiminizi geliştirmemize yardımcı olduğunuz için teşekkürler.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full py-4 bg-[#704d39] text-white rounded-2xl font-bold shadow-lg hover:bg-[#5a3d2a] transition-all"
                    >
                        Yeni Geri Bildirim Gönder
                    </button>
                    <Link
                        href={`/menu/${params.slug}`}
                        className="block mt-4 text-sm font-bold text-[#704d39] hover:underline"
                    >
                        Menüye Göz At
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#e8f5ea] py-12 px-4 sm:px-6">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl mx-auto mb-6 flex items-center justify-center overflow-hidden border-4 border-white">
                        {business.systemSettings?.logoUrl || business.logoUrl ? (
                            <img src={business.systemSettings?.logoUrl || business.logoUrl} alt={business.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-4xl">☕</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{business.name}</h1>
                    <p className="mt-2 text-gray-600 font-medium italic mb-6">Sizden gelen her fikir bizim için değerlidir.</p>

                    <Link 
                        href={`/menu/${params.slug}`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#704d39] text-[#704d39] rounded-2xl font-black text-xs shadow-xl shadow-[#704d39]/10 hover:bg-[#704d39] hover:text-white transition-all transform active:scale-95 uppercase tracking-widest"
                    >
                        📖 DİJİTAL MENÜMÜZÜ GÖR
                    </Link>
                </div>

                {/* Form */}
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm">
                    <div className="p-1 bg-[#704d39]"></div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-7">
                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-black text-gray-800 mb-4 px-1 uppercase tracking-widest">
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
                                                ? `border-[#704d39] ${config.bg} scale-[1.03] shadow-md shadow-[#704d39]/10`
                                                : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                                                }`}
                                        >
                                            <Icon className={`text-2xl mb-2 ${isSelected ? config.color : 'text-gray-400'}`} />
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {config.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-black text-gray-800 mb-3 px-1 uppercase tracking-widest">
                                Mesajınız <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                rows={5}
                                required
                                className="w-full px-6 py-5 rounded-[32px] bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-[#704d39]/5 focus:border-[#704d39] transition-all outline-none resize-none placeholder-gray-400 font-medium"
                                placeholder="Görüşlerinizi buraya yazabilirsiniz..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Personal Info (Optional) */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="h-px bg-gray-100 flex-1"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">İletişim Bilgileri</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Adınız Soyadınız (İsteğe bağlı)"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-[#704d39]/5 focus:border-[#704d39] transition-all outline-none text-sm font-medium"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="E-posta veya Telefon (İsteğe bağlı)"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-[#704d39]/5 focus:border-[#704d39] transition-all outline-none text-sm font-medium"
                                    value={customerContact}
                                    onChange={(e) => setCustomerContact(e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center font-medium italic">
                                * Bilgileriniz sadece size dönüş yapabilmemiz için kullanılır.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-[#704d39] text-white rounded-[32px] font-black text-lg shadow-2xl shadow-[#704d39]/30 hover:bg-[#5a3d2a] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FaPaperPlane size={18} />
                                    GÖNDER
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 mb-4 opacity-40 grayscale">
                         <span className="font-black text-lg tracking-tighter text-gray-900">PROBREW</span>
                    </div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        Kafe ve Restoran Yönetim Sistemi
                    </p>
                </div>
            </div>
        </div>
    );
}
