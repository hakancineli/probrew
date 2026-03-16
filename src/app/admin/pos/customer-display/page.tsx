'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaStar, FaCheckCircle, FaReceipt } from 'react-icons/fa';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    image?: string;
}

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    userPoints?: {
        points: number;
        tier: string;
    };
}

export default function CustomerDisplayPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loyaltyMessage, setLoyaltyMessage] = useState<string | null>(null);
    const [isIdle, setIsIdle] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTheme, setActiveTheme] = useState('Nordic');

    const THEMES = {
        Nordic: {
            bg: 'bg-slate-50',
            sidebarBg: 'bg-white',
            accent: 'bg-blue-600',
            button: 'bg-blue-500',
            border: 'border-slate-200',
            text: 'text-slate-900',
            subText: 'text-slate-500',
            cardBg: 'bg-white',
            cardText: 'text-slate-900'
        },
        Midnight: {
            bg: 'bg-[#020617]',
            sidebarBg: 'bg-slate-900',
            accent: 'bg-indigo-600',
            button: 'bg-indigo-500',
            border: 'border-slate-800',
            text: 'text-slate-100',
            subText: 'text-slate-400',
            cardBg: 'bg-slate-800',
            cardText: 'text-slate-100'
        },
        Bistro: {
            bg: 'bg-[#E5D9C8]',
            sidebarBg: 'bg-[#3E2723]',
            accent: 'bg-[#8D6E63]',
            button: 'bg-[#6D4C41]',
            border: 'border-[#5C4033]',
            text: 'text-[#EAD8C0]',
            subText: 'text-[#A1887F]',
            cardBg: 'bg-[#4E342E]',
            cardText: 'text-[#F5F5F5]'
        },
        Vibrant: {
            bg: 'bg-purple-50',
            sidebarBg: 'bg-white',
            accent: 'bg-pink-500',
            button: 'bg-pink-500',
            border: 'border-purple-100',
            text: 'text-slate-900',
            subText: 'text-slate-500',
            cardBg: 'bg-white',
            cardText: 'text-slate-900'
        }
    };

    const themeStyles = THEMES[activeTheme as keyof typeof THEMES] || THEMES.Nordic;

    const campaigns = [
        {
            title: "🌙 Ramazan'a Özel 🥁",
            subtitle: "1 Tatlı Alana 2.si %50 İndirimli!",
            price: "%50 İndirim",
            image: "/images/products/San Sebastian.jpg",
            color: "from-amber-600 to-orange-700",
            isRamadan: true
        },
        {
            title: "🌙 Ramazan'a Özel ✨",
            subtitle: "1 Tatlı Alana 2.si %50 İndirimli!",
            price: "%50 İndirim",
            image: "/images/products/Çikolatalı San Sebastian.jpg",
            color: "from-rose-800 to-red-900",
            isRamadan: true
        },
        {
            title: "🌙 Ramazan'a Özel 🥁",
            subtitle: "1 Tatlı Alana 2.si %50 İndirimli!",
            price: "%50 İndirim",
            image: "/images/products/Lotus Cheesecake.jpg",
            color: "from-amber-700 to-orange-800",
            isRamadan: true
        },
        {
            title: "Instagram'da Biz",
            subtitle: "@probrew",
            price: "Takip Et",
            image: "/images/products/beverages-collection.png",
            color: "from-purple-600 to-pink-600",
            isInstagram: true
        },
        {
            title: "🌙 Ramazan'a Özel ✨",
            subtitle: "1 Tatlı Alana 2.si %50 İndirimli!",
            price: "%50 İndirim",
            image: "/images/products/Frambuazlı cheesecake.jpg",
            color: "from-pink-600 to-rose-700",
            isRamadan: true
        },
        {
            title: "🌙 Ramazan'a Özel 🥁",
            subtitle: "1 Tatlı Alana 2.si %50 İndirimli!",
            price: "%50 İndirim",
            image: "/images/products/Limonlu Cheesecake.jpg",
            color: "from-yellow-500 to-amber-600",
            isRamadan: true
        },
        {
            title: "Yeni Lezzet",
            subtitle: "Iced Spanish Latte",
            price: "₺210",
            image: "/images/products/Iced Spanish Latte.jpeg",
            color: "from-blue-500 to-cyan-600"
        },
        {
            title: "Yeni Lezzet",
            subtitle: "Çilekli Matcha Latte",
            price: "₺210",
            image: "/images/products/Iced Matcha Latte.jpeg",
            color: "from-green-500 to-teal-600"
        },
        {
            title: "Yeni Lezzet",
            subtitle: "Iced Salted Caramel",
            price: "₺210",
            image: "/images/products/caramel-macchiato.jpg",
            color: "from-amber-500 to-yellow-600"
        },
        {
            title: "☕ Sabah Fırsatı ☀️",
            subtitle: "07:00-12:00 Arası 2. Ürün %50 İndirimli!",
            price: "Hemen Üye Ol",
            image: "/images/products/beverages-collection.png",
            color: "from-orange-400 to-amber-500"
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % campaigns.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [campaigns.length]);

    useEffect(() => {
        const channel = new BroadcastChannel('probrew_pos_display');

        channel.onmessage = (event) => {
            const { type, data } = event.data;
            if (type === 'UPDATE_CART') {
                setCart(data.cart);
                setTotals(data.totals);
                setCustomer(data.customer);
                setLoyaltyMessage(data.loyaltyMessage || null);
                setIsIdle(data.cart.length === 0);
                setShowSuccess(false);
                if (data.theme) setActiveTheme(data.theme);
            } else if (type === 'ORDER_COMPLETED') {
                setLastOrderId(data?.orderId || null);
                setShowSuccess(true);
                setCart([]);
                setCustomer(null);

                // Return to idle after 10 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    setIsIdle(true);
                }, 10000);
            } else if (type === 'THEME_CHANGED') {
                setActiveTheme(data.theme);
            }
        };

        return () => channel.close();
    }, []);

    const instagramQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.instagram.com/probrew/&bgcolor=ffffff&color=000000&margin=10`;

    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`min-h-screen ${themeStyles.accent} flex flex-col items-center justify-center text-white p-10 overflow-hidden text-center`}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="mb-8"
                >
                    <FaCheckCircle className="text-9xl text-white" />
                </motion.div>
                <h1 className="text-7xl font-black mb-4 tracking-tighter">AFİYET OLSUN!</h1>
                <p className="text-3xl font-medium opacity-90 mb-12">Siparişiniz başarıyla alındı.</p>

                <div className="flex gap-16 items-center bg-white/10 backdrop-blur-xl p-12 rounded-[50px] border border-white/20">
                    <div className="text-left max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <FaReceipt className="text-4xl text-amber-400" />
                            <h2 className="text-4xl font-black">Dijital Fiş</h2>
                        </div>
                        <p className="text-xl opacity-80 leading-relaxed">
                            Kağıt israfını önlemek için fişinizi buradan indirebilir veya görüntüleyebilirsiniz.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-2xl relative">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://probrew.com.tr/receipt/${lastOrderId || 'dummy'}`}
                            alt="Receipt QR"
                            className="w-48 h-48 block"
                        />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 text-[10px] font-black px-3 py-1 rounded-full text-white whitespace-nowrap uppercase tracking-widest">
                            Tarat ve Görüntüle
                        </div>
                    </div>
                </div>

                <div className="mt-16 animate-bounce opacity-60 flex flex-col items-center">
                    <p className="font-bold uppercase tracking-widest text-sm mb-2">Lütfen Bekleyiniz</p>
                    <div className="w-1 h-12 bg-white rounded-full"></div>
                </div>
            </motion.div>
        );
    }

    if (isIdle) {
        return (
            <div className={`flex h-screen overflow-hidden ${themeStyles.bg}`}>
                {/* Left: Promotions / Branding */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`absolute inset-0 bg-gradient-to-br ${campaigns[currentSlide].color} flex flex-col items-center justify-center p-12 text-center text-white`}
                        >
                            <div className="relative z-10">
                                <motion.span
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className={`inline-block px-4 py-1 text-white font-black text-sm uppercase tracking-[0.3em] rounded-full mb-6 ${(campaigns[currentSlide] as any).isRamadan ? 'bg-amber-500/30 text-amber-100 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-black/20'
                                        }`}
                                >
                                    {campaigns[currentSlide].title}
                                </motion.span>
                                <motion.h1
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter"
                                >
                                    {campaigns[currentSlide].subtitle}
                                </motion.h1>
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-6xl font-black text-white flex items-center gap-4"
                                >
                                    {campaigns[currentSlide].price}
                                    <div className="h-1 w-24 bg-white/30 rounded-full"></div>
                                </motion.div>
                            </div>

                            {/* Slide Photo */}
                            <motion.div
                                initial={{ x: 100, opacity: 0, rotate: 10 }}
                                animate={{ x: 0, opacity: 0.4, rotate: -5 }}
                                transition={{ duration: 1 }}
                                className="absolute -right-20 top-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
                            >
                                <Image
                                    src={campaigns[currentSlide].image}
                                    alt="Campaign"
                                    fill
                                    className="object-cover rounded-full shadow-2xl contrast-125"
                                />
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Side: Info & QR */}
                <div className={`w-1/3 ${themeStyles.sidebarBg} flex flex-col items-center justify-between p-16 border-l ${themeStyles.border}`}>
                    <div className="relative w-48 h-48 mb-6">
                        <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                    </div>

                    <div className="flex flex-col items-center text-center gap-12 w-full mt-8">
                        {/* Instagram Block */}
                        <div>
                            <div className={`p-4 rounded-[30px] shadow-sm mb-4 relative group inline-block ${themeStyles.cardBg}`}>
                                <img src={instagramQR} alt="Instagram QR" className="w-32 h-32 rounded-xl" />
                                <div className="absolute -top-3 -right-3 bg-gradient-to-tr from-purple-600 to-pink-500 p-3 rounded-2xl shadow-lg border-2 border-white">
                                    <FaInstagram className="text-xl text-white" />
                                </div>
                            </div>
                            <h3 className={`text-xl font-black ${themeStyles.text} mb-1`}>Bizi Takip Edin</h3>
                            <span className={`font-bold text-lg ${themeStyles.accent.replace('bg-', 'text-')}`}>@probrew</span>
                        </div>

                        {/* Loyalty Join QR */}
                        <div>
                            <div className={`p-4 rounded-[30px] shadow-sm mb-4 relative group inline-block ${themeStyles.cardBg}`}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://probrew.com.tr/login?register=true')}&bgcolor=ffffff&color=000000&margin=10`} alt="Loyalty QR" className="w-32 h-32 rounded-xl" />
                                <div className="absolute -top-3 -right-3 bg-brand-primary p-3 rounded-2xl shadow-lg border-2 border-white">
                                    <FaStar className="text-xl text-white" />
                                </div>
                            </div>
                            <h3 className={`text-xl font-black ${themeStyles.text} mb-1`}>Hemen Üye Ol</h3>
                            <span className={`font-bold text-lg ${themeStyles.accent.replace('bg-', 'text-')}`}>İndirimi Yakala</span>
                        </div>

                        {/* Wi-Fi Block */}
                        <div>
                            <div className={`p-4 rounded-[30px] shadow-sm mb-4 relative group inline-block ${themeStyles.cardBg}`}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WIFI:T:WPA;S:ProBrewCafe;P:ProBrew1608;;&bgcolor=ffffff&color=000000&margin=10`} alt="Wi-Fi QR" className="w-32 h-32 rounded-xl" />
                                <div className="absolute -top-3 -right-3 bg-blue-500 p-3 rounded-2xl shadow-lg border-2 border-white">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                                </div>
                            </div>
                            <h3 className={`text-xl font-black ${themeStyles.text} mb-1`}>Ücretsiz Wi-Fi</h3>
                            <div className={`font-medium text-sm flex flex-col gap-1.5 mt-2 ${themeStyles.subText}`}>
                                <div className={`px-3 py-1.5 rounded-lg inline-flex gap-2 items-center mx-auto ${themeStyles.cardBg}`}>
                                    <span className="opacity-60 text-xs uppercase tracking-wider">Ağ:</span>
                                    <span className={`font-bold ${themeStyles.text}`}>ProBrewCafe</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg inline-flex gap-2 items-center mx-auto ${themeStyles.cardBg}`}>
                                    <span className="opacity-60 text-xs uppercase tracking-wider">Şifre:</span>
                                    <span className={`font-bold ${themeStyles.text}`}>ProBrew1608</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`w-full h-px ${themeStyles.border} my-8`}></div>

                    <div className={`font-black text-xs uppercase tracking-[0.4em] animate-pulse ${themeStyles.subText}`}>
                        Siparişe Hazır
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Left Side: Status & Personalization */}
            <div className={`w-1/2 relative p-16 flex flex-col justify-between overflow-hidden transition-colors duration-700 ${customer ? themeStyles.sidebarBg : themeStyles.accent}`}>
                <div className="flex justify-between items-start z-10">
                    <div className="relative w-32 h-32">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    {customer && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white/10 backdrop-blur-xl p-6 rounded-[35px] border border-white/20 text-white flex items-center gap-6"
                        >
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <span className="text-2xl font-black text-gray-900">{customer.firstName[0]}{customer.lastName[0]}</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-amber-400 uppercase tracking-widest mb-1">Hoş Geldiniz</p>
                                <h2 className="text-2xl font-black leading-none">{customer.firstName} {customer.lastName}</h2>
                                {customer.userPoints && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <FaStar className="text-amber-400 text-xs" />
                                        <span className="text-xs font-black opacity-80 uppercase tracking-widest">
                                            {customer.userPoints.tier} • {customer.userPoints.points} PUAN
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Loyalty Greeting Message - Animated when it changes */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {loyaltyMessage && (
                            <motion.div
                                key={loyaltyMessage}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border-2 border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.2)] mb-8 max-w-xl"
                            >
                                <h3 className="text-3xl font-black text-white leading-tight">
                                    {loyaltyMessage}
                                </h3>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative z-10">
                    <motion.h2
                        key={cart.length}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-8xl font-black text-white mb-6 leading-[0.85] tracking-tighter"
                    >
                        AFİYET<br />OLSUN
                    </motion.h2>
                    <p className="text-white/70 text-2xl font-medium tracking-wide">Siparişiniz ekrana yansıtılıyor...</p>
                </div>

                {/* Visual Flair */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

                <div className="mt-8 flex gap-4 z-10">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white text-sm font-black uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Canlı İşlem
                    </div>
                </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className={`w-[450px] ${themeStyles.sidebarBg} border-l ${themeStyles.border} shadow-2xl flex flex-col z-10`}>
                <div className={`p-8 border-b ${themeStyles.border} ${themeStyles.accent} text-white`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <FaReceipt className="text-3xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter">SİPARİŞİNİZ</h2>
                            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">PROBREW COFFEE ROOM</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {cart.length === 0 ? (
                        <div className={`h-full flex flex-col items-center justify-center ${themeStyles.subText}`}>
                            <div className={`w-24 h-24 mb-6 rounded-full ${themeStyles.bg} flex items-center justify-center opacity-50`}>
                                <FaReceipt className="text-5xl" />
                            </div>
                            <p className="text-xl font-bold opacity-50">Sipariş bekleniyor...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={item.id}
                                    className={`flex items-center gap-4 p-4 rounded-3xl ${themeStyles.cardBg} border ${themeStyles.border} shadow-sm`}
                                >
                                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <FaReceipt size={24} />
                                            </div>
                                        )}
                                        <div className={`absolute bottom-0 right-0 ${themeStyles.accent} text-white px-2 py-1 text-xs font-black rounded-tl-xl`}>
                                            x{item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold ${themeStyles.text} truncate text-lg`}>{item.name}</h3>
                                        <p className={`text-sm ${themeStyles.subText} font-medium`}>{item.size}</p>
                                        <p className={`text-xl font-black ${themeStyles.accent.replace('bg-', 'text-')} mt-1`}>₺{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`p-8 ${themeStyles.bg} border-t ${themeStyles.border} space-y-4`}>
                    <div className="flex justify-between items-center text-lg font-medium">
                        <span className={themeStyles.subText}>Ara Toplam</span>
                        <span className={themeStyles.text}>₺{totals.subtotal.toFixed(2)}</span>
                    </div>
                    {totals.discount > 0 && (
                        <div className="flex justify-between items-center text-lg font-medium text-red-500">
                            <span>İndirim</span>
                            <span>-₺{totals.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className={`flex justify-between items-center pt-4 border-t ${themeStyles.border}`}>
                        <span className={`text-2xl font-black ${themeStyles.text}`}>TOPLAM</span>
                        <span className={`text-4xl font-black ${themeStyles.accent.replace('bg-', 'text-')}`}>₺{totals.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
}
