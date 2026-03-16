'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaCheckCircle, FaTimesCircle, FaClock, FaUsers, FaCoffee, FaChartBar, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Business {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  contactEmail: string;
  createdAt: string;
  _count: {
    baristas: number;
    products: number;
    orders: number;
  };
  trialEndsAt?: string;
  subscriptionEnd?: string;
}

export default function SuperAdminDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    slug: '',
    contactEmail: '',
    initialManagerPassword: 'probrew-pass-2026'
  });

  // Management Modal State
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(false);

  // Stats & Tabs
  const [activeTab, setActiveTab] = useState<'businesses' | 'analytics' | 'logs'>('businesses');
  const [globalData, setGlobalData] = useState<any>(null);

  useEffect(() => {
    fetchBusinesses();
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch('/api/superadmin/stats', {
          headers: { 'x-user-role': 'SUPERADMIN' }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalData(data);
      }
    } catch (e) {
      console.error('Stats fetch error');
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await fetch('/api/superadmin/businesses');
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data);
      }
    } catch (error) {
      toast.error('İşletmeler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusiness)
      });

      if (res.ok) {
        toast.success('İşletme başarıyla oluşturuldu!');
        setShowModal(false);
        setNewBusiness({ name: '', slug: '', contactEmail: '', initialManagerPassword: 'probrew-pass-2026' });
        fetchBusinesses();
      } else {
        const data = await res.json();
        toast.error(data.error || 'İşletme oluşturulamadı.');
      }
    } catch (error) {
      toast.error('Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/superadmin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'SUPERADMIN' 
        },
        body: JSON.stringify({ subscriptionStatus: newStatus })
      });
      if (res.ok) {
        toast.success('Hizmet durumu güncellendi.');
        fetchBusinesses();
        if (selectedBusiness) setSelectedBusiness({ ...selectedBusiness, subscriptionStatus: newStatus });
      }
    } catch (e) {
      toast.error('Güncellenemedi.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm('DİKKAT: Bu işletme ve TÜM verileri (ürünler, siparişler, personel) kalıcı olarak silinecek. Emin misiniz?')) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/superadmin/businesses/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'SUPERADMIN' }
      });
      if (res.ok) {
        toast.success('İşletme silindi.');
        setIsManaging(false);
        fetchBusinesses();
      }
    } catch (e) {
      toast.error('Silinemedi.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExtendTrial = async (business: Business) => {
    const currentEnd = business.trialEndsAt ? new Date(business.trialEndsAt) : new Date();
    const newEnd = new Date(currentEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/superadmin/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'SUPERADMIN' 
        },
        body: JSON.stringify({ trialEndsAt: newEnd.toISOString() })
      });
      if (res.ok) {
        toast.success(`Trial +7 gün uzatıldı. Yeni: ${newEnd.toLocaleDateString('tr-TR')}`);
        fetchBusinesses();
        if (selectedBusiness) setSelectedBusiness({ ...selectedBusiness, trialEndsAt: newEnd.toISOString() });
      }
    } catch (e) {
      toast.error('Uzatılamadı.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && businesses.length === 0) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
            ProBrew SuperAdmin
          </h1>
          <p className="text-slate-400 font-medium">SaaS Yönetim ve Tenant Dashboard</p>
        </div>
        
        <div className="flex flex-1 w-full md:w-auto max-w-md relative group">
          <input 
            type="text"
            placeholder="İşletme veya URL ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-6 py-3 pl-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all group-hover:border-slate-600"
          />
          <span className="absolute left-4 top-3.5 text-slate-500">🔍</span>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
          >
            <FaPlus /> Yeni İşletme
          </button>
          <button 
            onClick={logout}
            className="p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-700/50"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex gap-4 mb-8 border-b border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('businesses')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'businesses' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🏘️ İşletmeler
          {activeTab === 'businesses' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />}
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📊 Global Analiz
          {activeTab === 'analytics' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />}
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'logs' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📜 Sistem Logları
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />}
        </button>
      </div>

      {activeTab === 'businesses' && (
          <>
      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <FaBuilding size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-sm">Toplam İşletme</p>
          <h3 className="text-2xl font-bold mt-1">{businesses.length}</h3>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FaCheckCircle size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-sm">Aktif Abonelik</p>
          <h3 className="text-2xl font-bold mt-1 text-emerald-400">
            {businesses.filter(b => b.subscriptionStatus === 'ACTIVE').length}
          </h3>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
              <FaClock size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-sm">Deneme Süreci</p>
          <h3 className="text-2xl font-bold mt-1 text-orange-400">
             {businesses.filter(b => b.subscriptionStatus === 'TRIAL').length}
          </h3>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
              <FaChartBar size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-sm">Toplam Sipariş (Global)</p>
          <h3 className="text-2xl font-bold mt-1">
            {businesses.reduce((sum, b) => sum + (b._count?.orders || 0), 0)}
          </h3>
        </div>
      </div>

      {/* Business List */}
      <div className="max-w-7xl mx-auto bg-slate-800/30 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/80 text-slate-400 text-sm">
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">İşletme</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Durum</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">İletişim</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Metrikler</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">Kayıt</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-200">
            {filteredBusinesses.map((business) => (
              <tr key={business.id} className="hover:bg-slate-700/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {business.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">/{business.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    business.subscriptionStatus === 'ACTIVE' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : business.subscriptionStatus === 'TRIAL'
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {business.subscriptionStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {business.contactEmail}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-blue-400" title="Personel">
                      <FaUsers /> {business._count.baristas}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400" title="Ürünler">
                      <FaCoffee /> {business._count.products}
                    </div>
                    <div className="flex items-center gap-1 text-purple-400" title="Siparişler">
                      <FaChartBar /> {business._count.orders}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(business.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => {
                        setSelectedBusiness(business);
                        setIsManaging(true);
                    }}
                    className="text-blue-500 hover:text-blue-400 font-bold text-sm transition-colors border border-blue-500/20 px-4 py-2 rounded-lg hover:bg-blue-500/10"
                  >
                    Yönet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}

      {activeTab === 'analytics' && globalData && (
          <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-indigo-600/10 p-10 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:scale-110 transition-transform">
                          <FaChartBar size={120} />
                      </div>
                      <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-2">Global Ciro</p>
                      <h3 className="text-5xl font-black text-white tracking-tighter">₺{globalData.stats.totalRevenue.toLocaleString('tr-TR')}</h3>
                      <p className="mt-4 text-indigo-400/60 text-sm font-medium">Toplam tamamlanan tüm siparişler</p>
                  </div>
                  <div className="bg-emerald-600/10 p-10 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform">
                          <FaUsers size={120} />
                      </div>
                      <p className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-2">Toplam Sipariş</p>
                      <h3 className="text-5xl font-black text-white tracking-tighter">{globalData.stats.totalOrders}</h3>
                      <p className="mt-4 text-emerald-400/60 text-sm font-medium">Platform geneli işlem hacmi</p>
                  </div>
                  <div className="bg-blue-600/10 p-10 rounded-[2.5rem] border border-blue-500/20 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:scale-110 transition-transform">
                          <FaBuilding size={120} />
                      </div>
                      <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-2">Aktif SaaS</p>
                      <h3 className="text-5xl font-black text-white tracking-tighter">{globalData.stats.activeSubscriptions}</h3>
                      <p className="mt-4 text-blue-400/60 text-sm font-medium">Ödeme yapan aktif aboneler</p>
                  </div>
              </div>

              <div className="bg-slate-800/30 rounded-3xl border border-slate-700/50 p-8 backdrop-blur-md">
                   <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                       <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><FaClock /></span>
                       Son Sipariş Akışı (Global)
                   </h3>
                   <div className="space-y-4">
                       {globalData.recentOrders.map((order: any) => (
                           <div key={order.id} className="flex items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
                               <div className="flex items-center gap-5">
                                   <div className="p-3 bg-slate-800 rounded-xl font-bold text-xs text-slate-500 font-mono">
                                       #{order.orderNumber}
                                   </div>
                                   <div>
                                       <p className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{order.business.name}</p>
                                       <p className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleTimeString('tr-TR')} • {order.customerName}</p>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <p className="font-black text-lg text-white">₺{order.finalAmount}</p>
                                   <p className={`text-[10px] font-black uppercase tracking-widest ${
                                       order.status === 'COMPLETED' ? 'text-emerald-400' : 'text-orange-400'
                                   }`}>{order.status}</p>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>
          </div>
      )}

      {activeTab === 'logs' && globalData && (
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
               <div className="bg-slate-800/30 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-md">
                   <div className="p-8 border-b border-slate-700/50 flex justify-between items-center">
                       <h3 className="text-xl font-black flex items-center gap-3">
                           <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><FaChartBar /></span>
                           Sistem Hareket Kayıtları (Audit Logs)
                       </h3>
                       <p className="text-xs text-slate-500 font-mono">Platform geneli son 20 işlem</p>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-left">
                           <thead>
                               <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                   <th className="px-8 py-4">Zaman</th>
                                   <th className="px-8 py-4">İşletme</th>
                                   <th className="px-8 py-4">İşlem</th>
                                   <th className="px-8 py-4">Kullanıcı</th>
                                   <th className="px-8 py-4">Entity</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-700/30">
                               {globalData.recentLogs.map((log: any) => (
                                   <tr key={log.id} className="hover:bg-emerald-500/5 transition-all group">
                                       <td className="px-8 py-5 text-sm text-slate-400 font-mono">
                                           {new Date(log.createdAt).toLocaleString('tr-TR')}
                                       </td>
                                       <td className="px-8 py-5 font-bold text-slate-200">
                                           {log.business?.name || 'Sistem'}
                                       </td>
                                       <td className="px-8 py-5">
                                           <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold border border-slate-700 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">
                                               {log.action}
                                           </span>
                                       </td>
                                       <td className="px-8 py-5 text-sm text-slate-500">
                                           {log.userEmail}
                                       </td>
                                       <td className="px-8 py-5 text-xs font-mono text-slate-600">
                                           {log.entity} ({log.entityId.substring(0,8)}...)
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
          </div>
      )}

      {/* Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Yeni Tenant Oluştur</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBusiness} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">İşletme Adı</label>
                <input 
                  type="text"
                  required
                  value={newBusiness.name}
                  onChange={e => setNewBusiness({...newBusiness, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Örn: Karaköy Coffee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono text-sm">probrew.com/menu/</span>
                  <input 
                    type="text"
                    required
                    value={newBusiness.slug}
                    onChange={e => setNewBusiness({...newBusiness, slug: e.target.value})}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Yönetici Email (Manager)</label>
                <input 
                  type="email"
                  required
                  value={newBusiness.contactEmail}
                  onChange={e => setNewBusiness({...newBusiness, contactEmail: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="manager@isletme.com"
                />
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <p className="text-xs text-blue-400 leading-relaxed">
                  <strong>Not:</strong> Kaydet butonuna tıkladığınızda veritabanında bu işletme için özel bir partition oluşturulacak ve yönetici hesabı aktif edilecektir. Başlangıç şifresi: <code className="bg-slate-900 px-1 py-0.5 rounded text-white">{newBusiness.initialManagerPassword}</code>
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
              >
                {loading ? 'Oluşturuluyor...' : 'İşletmeyi Yayına Al'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Management Modal */}
      {isManaging && selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-800 flex justify-between items-start bg-gradient-to-br from-slate-800/50 to-transparent">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-white mb-1">{selectedBusiness.name}</h2>
                <p className="text-slate-400 font-mono text-sm">ID: {selectedBusiness.id}</p>
              </div>
              <button 
                onClick={() => setIsManaging(false)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Quick Actions / Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Abonelik Durumu</label>
                  <select 
                    value={selectedBusiness.subscriptionStatus}
                    onChange={(e) => handleUpdateStatus(selectedBusiness.id, e.target.value)}
                    disabled={updating}
                    className="w-full bg-slate-950 border border-slate-700/50 rounded-2xl px-5 py-4 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="TRIAL">Deneme Süreci (TRIAL)</option>
                    <option value="ACTIVE">Aktif (ACTIVE)</option>
                    <option value="SUSPENDED">Askıya Alındı (SUSPENDED)</option>
                    <option value="CANCELLED">İptal Edildi (CANCELLED)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                   <button 
                    onClick={() => handleExtendTrial(selectedBusiness)}
                    disabled={updating}
                    className="w-full py-4 bg-slate-800 hover:bg-indigo-600/20 text-indigo-400 font-bold rounded-2xl border border-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                   >
                     🚀 Trial Uzat (+7 Gün)
                   </button>
                   {selectedBusiness.trialEndsAt && (
                       <p className="text-[10px] text-center text-slate-500 font-medium uppercase tracking-wider">
                           Bitiş: {new Date(selectedBusiness.trialEndsAt).toLocaleDateString('tr-TR')}
                       </p>
                   )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-center">
                  <div className="text-blue-400 font-black text-xl mb-1">{selectedBusiness._count.baristas}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personel</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-center">
                  <div className="text-emerald-400 font-black text-xl mb-1">{selectedBusiness._count.products}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ürün</div>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 text-center">
                  <div className="text-purple-400 font-black text-xl mb-1">{selectedBusiness._count.orders}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sipariş</div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4">
                <button 
                  onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                  disabled={updating}
                  className="w-full py-4 border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {updating ? 'İşlem yapılıyor...' : '⚠️ İşletmeyi Ve Tüm Verileri Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
