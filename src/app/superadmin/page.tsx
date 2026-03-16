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
  }
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

  useEffect(() => {
    fetchBusinesses();
  }, []);

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

  if (loading && businesses.length === 0) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            ProBrew SuperAdmin
          </h1>
          <p className="text-slate-400">SaaS Yönetim ve Tenant Dashboard</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/20"
          >
            <FaPlus /> Yeni İşletme Ekle
          </button>
          <button 
            onClick={logout}
            className="p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>

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
            {businesses.reduce((sum, b) => sum + b._count.orders, 0)}
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
            {businesses.map((business) => (
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
                  <button className="text-slate-500 hover:text-white transition-colors">Yönet</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}
