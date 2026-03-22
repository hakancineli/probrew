'use client';

import { useState, useEffect, useMemo } from 'react';
import { FaTable, FaPlus, FaTrash, FaEdit, FaUsers, FaDotCircle, FaQrcode, FaTimes, FaPrint, FaCalendarAlt, FaPhone, FaClock, FaCheck, FaBan, FaChair, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

interface Reservation {
  id: string;
  tableId: string | null;
  customerName: string;
  customerPhone: string | null;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  endTime: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string | null;
  table: { id: string; name: string; capacity: number } | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Bekliyor', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  CONFIRMED: { label: 'Onaylandı', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  SEATED: { label: 'Oturdu', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  COMPLETED: { label: 'Tamamlandı', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  CANCELLED: { label: 'İptal', color: 'text-red-400', bg: 'bg-red-500/10' },
  NO_SHOW: { label: 'Gelmedi', color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

export default function TablesManagementPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'reservations'>('tables');
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [qrModal, setQrModal] = useState<Table | null>(null);
  const [businessSlug, setBusinessSlug] = useState('');
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({ name: '', capacity: '2' });
  const [resFormData, setResFormData] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    guestCount: '2',
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:00',
    endTime: '',
    notes: '',
  });

  // Count reservations per table for badges
  const reservationCountByTable = useMemo(() => {
    const map: Record<string, number> = {};
    reservations.forEach(r => {
      if (r.tableId && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(r.status)) {
        map[r.tableId] = (map[r.tableId] || 0) + 1;
      }
    });
    return map;
  }, [reservations]);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data.tables || []);
        if (data.businessSlug) setBusinessSlug(data.businessSlug);
      }
    } catch (error) {
      toast.error('Masalar yüklenemedi.');
    }
  };

  const fetchReservations = async (date?: string) => {
    try {
      const targetDate = date || selectedDate;
      const res = await fetch(`/api/admin/reservations?date=${targetDate}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      toast.error('Rezervasyonlar yüklenemedi.');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTables(), fetchReservations()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  // --- Table CRUD ---
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
        body: JSON.stringify(body),
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

  // --- Reservation CRUD ---
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingReservation ? 'PUT' : 'POST';
    const body = editingReservation
      ? { ...resFormData, id: editingReservation.id }
      : resFormData;
    try {
      const res = await fetch('/api/admin/reservations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(editingReservation ? 'Rezervasyon güncellendi.' : 'Rezervasyon oluşturuldu.');
        setIsReservationModalOpen(false);
        setEditingReservation(null);
        resetResForm();
        fetchReservations();
      } else {
        const data = await res.json();
        toast.error(data.error || 'İşlem başarısız.');
      }
    } catch (error) {
      toast.error('İşlem başarısız.');
    }
  };

  const handleReservationStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success('Durum güncellendi.');
        fetchReservations();
      }
    } catch (error) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleReservationDelete = async (id: string) => {
    if (!confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/reservations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Rezervasyon silindi.');
        fetchReservations();
      }
    } catch (error) {
      toast.error('Silme başarısız.');
    }
  };

  const resetResForm = () => {
    setResFormData({
      tableId: '',
      customerName: '',
      customerPhone: '',
      guestCount: '2',
      reservationDate: selectedDate,
      reservationTime: '19:00',
      endTime: '',
      notes: '',
    });
  };

  const openNewReservation = (preselectedTableId?: string) => {
    setEditingReservation(null);
    resetResForm();
    if (preselectedTableId) {
      setResFormData(prev => ({ ...prev, tableId: preselectedTableId }));
    }
    setIsReservationModalOpen(true);
  };

  const openEditReservation = (r: Reservation) => {
    setEditingReservation(r);
    setResFormData({
      tableId: r.tableId || '',
      customerName: r.customerName,
      customerPhone: r.customerPhone || '',
      guestCount: r.guestCount.toString(),
      reservationDate: r.reservationDate.split('T')[0],
      reservationTime: r.reservationTime,
      endTime: r.endTime || '',
      notes: r.notes || '',
    });
    setIsReservationModalOpen(true);
  };

  // Date navigation
  const navigateDate = (direction: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const activeReservations = reservations.filter(r => !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(r.status));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Masa & Rezervasyon</h1>
            <p className="text-slate-400">Masalarınızı yönetin ve rezervasyonları takip edin.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openNewReservation()}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-amber-900/40"
            >
              <FaCalendarAlt /> Yeni Rezervasyon
            </button>
            <button
              onClick={() => {
                setEditingTable(null);
                setFormData({ name: '', capacity: '2' });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <FaPlus /> Yeni Masa
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl w-fit border border-slate-800">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'tables' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            🪑 Masalar ({tables.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'reservations' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            📅 Rezervasyonlar
            {activeReservations.length > 0 && (
              <span className="bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded-full">{activeReservations.length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Yükleniyor...</div>
        ) : activeTab === 'tables' ? (
          /* =================== TABLES TAB =================== */
          tables.length === 0 ? (
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
                  {/* Reservation badge */}
                  {reservationCountByTable[table.id] && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                      <FaCalendarAlt size={8} />
                      {reservationCountByTable[table.id]}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${table.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-500' : table.status === 'RESERVED' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                      <FaTable size={24} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openNewReservation(table.id)}
                        className="p-2 hover:bg-amber-500/20 rounded-lg text-amber-400 transition-colors"
                        title="Rezervasyon Ekle"
                      >
                        <FaCalendarAlt size={12} />
                      </button>
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

                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${table.status === 'AVAILABLE' ? 'text-emerald-500' : table.status === 'RESERVED' ? 'text-amber-500' : 'text-red-500'}`}>
                    <FaDotCircle className={table.status === 'AVAILABLE' ? 'animate-pulse' : ''} />
                    {table.status === 'AVAILABLE' ? 'Müsait' : table.status === 'RESERVED' ? 'Rezerve' : 'Dolu'}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* =================== RESERVATIONS TAB =================== */
          <div>
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
              <button onClick={() => navigateDate(-1)} className="p-3 hover:bg-slate-700 rounded-xl transition-colors font-black text-lg">←</button>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  {isToday ? '📍 BUGÜN' : 'TARİH'}
                </p>
                <p className="text-lg font-black">{formatDateDisplay(selectedDate)}</p>
              </div>
              <button onClick={() => navigateDate(1)} className="p-3 hover:bg-slate-700 rounded-xl transition-colors font-black text-lg">→</button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-white">{reservations.length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-amber-400">{reservations.filter(r => r.status === 'PENDING').length}</p>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Bekliyor</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-blue-400">{reservations.filter(r => r.status === 'CONFIRMED').length}</p>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Onaylı</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-emerald-400">{reservations.filter(r => r.status === 'SEATED').length}</p>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Oturdu</p>
              </div>
            </div>

            {/* Reservation List */}
            {reservations.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
                <FaCalendarAlt className="mx-auto text-6xl text-slate-800 mb-6" />
                <h2 className="text-xl font-bold text-slate-500 mb-2">Bu tarihte rezervasyon yok.</h2>
                <p className="text-sm text-slate-600">Yeni rezervasyon eklemek için yukarıdaki butona tıklayın.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => {
                  const s = STATUS_MAP[r.status] || STATUS_MAP.PENDING;
                  return (
                    <div
                      key={r.id}
                      className={`bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 transition-all hover:bg-slate-800/40 ${r.status === 'CANCELLED' || r.status === 'NO_SHOW' ? 'opacity-50' : ''}`}
                    >
                      {/* Time */}
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="bg-slate-800 p-3 rounded-xl">
                          <FaClock className="text-white" size={18} />
                        </div>
                        <div>
                          <p className="text-lg font-black">{r.reservationTime}</p>
                          {r.endTime && <p className="text-xs text-slate-500">→ {r.endTime}</p>}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-black truncate">{r.customerName}</p>
                          <span className={`${s.bg} ${s.color} text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><FaUsers size={10} /> {r.guestCount} Kişi</span>
                          {r.customerPhone && <span className="flex items-center gap-1"><FaPhone size={10} /> {r.customerPhone}</span>}
                          {r.table && <span className="flex items-center gap-1"><FaChair size={10} /> {r.table.name}</span>}
                        </div>
                        {r.notes && <p className="text-xs text-slate-600 mt-1 italic">📝 {r.notes}</p>}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {r.status === 'PENDING' && (
                          <button onClick={() => handleReservationStatusChange(r.id, 'CONFIRMED')} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors" title="Onayla">
                            <FaCheck size={14} />
                          </button>
                        )}
                        {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                          <button onClick={() => handleReservationStatusChange(r.id, 'SEATED')} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors" title="Oturdu">
                            <FaChair size={14} />
                          </button>
                        )}
                        {r.status === 'SEATED' && (
                          <button onClick={() => handleReservationStatusChange(r.id, 'COMPLETED')} className="p-2 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg text-slate-400 transition-colors" title="Tamamla">
                            <FaCheck size={14} />
                          </button>
                        )}
                        {!['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(r.status) && (
                          <>
                            <button onClick={() => handleReservationStatusChange(r.id, 'CANCELLED')} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="İptal">
                              <FaBan size={14} />
                            </button>
                            <button onClick={() => handleReservationStatusChange(r.id, 'NO_SHOW')} className="p-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg text-orange-400 transition-colors" title="Gelmedi">
                              <FaEye size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => openEditReservation(r)} className="p-2 bg-slate-500/10 hover:bg-slate-500/20 rounded-lg text-slate-400 transition-colors" title="Düzenle">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleReservationDelete(r.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors" title="Sil">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================== TABLE EDIT MODAL =================== */}
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

        {/* =================== RESERVATION MODAL =================== */}
        {isReservationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black">{editingReservation ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon'}</h2>
                  <p className="text-sm text-slate-500">Misafir bilgilerini ve masa tercihini girin.</p>
                </div>
                <button onClick={() => { setIsReservationModalOpen(false); setEditingReservation(null); }} className="p-2 hover:bg-slate-800 rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleReservationSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Misafir Adı *</label>
                    <input
                      type="text"
                      required
                      value={resFormData.customerName}
                      onChange={e => setResFormData({ ...resFormData, customerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={resFormData.customerPhone}
                      onChange={e => setResFormData({ ...resFormData, customerPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                      placeholder="0532 xxx xx xx"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Kişi Sayısı *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={resFormData.guestCount}
                      onChange={e => setResFormData({ ...resFormData, guestCount: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tarih *</label>
                    <input
                      type="date"
                      required
                      value={resFormData.reservationDate}
                      onChange={e => setResFormData({ ...resFormData, reservationDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Saat *</label>
                    <input
                      type="time"
                      required
                      value={resFormData.reservationTime}
                      onChange={e => setResFormData({ ...resFormData, reservationTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bitiş Saati</label>
                    <input
                      type="time"
                      value={resFormData.endTime}
                      onChange={e => setResFormData({ ...resFormData, endTime: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Masa</label>
                    <select
                      value={resFormData.tableId}
                      onChange={e => setResFormData({ ...resFormData, tableId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all"
                    >
                      <option value="">Masa Seçilmedi</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.capacity} kişi)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Notlar</label>
                  <textarea
                    value={resFormData.notes}
                    onChange={e => setResFormData({ ...resFormData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-amber-500 outline-none transition-all resize-none h-20"
                    placeholder="Doğum günü, allerji bilgisi, özel istek..."
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsReservationModalOpen(false); setEditingReservation(null); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-900/20"
                  >
                    {editingReservation ? 'Güncelle' : 'Rezervasyon Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================== QR CODE MODAL =================== */}
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
