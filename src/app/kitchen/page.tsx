'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaFire, FaCheck, FaClock, FaBell, FaBellSlash, FaCashRegister, FaMobileAlt, FaQrcode } from 'react-icons/fa';
import { useRealtime } from '@/hooks/useRealtime';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    notes?: string;
    createdAt: string;
    tableId?: string;
    source?: string;
    table?: {
        name: string;
    };
    orderItems: OrderItem[];
}

interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    size?: string;
    isPorcelain?: boolean;
    notes?: string;
}

// Timer Component to show elapsed time since order creation
const OrderTimer = ({ createdAt }: { createdAt: string }) => {
    const [elapsed, setElapsed] = useState('');
    const [colorClass, setColorClass] = useState('text-gray-400');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const start = new Date(createdAt).getTime();
            const diff = now - start;

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setElapsed(`${minutes}:${seconds.toString().padStart(2, '0')}`);

            // Color coding based on wait time
            if (minutes < 5) setColorClass('text-green-500');       // < 5 mins
            else if (minutes < 10) setColorClass('text-orange-500'); // 5-10 mins
            else setColorClass('text-red-600 animate-pulse');        // > 10 mins
        };

        updateTimer(); // Initial call
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <div className={`flex items-center font-mono font-bold ${colorClass}`}>
            <FaClock className="mr-1" />
            {elapsed}
        </div>
    );
};

export default function KitchenPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [activeTheme, setActiveTheme] = useState('Nordic');
    // Web Audio API Context
    const audioContextRef = useRef<AudioContext | null>(null);
    const prevPendingCountReq = useRef<number>(0);

    // Initialize Audio Context on user interaction (to bypass autoplay policy)
    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const playBellSound = () => {
        if (!audioContextRef.current) initAudio();
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const now = ctx.currentTime;

        // Function to create a harmonic
        const createHarmonic = (freq: number, volume: number, decay: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(volume, now + 0.01); // Sharp attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + decay); // Natural decay

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + decay + 0.1);
        };

        // Desk Bell (Reception Bell) characteristics: 
        // A fundamental tone with several high-frequency metallic overtones
        createHarmonic(1046.50, 0.4, 1.5); // C6 (Fundamental)
        createHarmonic(2093.00, 0.2, 0.8); // C7
        createHarmonic(2489.02, 0.15, 0.6); // Eb7 (Slightly discordant)
        createHarmonic(3135.96, 0.1, 0.4); // G7
        createHarmonic(4186.01, 0.1, 0.3); // C8 (Ping)
    };

    useEffect(() => {
        fetchOrders();
        fetchSettings();
    }, []);

    const [businessSettings, setBusinessSettings] = useState<any>(null);
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setBusinessSettings(data);
                if (data.activeTheme) setActiveTheme(data.activeTheme);
            }
        } catch (e) { console.error(e); }
    };

    // Realtime events
    useRealtime(useCallback((payload) => {
        if (payload.event === 'NEW_ORDER' || payload.event === 'ORDER_STATUS_CHANGED') {
            fetchOrders();
        }
    }, []));

    // Alarm Check Logic
    useEffect(() => {
        if (!orders) return;
        const currentPendingCount = orders.filter(o => o.status === 'PENDING').length;

        // Only play if count INCREASED and audio is enabled
        if (currentPendingCount > prevPendingCountReq.current && currentPendingCount > 0) {
            if (!isMuted && hasInteracted) {
                playBellSound();
            }
        }

        prevPendingCountReq.current = currentPendingCount;
    }, [orders, isMuted, hasInteracted]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/admin/orders?status=PENDING,PREPARING&limit=100&_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                const kitchenOrders = data.orders;
                kitchenOrders.sort((a: Order, b: Order) => {
                    if (a.status === b.status) return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    return a.status === 'PENDING' ? -1 : 1;
                });
                setOrders(kitchenOrders);
            }
        } catch (error) {
            console.error('Kitchen fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // PIN Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [isPinError, setIsPinError] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ orderId: string; newStatus: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // When barista clicks HAZIRLA, show PIN modal
    const requestStatusChange = (orderId: string, newStatus: string) => {
        setPendingAction({ orderId, newStatus });
        setEnteredPin('');
        setIsPinError(false);
        setShowPinModal(true);
    };

    // HAZIR: No PIN needed, preparedById already saved in PREPARING step
    const markAsReady = async (orderId: string) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'READY' })
            });
            if (res.ok) fetchOrders();
        } catch (e) { console.error(e); }
    };

    const updateStatus = async (orderId: string, newStatus: string, staffPin: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, staffPin })
            });
            if (res.ok) {
                setShowPinModal(false);
                setPendingAction(null);
                setEnteredPin('');
                fetchOrders();
            } else {
                const data = await res.json().catch(() => ({}));
                if (data.error?.includes('PIN')) {
                    setIsPinError(true);
                    setEnteredPin('');
                } else {
                    setShowPinModal(false);
                    setPendingAction(null);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePinInput = (num: string) => {
        if (num === 'C') {
            setEnteredPin('');
            setIsPinError(false);
            return;
        }
        if (num === '⌫') {
            setEnteredPin(prev => prev.slice(0, -1));
            setIsPinError(false);
            return;
        }
        if (enteredPin.length >= 4) return;

        const nextPin = enteredPin + num;
        setEnteredPin(nextPin);
        setIsPinError(false);

        // Auto-submit when 4 digits entered
        if (nextPin.length === 4 && pendingAction) {
            setTimeout(() => {
                updateStatus(pendingAction.orderId, pendingAction.newStatus, nextPin);
            }, 300);
        }
    };

    const toggleMute = () => setIsMuted(!isMuted);

    // Theme Configurations
    const THEMES = {
        Nordic: {
            appBg: 'bg-[#F8FAFC]',
            headerBg: 'bg-white',
            headerText: 'text-slate-900',
            headerSub: 'text-slate-400',
            cardContainer: 'bg-white',
            cardBorder: 'border-slate-200',
            textColor: 'text-slate-800',
            accent: 'bg-blue-600',
            accentText: 'text-white',
            // Order Type Colors
            posCard: { bg: 'bg-white', border: 'border-orange-500', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-orange-100', labelText: 'text-orange-700', itemText: 'text-slate-900' },
            tableCard: { bg: 'bg-white', border: 'border-blue-500', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-blue-100', labelText: 'text-blue-700', itemText: 'text-slate-900' },
            qrCard: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-emerald-100', labelText: 'text-emerald-700', itemText: 'text-slate-900' }
        },
        Midnight: {
            appBg: 'bg-[#020617]',
            headerBg: 'bg-slate-900',
            headerText: 'text-slate-100',
            headerSub: 'text-slate-500',
            cardContainer: 'bg-slate-900/50',
            cardBorder: 'border-slate-800',
            textColor: 'text-slate-200',
            accent: 'bg-indigo-600',
            accentText: 'text-white',
            // Order Type Colors
            posCard: { bg: 'bg-slate-900', border: 'border-orange-600', text: 'text-slate-200', subText: 'text-slate-500', labelBg: 'bg-orange-950/40', labelText: 'text-orange-400', itemText: 'text-white' },
            tableCard: { bg: 'bg-slate-900', border: 'border-indigo-600', text: 'text-slate-200', subText: 'text-slate-500', labelBg: 'bg-indigo-950/40', labelText: 'text-indigo-400', itemText: 'text-white' },
            qrCard: { bg: 'bg-slate-900', border: 'border-emerald-600', text: 'text-slate-200', subText: 'text-slate-500', labelBg: 'bg-emerald-950/40', labelText: 'text-emerald-400', itemText: 'text-white' }
        },
        Bistro: {
            appBg: 'bg-[#E5D9C8]',
            headerBg: 'bg-[#3E2723]',
            headerText: 'text-[#EAD8C0]',
            headerSub: 'text-[#A1887F]',
            cardContainer: 'bg-[#3E2723]/90',
            cardBorder: 'border-[#5C4033]',
            textColor: 'text-[#EAD8C0]',
            accent: 'bg-[#8D6E63]',
            accentText: 'text-[#EAD8C0]',
            // Order Type Colors
            posCard: { bg: 'bg-[#4E342E]', border: 'border-[#FF8A65]', text: 'text-[#EAD8C0]', subText: 'text-[#A1887F]', labelBg: 'bg-orange-900/30', labelText: 'text-[#FF8A65]', itemText: 'text-white' },
            tableCard: { bg: 'bg-[#263238]', border: 'border-[#4DB6AC]', text: 'text-[#EAD8C0]', subText: 'text-[#80CBC4]', labelBg: 'bg-teal-900/30', labelText: 'text-[#4DB6AC]', itemText: 'text-white' },
            qrCard: { bg: 'bg-[#1B5E20]', border: 'border-[#81C784]', text: 'text-[#E8F5E9]', subText: 'text-[#A5D6A7]', labelBg: 'bg-emerald-900/30', labelText: 'text-[#81C784]', itemText: 'text-white' }
        },
        Vibrant: {
            appBg: 'bg-purple-50',
            headerBg: 'bg-purple-600',
            headerText: 'text-white',
            headerSub: 'text-purple-200',
            cardContainer: 'bg-white',
            cardBorder: 'border-purple-100',
            textColor: 'text-slate-900',
            accent: 'bg-pink-500',
            accentText: 'text-white',
            // Order Type Colors
            posCard: { bg: 'bg-white', border: 'border-pink-500', text: 'text-slate-900', subText: 'text-slate-500', labelBg: 'bg-pink-50', labelText: 'text-pink-600', itemText: 'text-purple-900' },
            tableCard: { bg: 'bg-white', border: 'border-purple-500', text: 'text-slate-900', subText: 'text-slate-500', labelBg: 'bg-purple-50', labelText: 'text-purple-600', itemText: 'text-purple-900' },
            qrCard: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-slate-900', subText: 'text-slate-500', labelBg: 'bg-emerald-50', labelText: 'text-emerald-600', itemText: 'text-emerald-900' }
        },
        Turkish: {
            appBg: 'bg-red-50',
            headerBg: 'bg-red-600',
            headerText: 'text-white',
            headerSub: 'text-red-100',
            cardContainer: 'bg-white',
            cardBorder: 'border-red-100',
            textColor: 'text-slate-900',
            accent: 'bg-red-700',
            accentText: 'text-white',
            posCard: { bg: 'bg-white', border: 'border-red-500', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-red-50', labelText: 'text-red-600', itemText: 'text-slate-900' },
            tableCard: { bg: 'bg-white', border: 'border-slate-800', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-slate-100', labelText: 'text-slate-700', itemText: 'text-slate-900' },
            qrCard: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-emerald-50', labelText: 'text-emerald-600', itemText: 'text-slate-900' }
        },
        Custom: {
            appBg: 'bg-[#F1F5F9]',
            headerBg: 'bg-white',
            headerText: 'text-slate-900',
            headerSub: 'text-slate-500',
            cardContainer: 'bg-white',
            cardBorder: 'border-slate-200',
            textColor: 'text-slate-800',
            accent: 'bg-[var(--primary)]',
            accentText: 'text-white',
            posCard: { bg: 'bg-white', border: 'border-[var(--secondary)]', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-slate-50', labelText: 'text-[var(--primary)]', itemText: 'text-slate-900' },
            tableCard: { bg: 'bg-white', border: 'border-[var(--primary)]', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-slate-50', labelText: 'text-[var(--primary)]', itemText: 'text-slate-900' },
            qrCard: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-slate-800', subText: 'text-slate-500', labelBg: 'bg-emerald-50', labelText: 'text-emerald-600', itemText: 'text-slate-900' }
        }
    };
    const themeStyles = THEMES[activeTheme as keyof typeof THEMES] || THEMES.Nordic;

    // Interaction handler to unlock audio
    const handleInteraction = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
            initAudio();
            playBellSound(); // Play test sound confirmation
        }
    };

    if (loading) return <div className={`flex h-screen items-center justify-center ${themeStyles.appBg} ${themeStyles.textColor} text-2xl font-mono`}>Sistem Yükleniyor...</div>;

    if (!hasInteracted) {
        return (
            <div className={`flex h-screen items-center justify-center ${themeStyles.appBg} ${themeStyles.textColor}`} onClick={handleInteraction}>
                <div className={`text-center p-10 border ${themeStyles.cardBorder} rounded-2xl ${themeStyles.headerBg} ${themeStyles.headerText} shadow-2xl cursor-pointer animate-pulse`}>
                    <div className="text-6xl mb-4">🔇 ➔ 🔊</div>
                    <h1 className="text-3xl font-bold mb-2">Mutfak Ekranını Başlat</h1>
                    <p className={themeStyles.headerSub}>Sesli bildirimleri etkinleştirmek için ekrana dokunun.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeStyles.appBg} ${themeStyles.textColor} p-6 font-sans transition-colors duration-500`}>
            <style jsx global>{`
                :root {
                    --primary: ${businessSettings?.primaryColor || '#3E2723'};
                    --secondary: ${businessSettings?.secondaryColor || '#FF8A65'};
                }
                .bg-\[var\(--primary\)\] { background-color: var(--primary) !important; }
                .text-\[var\(--primary\)\] { color: var(--primary) !important; }
                .border-\[var\(--primary\)\] { border-color: var(--primary) !important; }
                .ring-\[var\(--primary\)\] { --tw-ring-color: var(--primary) !important; }
                .border-\[var\(--secondary\)\] { border-color: var(--secondary) !important; }
            `}</style>
            {/* Header */}
            <div className={`flex justify-between items-center mb-8 ${themeStyles.headerBg} p-4 rounded-2xl shadow-lg border ${themeStyles.cardBorder}`}>
                <div className="flex items-center">
                    <div className={`w-12 h-12 ${themeStyles.accent} rounded-full flex items-center justify-center text-2xl mr-4 shadow-xl ${themeStyles.accentText}`}>
                        🍳
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className={`text-2xl font-bold tracking-wide ${themeStyles.headerText}`}>MUTFAK PANELİ</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Canlı</span>
                            </div>
                        </div>
                        <p className={`${themeStyles.headerSub} text-xs tracking-wider uppercase`}>ProBrew Real-time Engine</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <div className="flex space-x-4">
                        <div className={`flex flex-col items-center opacity-80 px-4 py-2 rounded-xl border ${themeStyles.cardBorder}`}>
                            <span className={`text-[10px] uppercase font-black tracking-widest ${themeStyles.headerSub}`}>Bekleyen</span>
                            <span className="text-2xl font-black text-orange-500">{orders.filter(o => o.status === 'PENDING').length}</span>
                        </div>
                        <div className={`flex flex-col items-center opacity-80 px-4 py-2 rounded-xl border ${themeStyles.cardBorder}`}>
                            <span className={`text-[10px] uppercase font-black tracking-widest ${themeStyles.headerSub}`}>Hazırlanan</span>
                            <span className="text-2xl font-black text-emerald-500">{orders.filter(o => o.status === 'PREPARING').length}</span>
                        </div>
                    </div>

                    {/* Mute Toggle */}
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-xl transition-all duration-300 ${isMuted ? 'bg-[#4E342E] text-[#A1887F]' : 'bg-[#D7CCC8] text-[#3E2723] shadow-lg shadow-white/10'}`}
                    >
                        {isMuted ? <FaBellSlash className="text-xl" /> : <FaBell className="text-xl animate-wiggle" />}
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-[#8D6E63]">
                    <div className="text-6xl mb-4 grayscale opacity-20">☕</div>
                    <h2 className="text-2xl font-light">Aktif sipariş bulunmuyor</h2>
                    <p className="text-sm mt-2">Yeni siparişler düştüğünde burada görünecek.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                    {orders.map((order) => {
                        const isTable = !!order.tableId;
                        const isQr = order.customerName?.toLowerCase().includes('qr') || order.customerName?.toLowerCase().includes('müşteri') || order.source === 'WEBSITE';
                        
                        let cTheme = themeStyles.posCard;
                        if (isQr) cTheme = themeStyles.qrCard;
                        else if (isTable) cTheme = themeStyles.tableCard;

                        return (
                            <div
                                key={order.id}
                                className={`relative flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-[1.02] 
                                ${cTheme.bg} border-l-4 ${order.status === 'PENDING' ? cTheme.border : 'border-emerald-500'} 
                                ring-1 ${cTheme.border.replace('border-', 'ring-')}/20
                            `}
                            >
                                {/* Urgency Strip (Animated for Pending) */}
                                {order.status === 'PENDING' && (
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cTheme.border.replace('border-', 'from-')} ${cTheme.border.replace('border-', 'to-')} animate-gradient-x`}></div>
                                )}

                                {/* Card Header */}
                                <div className={`p-4 border-b border-dashed ${cTheme.border}/20 ${cTheme.bg.replace('bg-', 'bg-')}/5`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-2xl font-black tracking-tight ${cTheme.text}`}>
                                                #{order.orderNumber.split('-').pop()}
                                            </span>
                                            {order.status === 'PENDING' && <span className={`animate-pulse ${cTheme.labelText} text-[10px] font-black px-2 py-0.5 rounded ${cTheme.labelBg} border ${cTheme.border}/20`}>YENİ</span>}
                                        </div>
                                        <OrderTimer createdAt={order.createdAt} />
                                    </div>
                                    
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-black ${cTheme.subText} uppercase tracking-widest mb-0.5`}>Müşteri</span>
                                            <span className={`font-bold ${cTheme.text} text-sm truncate max-w-[140px]`} title={order.customerName}>
                                                {order.customerName}
                                            </span>
                                        </div>
                                        
                                        <div className={`flex items-center px-2 py-1 rounded text-[10px] font-black tracking-widest ${cTheme.labelBg} ${cTheme.labelText} border ${cTheme.border}/30`}>
                                            {isQr ? (
                                                <>
                                                    <FaQrcode className="mr-1.5" /> QR SİPARİŞ
                                                </>
                                            ) : isTable ? (
                                                <>
                                                    <FaMobileAlt className="mr-1.5" /> MASA: {order.table?.name || 'Mobil'}
                                                </>
                                            ) : (
                                                <>
                                                    <FaCashRegister className="mr-1.5" /> GEL-AL / POS
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Card Body (Items) */}
                                <div className="p-5 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-black/20 scrollbar-track-transparent">
                                    <div className="space-y-4">
                                        {order.orderItems.map((item, idx) => (
                                            <div key={item.id} className="flex flex-col">
                                                <div className="flex items-start">
                                                    <span className={`text-xl font-bold w-8 text-right mr-3 ${order.status === 'PENDING' ? cTheme.labelText : 'text-emerald-500'}`}>
                                                        {item.quantity}x
                                                    </span>
                                                    <div className="flex-1">
                                                        <span className={`text-lg font-medium ${cTheme.itemText} leading-snug block`}>
                                                            {item.productName}
                                                        </span>
                                                        {item.size && (
                                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${cTheme.labelBg} ${cTheme.labelText} border ${cTheme.border}/20`}>
                                                                {item.size}
                                                            </span>
                                                        )}
                                                        {item.isPorcelain && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 ml-2 animate-pulse">
                                                                ☕ FİNCAN
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.notes && (
                                                    <div className={`ml-11 mt-1 text-sm ${cTheme.labelText} italic ${cTheme.labelBg} p-1 rounded border-l-2 ${cTheme.border} pl-2`}>
                                                        "{item.notes}"
                                                    </div>
                                                )}
                                                {idx < order.orderItems.length - 1 && <div className="border-b border-dashed border-black/5 my-2 ml-11"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                    {order.notes && (
                                        <div className={`mt-4 p-3 border rounded-lg ${cTheme.labelBg} ${cTheme.border}/30`}>
                                            <span className={`text-xs font-bold uppercase block mb-1 ${cTheme.labelText}`}>Sipariş Notu</span>
                                            <p className={`${cTheme.text} text-sm opacity-90`}>{order.notes}</p>
                                        </div>
                                    )}
                                 <div className={`p-4 ${cTheme.bg.replace('bg-', 'bg-')}/5 border-t ${cTheme.border}/10`}>
                                    {order.status === 'PENDING' ? (
                                        <button
                                            onClick={() => requestStatusChange(order.id, 'PREPARING')}
                                            className={`w-full group relative flex items-center justify-center py-3 ${themeStyles.accent} ${themeStyles.accentText} font-bold rounded-lg shadow-lg shadow-black/20 transition-all transform active:scale-95 border ${cTheme.border}/30`}
                                        >
                                            <span className="mr-2 text-xl group-hover:rotate-12 transition-transform">🔥</span>
                                            HAZIRLA
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => markAsReady(order.id)}
                                            className="w-full group relative flex items-center justify-center py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/40 transition-all transform active:scale-95 border border-emerald-500/50"
                                        >
                                            <span className="mr-2 text-xl group-hover:-rotate-12 transition-transform">✅</span>
                                            HAZIR
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* PIN Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className={`${themeStyles.headerBg} rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border ${themeStyles.cardBorder}`}>
                        {/* Header */}
                        <div className={`${themeStyles.headerBg} p-6 text-center border-b ${themeStyles.cardBorder}`}>
                            <h3 className={`text-xl font-black ${themeStyles.headerText} uppercase tracking-widest`}>
                                {pendingAction?.newStatus === 'PREPARING' ? '🔥 Hazırlamaya Başla' : '✅ Sipariş Hazır'}
                            </h3>
                            <p className={`text-xs ${themeStyles.headerSub} mt-1 uppercase tracking-wider`}>Personel PIN kodunuzu girin</p>
                        </div>

                        {/* PIN Display */}
                        <div className="p-6">
                            <div className={`flex justify-center space-x-4 mb-6 ${isPinError ? 'animate-shake' : ''}`}>
                                {[0, 1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${i < enteredPin.length
                                            ? isPinError
                                                ? 'bg-red-500 border-red-500 scale-110'
                                                : `${themeStyles.accent.replace('bg-', 'bg-')} ${themeStyles.accent.replace('bg-', 'border-')} scale-110`
                                            : `${themeStyles.cardBorder} bg-transparent`
                                            }`}
                                    />
                                ))}
                            </div>

                            {isPinError && (
                                <p className="text-red-400 text-center text-sm font-bold mb-4 animate-pulse">
                                    ❌ Hatalı PIN kodu! Tekrar deneyin.
                                </p>
                            )}

                            {isUpdating && (
                                <p className="text-[#FF8A65] text-center text-sm font-bold mb-4 animate-pulse">
                                    ⏳ Doğrulanıyor...
                                </p>
                            )}

                            {/* Numpad */}
                            <div className="grid grid-cols-3 gap-3">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handlePinInput(num)}
                                        disabled={isUpdating}
                                        className={`h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all active:scale-95 disabled:opacity-50 ${num === 'C'
                                            ? 'bg-red-900/40 text-red-300 border border-red-800/50'
                                            : num === '⌫'
                                                ? 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
                                                : `${themeStyles.appBg} ${themeStyles.textColor} hover:${themeStyles.accent} hover:${themeStyles.accentText} border ${themeStyles.cardBorder}`
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    setShowPinModal(false);
                                    setPendingAction(null);
                                    setEnteredPin('');
                                }}
                                className={`w-full mt-6 py-3 ${themeStyles.headerSub} font-bold hover:text-red-400 transition-colors uppercase tracking-wider text-sm`}
                            >
                                İptal Et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
