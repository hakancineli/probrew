'use client';

import { useState } from 'react';
import { FaPlus, FaMinus, FaShoppingCart, FaBell, FaUtensils, FaCheckCircle, FaTimes, FaRedo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function MenuClient({ business, categories, table }: any) {
    const [cart, setCart] = useState<any[]>([]);
    const [isCallingWaiter, setIsCallingWaiter] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    
    // Theme Logic
    const activeTheme = business.systemSettings?.activeTheme || 'Nordic';
    const themePrimary = activeTheme === 'Turkish' ? '#dc2626' : business.primaryColor;

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        toast.success(`${product.name} eklendi.`);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
            }
            return prev.filter(item => item.id !== productId);
        });
    };

    const callWaiter = async () => {
        if (!table) return;
        setIsCallingWaiter(true);
        try {
            const res = await fetch('/api/waiter-call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    tableId: table.id,
                    tableName: table.name
                })
            });
            if (res.ok) {
                toast.success('Garson çağrıldı! Hemen geliyoruz.');
            }
        } catch (error) {
            toast.error('Bağlantı hatası.');
        } finally {
            setIsCallingWaiter(false);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    tableId: table?.id || null,
                    customerName: table ? `${table.name} Müşterisi` : 'QR Müşteri',
                    items: cart.map(item => ({
                        productId: item.id,
                        productName: item.name,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.price * item.quantity
                    })),
                    totalAmount,
                    status: 'PENDING',
                    source: 'WEBSITE',
                    paymentMethod: 'CASH' // Changed at register for table service
                })
            });

            if (res.ok) {
                setOrderSuccess(true);
                setCart([]);
                setIsCartOpen(false);
            } else {
                toast.error('Sipariş iletilemedi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
                <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8">
                    <FaCheckCircle size={64} />
                </div>
                <h2 className="text-3xl font-black mb-4">Siparişiniz Alındı!</h2>
                <p className="text-slate-500 mb-12 max-w-xs mx-auto font-medium">
                    {table ? `${table.name} için hazırlıklara başladık. Afiyet olsun!` : 'Siparişiniz hazırlık sırasına eklendi.'}
                </p>
                <button 
                    onClick={() => setOrderSuccess(false)}
                    className="w-full max-w-xs py-4 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"
                    style={{ backgroundColor: themePrimary }}
                >
                    <FaRedo /> Yeni Sipariş Ver
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Table Information & Actions */}
            {table && (
                <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <FaUtensils size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Masadasınız</p>
                            <h3 className="text-sm font-black text-slate-900">{table.name}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={callWaiter}
                        disabled={isCallingWaiter}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-black text-xs border border-amber-100 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isCallingWaiter ? 'Sinyal Gönderiliyor...' : <><FaBell /> GARSON ÇAĞIR</>}
                    </button>
                </div>
            )}

            {/* Menu List */}
            <div className="max-w-3xl mx-auto px-4 mt-8">
                {Object.entries(categories).map(([category, products]: [string, any]) => (
                    <section key={category} id={category} className="mb-12">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <span className="w-2 h-8 rounded-full" style={{ backgroundColor: themePrimary }} />
                            {category}
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {products.map((product: any) => (
                                <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex gap-4 items-center">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
                                        <Image 
                                            src={product.imageUrl || '/images/placeholder-product.png'} 
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-900">{product.name}</h3>
                                            <span className="font-black text-lg" style={{ color: themePrimary }}>
                                                ₺{product.price}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                                            {product.description || 'Bu ürün için henüz bir açıklama girilmemiş.'}
                                        </p>
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs transition-colors active:scale-95"
                                        >
                                            <FaPlus size={10} /> SEPETE EKLE
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Cart FAB */}
            {cart.length > 0 && (
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-6 left-6 right-6 z-50 text-white rounded-[2rem] py-5 px-8 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-300"
                    style={{ backgroundColor: themePrimary }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-black text-sm">
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">SİPARİŞİ TAMAMLA</span>
                    </div>
                    <span className="font-black text-xl tracking-tighter">₺{totalAmount}</span>
                </button>
            )}

            {/* Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-20 duration-300">
                        <header className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black">Sepetiniz</h2>
                                <p className="text-slate-400 text-sm font-medium">Lütfen siparişinizi onaylayın.</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900">
                                <FaTimes size={20} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden relative">
                                            <Image src={item.imageUrl || '/images/placeholder-product.png'} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{item.name}</h4>
                                            <p className="text-xs text-slate-400 font-bold">₺{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="font-black w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <footer className="p-8 bg-slate-50 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Toplam Tutar</span>
                                <span className="text-3xl font-black tracking-tighter">₺{totalAmount}</span>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full py-5 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                                style={{ backgroundColor: themePrimary }}
                            >
                                {isCheckingOut ? (
                                     <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>SİPARİŞİ MASAYA GÖNDER <FaUtensils /></>
                                )}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
