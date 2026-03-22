'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { FaCheckCircle, FaEnvelope, FaHeadset, FaArrowLeft } from 'react-icons/fa';

function SuccessContent() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 animate-bounce">
            <FaCheckCircle className="text-white text-5xl" />
          </div>
          <div className="absolute inset-0 w-24 h-24 mx-auto bg-emerald-400 rounded-full animate-ping opacity-20" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-slate-900 mb-3">
          🎉 Ödeme Başarılı!
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          ProBrew POS aboneliğiniz başarıyla oluşturuldu. Hoş geldiniz!
        </p>

        {/* Info Cards */}
        <div className="space-y-4 mb-8 text-left">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaEnvelope className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">E-posta Onayı</h3>
              <p className="text-sm text-slate-600">Abonelik detaylarınız ve giriş bilgileriniz e-posta adresinize gönderildi.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaHeadset className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">7/24 Destek</h3>
              <p className="text-sm text-slate-600">Kurulum ve kullanım sürecinde size yardımcı olmaktan mutluluk duyarız.</p>
            </div>
          </div>
        </div>

        {checkoutId && (
          <p className="text-xs text-slate-400 mb-6">
            Sipariş No: {checkoutId}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            Panele Giriş Yap →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-all duration-300"
          >
            <FaArrowLeft className="text-sm" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OdemeBasariliPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
