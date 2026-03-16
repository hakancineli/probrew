'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaPrint } from 'react-icons/fa';
import { useRealtime } from '@/hooks/useRealtime';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: string;
  totalAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  source?: string;
  externalId?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  size?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    search: '',
    today: true,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50, // Increased limit for easier single-screen view
    total: 0,
    pages: 0,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    customerPhone: '',
    notes: '',
    finalAmount: 0,
    paymentMethod: 'CASH'
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [filter.status, filter.search, pagination.page, filter.today]);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.search && { search: filter.search }),
        ...(filter.today && { today: 'true' }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter.status, filter.search, filter.today]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null);
        }
      }
    } catch (error) {
      console.error('Order update error:', error);
    }
  };

  const syncTrendyolOrders = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/trendyol/sync');
      const data = await res.json();
      if (data.success) {
        if (data.synced > 0) {
          alert(`${data.synced} yeni Trendyol siparişi başarıyla eklendi!`);
          fetchOrders();
        } else {
          alert('Yeni Trendyol siparişi bulunamadı.');
        }
      } else {
        alert(`Hata: ${data.error}`);
      }
    } catch (err) {
      console.error('Trendyol sync error:', err);
      alert('Senkronizasyon sırasında bir hata oluştu.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Beklemede',
      PREPARING: 'Hazırlanıyor',
      READY: 'Hazır',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
    };
    return texts[status as keyof typeof texts] || status;
  };

  // Audio Alarm Logic
  const [hasPending, setHasPending] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPendingCountRef = useRef(0);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  };

  const playBellSound = () => {
    if (!audioContextRef.current) initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const createHarmonic = (freq: number, volume: number, decay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    };

    // Desk Bell (Reception Bell)
    createHarmonic(1046.50, 0.4, 1.5);
    createHarmonic(2093.00, 0.2, 0.8);
    createHarmonic(2489.02, 0.15, 0.6);
    createHarmonic(3135.96, 0.1, 0.4);
    createHarmonic(4186.01, 0.1, 0.3);
  };

  // Listen for realtime events
  useRealtime(useCallback((payload) => {
    console.log('[Realtime Event]', payload);
    if (payload.event === 'NEW_ORDER' || payload.event === 'ORDER_STATUS_CHANGED') {
      // Re-fetch orders when a new one arrives or status changes
      fetchOrders(true); // Silent update
    }
  }, [fetchOrders]));

  // Check for pending orders and trigger alarm
  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    if (pendingCount > 0) {
      setHasPending(true);
      // If a NEW order has arrived (count increased)
      if (pendingCount > lastPendingCountRef.current && !isMuted && hasInteracted) {
        playBellSound();
      }
    } else {
      setHasPending(false);
    }

    lastPendingCountRef.current = pendingCount;
  }, [orders, isMuted, hasInteracted]);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      initAudio();
      // If there are pending orders, play once on first interaction
      const pendingCount = orders.filter(o => o.status === 'PENDING').length;
      if (pendingCount > 0 && !isMuted) {
        playBellSound();
      }
    }
  };



  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz? (İşlem geçmişine kaydedilecektir)')) return;
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOrders();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Order delete error:', error);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        fetchOrders();
        setIsEditModalOpen(false);
        alert('Sipariş başarıyla güncellendi.');
      } else {
        const data = await response.json();
        alert(`Hata: ${data.error || 'Güncelleme başarısız'}`);
      }
    } catch (error) {
      console.error('Order update error:', error);
      alert('Bir hata oluştu.');
    }
  };

  const printReceipt = (order: Order) => {
    const receiptContent = `
            <html>
            <head>
                <title>Fiş Yazdır - ProBrew</title>
                <style>
                    body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 10px; font-size: 13px; color: black; line-height: 1.2; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }
                    .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                    .info { text-align: left; font-size: 11px; margin-bottom: 10px; }
                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; }
                    .item-detail { font-size: 11px; margin-bottom: 8px; color: #333; }
                    .total-box { border-top: 2px solid black; margin-top: 10px; padding-top: 5px; }
                    .total-line { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
                    .grand-total { display: flex; justify-content: space-between; font-weight: 900; font-size: 16px; border-top: 1px solid black; margin-top: 5px; padding-top: 5px; }
                    .footer { text-align: center; margin-top: 30px; border-top: 1px dashed black; padding-top: 15px; }
                    .branding { font-weight: bold; font-size: 15px; margin-top: 5px; letter-spacing: 2px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">SİPARİŞ FİŞİ</div>
                    <div style="font-size: 10px; letter-spacing: 1px;">BİLGİ AMAÇLIDIR</div>
                </div>
                
                <div class="info">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Tarih: ${new Date().toLocaleDateString('tr-TR')}</span>
                        <span>Saat: ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>Fiş No: #${order.orderNumber?.split('-').pop() ?? ''}</div>
                    <div>Müşteri: ${order.customerName ?? 'Misafir'}</div>
                    ${order.source === 'TRENDYOL' ? '<div style="color: #e67e22; font-weight: bold;">KAYNAK: TRENDYOL GO</div>' : ''}
                </div>

                <div style="border-bottom: 1px solid black; margin-bottom: 10px; font-size: 11px; display: flex; justify-content: space-between;">
                    <span>Ürün</span>
                    <span>Tutar</span>
                </div>

                ${order.orderItems?.map((item) => `
                    <div class="item">
                        <span>${item.quantity} x ${item.productName.toUpperCase()}</span>
                        <span>${(item.totalPrice ?? 0).toFixed(2)}₺</span>
                    </div>
                    ${item.size ? `<div class="item-detail">BOY: ${item.size === 'S' ? 'KÜÇÜK' : item.size === 'M' ? 'ORTA' : item.size === 'L' ? 'BÜYÜK' : item.size}</div>` : ''}
                `).join('')}

                <div class="total-box">
                    <div class="total-line">
                        <span>ARA TOPLAM</span>
                        <span>${(order.totalAmount ?? 0).toFixed(2)}₺</span>
                    </div>
                    ${(order.totalAmount - order.finalAmount) > 0 ? `
                        <div class="total-line">
                            <span>İNDİRİM</span>
                            <span>-${(order.totalAmount - order.finalAmount).toFixed(2)}₺</span>
                        </div>
                    ` : ''}
                    <div class="grand-total">
                        <span>TOPLAM</span>
                        <span>${(order.finalAmount ?? 0).toFixed(2)}₺</span>
                    </div>
                </div>

                <div class="footer">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.probrew.com.tr/menu" style="width: 40mm; height: 40mm; margin: 0 auto 10px; display: block;" />
                    <div class="branding">PROBREW</div>
                    <p style="margin: 5px 0;">Yenibosna Bahçelievler İstanbul</p>
                    <p style="font-weight: bold; margin-top: 10px;">* AFİYET OLSUN *</p>
                    <p style="font-style: italic; font-size: 9px; margin-top: 15px;">Mali değeri yoktur. Teşekkür ederiz.</p>
                </div>
            </body>
            </html>
        `;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();

      // Give image time to load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" onClick={handleInteraction}>
      {/* Audio Control / Status */}
      {hasPending && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg animate-pulse sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🔔</span>
            <span className="font-bold text-lg">DİKKAT: Bekleyen Siparişler Var!</span>
          </div>
          <button
            onClick={toggleMute}
            className="bg-white text-red-600 px-4 py-1 rounded font-bold hover:bg-gray-100"
          >
            {isMuted ? 'Sesi Aç' : 'Sesi Durdur'}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
            </div>
            <nav className="flex space-x-4 items-center">
              <button
                onClick={toggleMute}
                className="mr-4 p-2 text-gray-500 hover:text-gray-900 focus:outline-none"
                title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <span className="text-xs text-gray-500 mr-2">
                {hasPending ? '⚠️ Bekleyen Sipariş' : '✅ Her şey yolunda'}
              </span>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
              <Link href="/admin/profile" className="text-gray-600 hover:text-gray-900">
                Profil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zaman
              </label>
              <button
                onClick={() => setFilter(prev => ({ ...prev, today: !prev.today }))}
                className={`w-full px-3 py-2 border rounded-md font-medium transition-colors ${filter.today
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {filter.today ? 'Özel Gün: Bugün' : 'Tüm Zamanlar'}
              </button>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ara
              </label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Müşteri adı, sipariş no..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Tümü</option>
                <option value="PENDING">Beklemede</option>
                <option value="PREPARING">Hazırlanıyor</option>
                <option value="READY">Hazır</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={syncTrendyolOrders}
                disabled={isSyncing}
                className="w-full sm:w-auto bg-orange-500 text-white px-4 py-2 rounded-md font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isSyncing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-xl">🟠</span>
                )}
                {isSyncing ? 'Çekiliyor...' : 'Trendyol\'dan Çek'}
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className={`bg-white shadow rounded-lg overflow-hidden border-2 ${hasPending ? 'border-red-500' : 'border-transparent'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kaynak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Henüz sipariş bulunmuyor
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50 ${order.status === 'PENDING' ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          {order.customerEmail && (
                            <div className="text-gray-500">{order.customerEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)} 
                          ${order.status === 'PENDING' ? 'animate-pulse ring-2 ring-red-400' : ''}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.source === 'TRENDYOL' ? (
                          <span className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 italic">
                            <span className="text-[10px]">TY</span> Trendyol
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">Kasa</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{(order.finalAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span suppressHydrationWarning>{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 items-center">
                          <button
                            onClick={() => printReceipt(order)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Fiş Yazdır"
                          >
                            <FaPrint size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditFormData({
                                customerName: order.customerName || '',
                                customerPhone: order.customerPhone || '',
                                notes: order.notes || '',
                                finalAmount: order.finalAmount || 0,
                                paymentMethod: order.paymentMethod || 'CASH'
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Düzenle"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200 hover:bg-green-100"
                          >
                            Detay
                          </button>
                          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                            >
                              Tamamla
                            </button>
                          )}
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-300 hover:text-red-600 ml-1"
                            title="Siparişi Sil"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Sayfa <span className="font-medium">{pagination.page}</span> /{' '}
                    <span className="font-medium">{pagination.pages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Sipariş Detayı - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Müşteri Bilgileri</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                  {selectedOrder.customerEmail && (
                    <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                  )}
                  {selectedOrder.customerPhone && (
                    <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Kaynak</h4>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedOrder.source === 'TRENDYOL' ? 'Trendyol Go' : 'Kasa / POS'}
                    </p>
                  </div>
                  {selectedOrder.source === 'TRENDYOL' ? (
                    <span className="text-orange-500 text-xl">🟠</span>
                  ) : (
                    <span className="text-gray-400 text-xl">💻</span>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Sipariş Ürünleri</h4>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          {item.size && <span className="text-gray-500 text-xs ml-2">({item.size})</span>}
                          <span className="text-gray-500"> x {item.quantity}</span>
                        </div>
                        <span className="font-medium">₺{(item.totalPrice ?? 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Toplam:</span>
                    <span className="font-medium">₺{(selectedOrder.finalAmount ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">Notlar</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 mt-4 border-t gap-2">
                  <button
                    onClick={() => printReceipt(selectedOrder)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    <FaPrint className="mr-2" />
                    Yazdır
                  </button>
                  <button
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-200"
                  >
                    Siparişi Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Siparişi Düzenle</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">✕</button>
              </div>
              <form onSubmit={handleUpdateOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Müşteri Adı</label>
                  <input
                    type="text"
                    value={editFormData.customerName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Müşteri Telefon</label>
                  <input
                    type="text"
                    value={editFormData.customerPhone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notlar</label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm h-20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Toplam Tutar</label>
                    <input
                      type="number"
                      value={editFormData.finalAmount}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, finalAmount: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-md text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ödeme Tipi</label>
                    <select
                      value={editFormData.paymentMethod}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="CASH">Nakit</option>
                      <option value="CREDIT_CARD">Kredi Kartı</option>
                      <option value="MULTINET">Multinet</option>
                      <option value="SODOXO">Sodexo</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}