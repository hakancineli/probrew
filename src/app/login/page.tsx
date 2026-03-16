'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiLock, FiMail, FiUser, FiArrowRight } from 'react-icons/fi';
import { RegisterCredentials, LoginCredentials } from '@/lib/auth';
import Link from 'next/link';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLogin, setIsLogin] = useState(true);

  // URL'de ?register=true varsa kayıt olma ekranı ile başla
  useEffect(() => {
    if (searchParams.get('register') === 'true') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isBusinessOwner, setIsBusinessOwner] = useState(false);
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    if (!isLogin && !acceptedTerms) {
      setError('Lütfen sözleşmeleri onaylayınız.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : {
          email,
          password,
          firstName,
          lastName,
          phone,
          isBusinessOwner,
          businessName,
          // Fallback businessId for regular users if needed
          businessId: 'probrew-main'
        };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      // Başarılı
      localStorage.setItem('authToken', data.token);

      // Redirect Logic
      let targetUrl = '/';
      const role = data.role || data.user.role;
      const normalizedRole = role?.toUpperCase();

      if (normalizedRole === 'SUPERADMIN') {
        targetUrl = '/superadmin';
      } else if (['MANAGER', 'ADMIN'].includes(normalizedRole)) {
        targetUrl = '/admin';
      } else if (['BARISTA', 'WAITER'].includes(normalizedRole)) {
        targetUrl = '/admin/pos';
      } else if (normalizedRole === 'KITCHEN' || data.user.email === 'kitchen@probrew.com.tr') {
        targetUrl = '/kitchen';
      }

      setSuccess(isLogin ? 'Giriş başarılı! Yönlendiriliyorsunuz...' : 'Kayıt başarılı! Hesabınız oluşturuldu...');
      console.log('Login successful, role:', role, 'target:', targetUrl);

      setTimeout(() => {
        // Use window.location.href for a more standard redirect
        window.location.href = targetUrl;
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-brand-primary mb-8 transition-colors group">
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Ana Sayfaya Dön
        </Link>

        {/* Brand */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-dark/20">
              P
            </div>
            <span className="text-3xl font-black text-brand-dark tracking-tighter">PROBREW</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {isLogin ? 'Tekrar Hoş Geldiniz.' : 'Maceraya Başlayın.'}
          </h2>
          <p className="mt-3 text-gray-500 font-medium">
            {isLogin
              ? 'İşletmenizi yönetmek için panele giriş yapın.'
              : 'ProBrew ekosistemine katılın ve işletmenizi dijitalleştirin.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">AD</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all outline-none text-gray-900 font-bold"
                      placeholder="Adınız"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SOYAD</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all outline-none text-gray-900 font-bold"
                      placeholder="Soyadınız"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBusinessOwner}
                      onChange={(e) => setIsBusinessOwner(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary/20"
                    />
                    <span className="text-sm font-black text-brand-dark uppercase tracking-tight">İŞLETME SAHİBİYİM</span>
                  </label>

                  {isBusinessOwner && (
                    <div className="mt-4 animate-fade-in">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">İŞLETME ADI</label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-5 py-4 bg-white border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none text-gray-900 font-bold shadow-sm"
                        placeholder="Örn: Bebek Kahve"
                        required={isBusinessOwner}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-POSTA</label>
              <div className="relative">
                <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all outline-none text-gray-900 font-bold"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ŞİFRE</label>
              <div className="relative">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all outline-none text-gray-900 font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold border border-green-100 animate-fade-in">
                {success}
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start space-x-3 ml-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded-lg border-gray-200 text-brand-primary focus:ring-brand-primary/20"
                />
                <span className="text-sm text-gray-500 leading-tight">
                  <Link href="/terms" className="text-brand-dark font-black hover:underline">Sözleşmeleri</Link> ve kullanıcı koşullarını onaylıyorum.
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-dark/20 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Giriş Yap' : 'Hesabımı Oluştur'}</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center px-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium transition-all"
            >
              <span className="text-gray-400">
                {isLogin ? 'Henüz bir hesabınız yok mu? ' : 'Zaten bir hesabınız var mı? '}
              </span>
              <span className="text-brand-primary font-black hover:underline ml-1">
                {isLogin ? 'Hemen üye olun' : 'Buradan giriş yapın'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-brand-dark font-bold">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;