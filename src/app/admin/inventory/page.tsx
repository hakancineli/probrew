'use client';

import { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaArrowDown, FaArrowUp, FaSync, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'SALE' | 'MANUAL_ADJUST' | 'WASTE' | 'PURCHASE';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string | null;
  createdAt: string;
  ingredient?: { name: string, unit: string };
  product?: { name: string };
}

export default function InventoryAuditPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inventory/logs');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      toast.error('Hareket listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    (t.ingredient?.name || t.product?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (t.notes || '').toLowerCase().includes(filter.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SALE': return { label: 'Satış', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'WASTE': return { label: 'Zayiat', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      case 'PURCHASE': return { label: 'Alım', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      default: return { label: 'Düzeltme', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Envanter Denetimi</h1>
            <p className="text-slate-400">Tüm stok hareketlerini ve sayım geçmişini geriye dönük inceleyin.</p>
          </div>
          <button 
            onClick={fetchTransactions}
            className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* Filter Bar */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl mb-8 flex gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Hammadde, Ürün veya İşlem Notu Ara..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Zaman</th>
                <th className="px-6 py-6">Öğe</th>
                <th className="px-6 py-6">İşlem Türü</th>
                <th className="px-6 py-6">Değişim</th>
                <th className="px-6 py-6">Yeni Stok</th>
                <th className="px-8 py-6">Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500">Yükleniyor...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-500">Kayıt bulunamadı.</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const style = getTypeLabel(t.type);
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/20 transition-all group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-xs font-mono text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          {new Date(t.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-100 uppercase tracking-tight">
                          {t.ingredient?.name || t.product?.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {t.ingredient ? 'Hammadde' : 'Ürün'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${style.color}`}>
                           {style.label}
                         </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-1 font-black ${t.quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.quantity > 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                          {Math.abs(t.quantity)} {t.ingredient?.unit || 'adet'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-mono bg-slate-800/50 px-2 py-1 rounded w-fit text-slate-300">
                          {t.newStock.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs text-slate-400 italic">
                          {t.notes || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend / Info */}
        <div className="mt-12 flex gap-8 items-center justify-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Satış Kaynaklı</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Zayiat / Fire</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Satın Alma</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Sayım Farkı</div>
        </div>
      </div>
    </div>
  );
}
