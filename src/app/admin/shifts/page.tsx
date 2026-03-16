'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaCashRegister, FaExchangeAlt, FaHistory, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Shift {
  id: string;
  openedAt: string;
  closedAt: string | null;
  openingBalance: number;
  closingBalance: number | null;
  expectedCash: number | null;
  actualCash: number | null;
  difference: number | null;
  status: 'OPEN' | 'CLOSED';
  notes: string | null;
  staff: { name: string };
}

export default function ShiftsPage() {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [recentShifts, setRecentShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [registers, setRegisters] = useState<any[]>([]);
  const [selectedRegisterId, setSelectedRegisterId] = useState('');

  useEffect(() => {
    fetchRegisters();
  }, []);

  useEffect(() => {
    if (selectedRegisterId) {
      fetchActiveShift();
    }
  }, [selectedRegisterId]);

  const fetchRegisters = async () => {
    try {
      // For now, we'll just fetch from a generic endpoint or a new one
      const res = await fetch('/api/admin/staff'); // Just using an existing one to get business info indirectly if needed
      // Actually let's just assume "Ana Kasa" exists from our init script
      setRegisters([{ id: 'default', name: 'Ana Kasa' }]); // Placeholder until we have a real list
      setSelectedRegisterId('default'); 
    } catch (error) {
      toast.error('Kasalar yüklenemedi.');
    }
  };

  const fetchActiveShift = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shifts?registerId=${selectedRegisterId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveShift(data.activeShift);
      }
    } catch (error) {
      toast.error('Vardiya bilgisi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async () => {
    if (!openingBalance) return toast.error('Açılış bakiyesi girmelisiniz.');
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerId: selectedRegisterId,
          openingBalance: Number(openingBalance),
          staffId: 'current', // Logic for current user handled by middleware info
          notes: 'Güne başlanıyor'
        })
      });

      if (res.ok) {
        toast.success('Vardiya başarıyla açıldı.');
        fetchActiveShift();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Açılış yapılamadı.');
      }
    } catch (error) {
      toast.error('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!actualCash) return toast.error('Kasadaki nakit miktarını girmelisiniz.');

    setLoading(true);
    try {
      const res = await fetch('/api/admin/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: activeShift?.id,
          actualCash: Number(actualCash),
          notes: closingNotes
        })
      });

      if (res.ok) {
        toast.success('Vardiya kapatıldı. Z-Raporu oluşturuldu.');
        setActiveShift(null);
        setActualCash('');
        setClosingNotes('');
      }
    } catch (error) {
      toast.error('Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Vardiya & Kasa Yönetimi
          </h1>
          <p className="text-slate-400">Günlük kasa raporlarını yönetin ve Z-Raporu alın.</p>
        </header>

        {activeShift ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Active Shift Info */}
            <div className="md:col-span-2 bg-slate-800/40 rounded-3xl p-8 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <h2 className="text-xl font-bold">Vardiya Açık</h2>
                  </div>
                  <p className="text-sm text-slate-400">Sorumlu: <span className="text-white font-medium">{activeShift.staff?.name}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Açılış Zamanı</p>
                  <p className="text-sm font-mono">{new Date(activeShift.openedAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 text-center">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-1">Açılış Bakiyesi</p>
                  <h3 className="text-3xl font-black text-blue-400">₺{activeShift.openingBalance}</h3>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/10">
                  <p className="text-xs text-slate-500 mb-1">Beklenen Satış</p>
                  <h3 className="text-3xl font-black text-emerald-400">Hesaplanıyor...</h3>
                </div>
              </div>

              <div className="space-y-6 bg-slate-900/40 p-8 rounded-3xl border border-slate-700/50">
                <h4 className="font-bold flex items-center gap-2 text-red-400">
                  <FaExclamationTriangle /> Gün Sonu Kapatma (Z-Raporu)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Kasadaki Toplam Nakit (₺)</label>
                    <input 
                      type="number"
                      value={actualCash}
                      onChange={e => setActualCash(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-all text-xl font-black"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Kapanış Notları</label>
                    <textarea 
                      value={closingNotes}
                      onChange={e => setClosingNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:border-red-500 outline-none transition-all text-sm h-[52px] resize-none"
                      placeholder="Eksik/Fazla açıklaması..."
                    />
                  </div>
                </div>
                <button 
                  onClick={handleCloseShift}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                >
                  <FaClock /> VARDIYAYI KAPAT & Z-RAPORU AL
                </button>
              </div>
            </div>

            {/* Side Tools */}
            <div className="space-y-6">
               <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FaExchangeAlt className="text-blue-400" /> Hızlı İşlemler
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full bg-slate-700/30 hover:bg-slate-700/50 p-4 rounded-xl text-left text-sm font-medium transition-all flex justify-between items-center group">
                      Para Giriş/Çıkış <FaCashRegister className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full bg-slate-700/30 hover:bg-slate-700/50 p-4 rounded-xl text-left text-sm font-medium transition-all flex justify-between items-center group">
                      Ara Rapor Yazdır <FaPrint className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
               </div>
               <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                 <FaInfoCircle className="inline mr-2" />
                 Shift (Vardiya) kapatıldığında kasa bakiyesi otomatik olarak devredilir ve manager'a anlık bildirim gider.
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-slate-800/40 rounded-[3rem] p-12 text-center border border-slate-700/50 shadow-2xl">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
              <FaCashRegister />
            </div>
            <h2 className="text-3xl font-black mb-4">Vardiya Açılışı</h2>
            <p className="text-slate-400 mb-10 leading-relaxed text-lg">
              Satiş yapabilmek için kasayı aktif hale getirmeniz ve başlangıç bakiyesini girmeniz gerekiyor.
            </p>

            <div className="text-left mb-8">
               <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest px-2">Açılış Bakiyesi (₺)</label>
               <input 
                type="number"
                value={openingBalance}
                onChange={e => setOpeningBalance(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-3xl px-8 py-5 text-4xl font-black text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-800"
                placeholder="0.00"
               />
            </div>

            <button 
              onClick={handleOpenShift}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-6 rounded-3xl transition-all shadow-xl shadow-emerald-500/20 text-xl tracking-tight"
            >
              {loading ? 'Açılıyor...' : 'GÜNÜ BAŞLAT'}
            </button>
          </div>
        )}

        {/* Recent History Placeholder */}
        <section className="mt-20">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FaHistory /> Geçmiş Vardiyalar
          </h3>
          <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Sorumlu</th>
                  <th className="px-6 py-4">Açılış</th>
                  <th className="px-6 py-4">Kapanış</th>
                  <th className="px-6 py-4">Ciro</th>
                  <th className="px-6 py-4 text-right">Fark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="text-sm text-slate-500">
                  <td colSpan={5} className="px-6 py-12 text-center italic">Henüz kapalı vardiya kaydı bulunamadı.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function FaInfoCircle(props: any) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" {...props}>
      <path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path>
    </svg>
  );
}
