'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-6 tracking-tighter">
            Abonelik Yönetimi
          </h1>
          <p className="text-lg text-gray-500 font-medium mb-10 max-w-xl mx-auto">
            ProBrew aboneliğinizi yönetmek, fatura bilgilerinizi görüntülemek veya planınızı değiştirmek için aşağıdaki butona tıklayın.
          </p>
          <a
            href="https://app.creem.io/customer/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-5 bg-brand-primary text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl"
          >
            Abonelik Portalına Git →
          </a>
          <p className="mt-6 text-sm text-gray-400 font-medium">
            Abonelik yönetimi, güvenli ödeme altyapımız Creem üzerinden sağlanmaktadır.
          </p>

          <div className="mt-16 bg-white rounded-3xl p-8 border border-gray-100 shadow-lg text-left max-w-xl mx-auto">
            <h3 className="text-xl font-black text-brand-dark mb-4">Sık Sorulan Sorular</h3>
            <div className="space-y-4 text-gray-600 font-medium text-sm">
              <div>
                <p className="font-bold text-brand-dark">Aboneliğimi nasıl iptal edebilirim?</p>
                <p>Yukarıdaki &quot;Abonelik Portalına Git&quot; butonuna tıklayarak aboneliğinizi istediğiniz zaman iptal edebilirsiniz.</p>
              </div>
              <div>
                <p className="font-bold text-brand-dark">Faturamı nasıl görüntülerim?</p>
                <p>Abonelik portalı üzerinden geçmiş tüm faturalarınıza erişebilirsiniz.</p>
              </div>
              <div>
                <p className="font-bold text-brand-dark">Destek almak istiyorum</p>
                <p>info@probrew.com.tr adresine mail göndererek destek ekibimize ulaşabilirsiniz.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
