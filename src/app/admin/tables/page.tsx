'use client';

import { useState, useEffect } from 'react';
import { FaTable, FaPlus, FaTrash, FaEdit, FaUsers, FaDotCircle, FaQrcode, FaTimes, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export default function TablesManagementPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrModal, setQrModal] = useState<Table | null>(null);
  const [businessSlug, setBusinessSlug] = useState('');
  
  const [formData, setFormData] = useState({ name: '', capacity: '2' });

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        if (data.businessSlug) setBusinessSlug(data.businessSlug);
      }
    } catch (error) {
      toast.error('Masalar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingTable ? 'PUT' : 'POST';
    const body = editingTable 
      ? { ...formData, id: editingTable.id }
      : formData;

    try {
      const res = await fetch('/api/admin/tables', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(editingTable ? 'Masa güncellendi.' : 'Masa eklendi.');
        setIsModalOpen(false);
        setEditingTable(null);
        setFormData({ name: '', capacity: '2' });
        fetchTables();
      }
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu masayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/tables?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Masa silindi.');
        fetchTables();
      }
    } catch (error) {
      toast.error('Silme işlemi başarısız.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Masa Yönetimi</h1>
            <p className="text-slate-400">İşletme yerleşimini ve masa doluluk oranlarını yönetin.</p>
          </div>
          <button 
            onClick={() => {
              setEditingTable(null);
              setFormData({ name: '', capacity: '2' });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40"
          >
            <FaPlus /> Yeni Masa Ekle
          </button>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Yükleniyor...</div>
        ) : tables.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
            <FaTable className="mx-auto text-6xl text-slate-800 mb-6" />
            <h2 className="text-xl font-bold text-slate-500">Henüz masa tanımlanmamış.</h2>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tables.map((table) => (
              <div 
                key={table.id}
                className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 group relative overflow-hidden transition-all hover:bg-slate-800/40"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${table.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    <FaTable size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setQrModal(table)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                      title="Masa QR Kodu"
                    >
                      <FaQrcode size={12} />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingTable(table);
                        setFormData({ name: table.name, capacity: table.capacity.toString() });
                        setIsModalOpen(true);
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(table.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black mb-1">{table.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
                  <FaUsers /> {table.capacity} Kişilik
                </div>

                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${table.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-red-500'}`}>
                   <FaDotCircle className={table.status === 'AVAILABLE' ? 'animate-pulse' : ''} />
                   {table.status === 'AVAILABLE' ? 'Müsait' : 'Dolu'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-800">
                <h2 className="text-2xl font-black">{editingTable ? 'Masayı Düzenle' : 'Yeni Masa'}</h2>
                <p className="text-sm text-slate-500">Masa adı ve kapasitesini belirleyin.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Masa Adı / No</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                    placeholder="Örn: Masa 12"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Kapasite (Kişi)</label>
                  <input 
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                    placeholder="2"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20"
                  >
                    {editingTable ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {qrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white text-slate-900 rounded-[3rem] w-full max-w-sm overflow-hidden p-8 text-center relative shadow-2xl">
               <button 
                onClick={() => setQrModal(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
               >
                 <FaTimes size={20} />
               </button>

               <div className="w-20 h-2 bg-blue-600 rounded-full mx-auto mb-8" />
               
               <h2 className="text-3xl font-black mb-1">{qrModal.name}</h2>
               <p className="text-slate-500 text-sm mb-8 font-medium">Müşteriler bu kodu okutarak masadan sipariş verebilir.</p>

               <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-8 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${businessSlug}?tableId=${qrModal.id}`
                    )}`} 
                    alt="Table QR Code"
                    className="w-48 h-48 rounded-2xl shadow-xl"
                  />
               </div>

               <div className="bg-slate-100 p-4 rounded-2xl mb-8 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Masa Bağlantısı</p>
                  <p className="text-[11px] font-mono break-all text-slate-600">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${businessSlug}?tableId=${qrModal.id}`}
                  </p>
               </div>

               <button 
                onClick={() => window.print()}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
               >
                 <FaPrint /> QR Kodu Yazdır
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
