import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'KVKK Aydınlatma Metni',
    description: 'Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aydınlatma metni.',
};

export default function KVKKPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-20 prose prose-brand">
                <h1 className="text-4xl font-black mb-8 uppercase">KVKK Aydınlatma Metni</h1>
                <p className="text-gray-600 mb-6">
                    6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metnidir.
                </p>

                <h2 className="text-2xl font-bold mb-4">1. Veri Sorumlusu</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    ProBrew Company olarak kişisel verilerinizi kanuna uygun şekilde işliyoruz.
                </p>

                <h2 className="text-2xl font-bold mb-4">2. İşleme Amaçları</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Sözleşmelerin kurulması, fatura düzenlenmesi, sadakat programının yürütülmesi ve yasal yükümlülüklerin yerine getirilmesi.
                </p>

                <h2 className="text-2xl font-bold mb-4">3. Aktarılan Taraflar</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Verileriniz sadece yasal zorunluluklar veya hizmetin ifası için gerekli olan (kurye, ödeme kuruluşu) iş ortakları ile paylaşılmaktadır.
                </p>

                <h2 className="text-2xl font-bold mb-4">4. Haklarınız</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Kanunun 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini isteme ve silinmesini talep etme hakkına sahipsiniz.
                </p>

                <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-sm mt-12">
                    <p className="font-bold text-gray-700 mb-3 uppercase tracking-widest">Destek & Başvuru:</p>
                    <p className="mb-2 italic">İptal veya iade talepleriniz için lütfen Store ID bilginiz ile birlikte bizimle iletişime geçin:</p>
                    <div className="flex flex-col gap-1 font-bold text-gray-800">
                        <span>Destek: <span className="text-brand-primary">info@probrew.com.tr</span></span>
                        <span>Adres: Zafer mahallesi, Baki Sk. no: 46 Bahçelievler / İstanbul</span>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
