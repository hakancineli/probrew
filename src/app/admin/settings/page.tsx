'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaPaintBrush, FaImages, FaMicrochip, FaEnvelope, FaSave, FaCheckCircle, FaPalette, FaPowerOff } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Settings {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  loyaltyEnabled: boolean;
  isKitchenEnabled: boolean;
  isInventoryEnabled: boolean;
  isShiftEnabled: boolean;
  orderNotificationEmail: string;
  activeTheme: string;
  isPaymentEnabled: boolean;
  officialName: string;
  officialAddress: string;
  officialPhone: string;
  taxOffice: string;
  taxNumber: string;
  isTableTransferEnabled: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    brandName: '',
    primaryColor: '#3E2723',
    secondaryColor: '#FF8A65',
    logoUrl: '',
    loyaltyEnabled: false,
    isKitchenEnabled: true,
    isInventoryEnabled: true,
    isShiftEnabled: true,
    orderNotificationEmail: '',
    activeTheme: 'Nordic',
    isPaymentEnabled: false,
    officialName: '',
    officialAddress: '',
    officialPhone: '',
    taxOffice: '',
    taxNumber: '',
    isTableTransferEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data) setSettings(data);
      }
    } catch (error) {
      toast.error('Ayarlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Ayarlar başarıyla kaydedildi.');
      } else {
        toast.error('Güncelleme sırasında hata oluştu.');
      }
    } catch (error) {
      toast.error('Sunucu hatası.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500 font-mono italic">
      Sistem konfigürasyonu yükleniyor...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
               <FaCog className="animate-spin-slow" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Sistem Ayarları</h1>
          </div>
          <p className="text-slate-400">İşletmenizin marka kimliğini ve aktif modüllerini özelleştirin.</p>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Marka & Görünüm */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <FaPaintBrush className="text-emerald-500" />
              <h2 className="text-xl font-bold">Marka & Görünüm</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Marka İsmi (Görünen)</label>
                <input 
                  type="text"
                  value={settings.brandName}
                  onChange={e => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="ProBrew London"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Logo (Dosya Seç veya URL)</label>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={settings.logoUrl}
                      onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                      placeholder="https://example.com/logo.png"
                    />
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-2xl transition-all flex items-center gap-2 text-sm font-bold whitespace-nowrap">
                      <FaImages /> 
                      GÖRSEL YÜKLE
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error('Dosya çok büyük (Maks 2MB)');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSettings({ ...settings, logoUrl: reader.result as string });
                              toast.success('Logo seçildi. Kaydetmeyi unutmayın.');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {settings.logoUrl && (
                    <div className="flex items-center gap-4 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                      <img src={settings.logoUrl} alt="Logo Preview" className="h-12 w-auto object-contain rounded-lg" />
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">{settings.logoUrl.startsWith('data:') ? 'Yüklenen Dosya' : settings.logoUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Birincil Renk</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color"
                      value={settings.primaryColor}
                      onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                    />
                    <span className="font-mono text-slate-400 text-sm">{settings.primaryColor}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">İkincil Renk</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color"
                      value={settings.secondaryColor}
                      onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                    />
                    <span className="font-mono text-slate-400 text-sm">{settings.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tema Seçimi */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <FaPalette className="text-purple-500" />
              <h2 className="text-xl font-bold">Tema Seçimi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { id: 'Nordic', label: 'The Nordic', desc: 'Minimalist & Aydınlık', icon: '❄️' },
                 { id: 'Midnight', label: 'Midnight', desc: 'Lüks & Karanlık', icon: '🌙' },
                 { id: 'Bistro', label: 'Bistro Classic', desc: 'Sıcak & Rustik', icon: '🍷' },
                 { id: 'Vibrant', label: 'Vibrant Pop', desc: 'Enerjik & Canlı', icon: '⚡' },
                 { id: 'Turkish', label: 'Turkish Spirit', desc: 'Kırmızı & Beyaz', icon: '🇹🇷' },
                 { id: 'Custom', label: 'Kişisel Marka', desc: 'Sizin Renkleriniz', icon: '🎨' }
               ].map((theme) => (
                  <div 
                    key={theme.id}
                    onClick={() => setSettings({ ...settings, activeTheme: theme.id })}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col items-center text-center ${settings.activeTheme === theme.id 
                      ? 'bg-blue-600/10 border-blue-500 ring-4 ring-blue-500/10' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                      {theme.icon}
                    </div>
                    <span className="font-black text-sm mb-1">{theme.label}</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{theme.desc}</p>
                    
                    <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full w-full ${settings.activeTheme === theme.id ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                    </div>
                  </div>
               ))}
            </div>
          </section>
          <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <FaMicrochip className="text-blue-500" />
              <h2 className="text-xl font-bold">Aktif Modüller</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { label: 'Mutfak Ekranı (KDS)', key: 'isKitchenEnabled', color: 'text-orange-500' },
                 { label: 'Envanter Denetimi', key: 'isInventoryEnabled', color: 'text-emerald-500' },
                 { label: 'Vardiya Yönetimi', key: 'isShiftEnabled', color: 'text-purple-500' },
                 { label: 'Sadakat Programı (Loyalty)', key: 'loyaltyEnabled', color: 'text-yellow-500' },
                 { label: 'Masa Taşıma & Birleştirme', key: 'isTableTransferEnabled', color: 'text-indigo-500' }
               ].map((mod) => (
                  <label key={mod.key} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className={`w-2 h-2 rounded-full ${(settings as any)[mod.key] ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                       <span className="font-bold">{mod.label}</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={(settings as any)[mod.key]}
                      onChange={e => setSettings({ ...settings, [mod.key]: e.target.checked })}
                      className="w-6 h-6 rounded-lg bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all"
                    />
                  </label>
               ))}
            </div>
          </section>

          {/* İletişim & Bildirimler */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <FaEnvelope className="text-pink-500" />
              <h2 className="text-xl font-bold">İletişim & Bildirimler</h2>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Sipariş Bildirim E-postası</label>
              <input 
                type="email"
                value={settings.orderNotificationEmail}
                onChange={e => setSettings({ ...settings, orderNotificationEmail: e.target.value })}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="order@business.com"
              />
              <p className="mt-4 text-xs text-slate-500 italic">Müşteri sipariş verdiğinde bu adrese bildirim gönderilir.</p>
            </div>
          </section>

          {/* Ödeme & Hukuki Bilgiler */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FaPowerOff className={settings.isPaymentEnabled ? "text-emerald-500" : "text-slate-600"} />
                <h2 className="text-xl font-bold">Ödeme & Hukuki Bilgiler</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.isPaymentEnabled}
                  onChange={e => setSettings({ ...settings, isPaymentEnabled: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white"></div>
              </label>
            </div>

            <p className="text-sm text-slate-400 mb-8 border-l-2 border-emerald-500/50 pl-4">
              Banka Sanal POS onayları için aşağıdaki bilgilerin doğruluğu ve hukuki metinlerin (Mesafeli Satış Sözleşmesi vb.) 
              son kullanıcıya sunulması zorunludur.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Resmi Ticari Ünvan</label>
                <input 
                  type="text"
                  value={settings.officialName}
                  onChange={e => setSettings({ ...settings, officialName: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none transition-all font-medium"
                  placeholder="ProBrew Kahve Gıda Ltd. Şti."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Vergi Dairesi</label>
                <input 
                  type="text"
                  value={settings.taxOffice}
                  onChange={e => setSettings({ ...settings, taxOffice: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none transition-all font-medium"
                  placeholder="Karaköy V.D."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Vergi Numarası</label>
                <input 
                  type="text"
                  value={settings.taxNumber}
                  onChange={e => setSettings({ ...settings, taxNumber: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none transition-all font-medium font-mono"
                  placeholder="1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Resmi Tebligat Adresi</label>
                <textarea 
                  value={settings.officialAddress}
                  onChange={e => setSettings({ ...settings, officialAddress: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none transition-all font-medium resize-none"
                  placeholder="Karaköy Mah. Rıhtım Cad. No:1 Beyoğlu/İstanbul"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Resmi İletişim Telefonu</label>
                <input 
                  type="text"
                  value={settings.officialPhone}
                  onChange={e => setSettings({ ...settings, officialPhone: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-emerald-500 outline-none transition-all font-medium font-mono"
                  placeholder="+90 212 --- -- --"
                />
              </div>
            </div>
          </section>

          {/* Save Footer */}
          <div className="sticky bottom-8 z-10 flex justify-end">
             <button 
               disabled={saving}
               type="submit"
               className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-5 px-12 rounded-3xl shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3 scale-100 active:scale-95"
             >
               {saving ? 'KAYDEDİLİYOR...' : <><FaSave /> TÜMÜNÜ KAYDET</>}
             </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
