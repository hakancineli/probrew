import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CancellationRefundPolicy() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32">
                <div className="bg-white p-10 md:p-20 rounded-[3rem] shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black mb-10 text-brand-dark uppercase tracking-tighter">İptal ve İade Koşulları</h1>
                    <div className="prose prose-lg prose-brand max-w-none text-gray-600 font-medium leading-relaxed">

                        <h2 className="text-2xl font-black text-brand-dark mb-4 uppercase tracking-tight">1. Abonelik İptali</h2>
                        <p className="mb-8">
                            ProBrew SaaS (Yazılım olarak Hizmet) modeli ile çalışmaktadır. Aylık veya yıllık aboneliklerinizi, dönem bitiminden en az 24 saat önce yönetim panelinizden veya müşteri hizmetlerimiz aracılığıyla iptal edebilirsiniz. İptal işlemi, içinde bulunulan faturalandırma döneminin sonunda geçerli olur ve yeni dönem için ücret tahsil edilmez.
                        </p>

                        <h2 className="text-2xl font-black text-brand-dark mb-4 uppercase tracking-tight">2. Ücret İadesi (SaaS Lisansları)</h2>
                        <p className="mb-4">
                            Dijital içerik ve yazılım hizmetleri niteliği gereği, abonelik başlatıldıktan ve yazılım kullanılmaya başlandıktan sonra cayma hakkı kapsamında tam ücret iadesi yapılmamaktadır. Ancak;
                        </p>
                        <ul className="list-disc ml-10 mb-8 space-y-2">
                            <li>Satın alımdan sonraki ilk 14 gün içinde teknik bir hata nedeniyle hizmet alınamaması,</li>
                            <li>Çift ödeme veya hatalı tahsilat işlemleri,</li>
                            <li>Abonelik yenileme öncesi bildirim sorunu yaşanması durumlarında durum değerlendirilerek iade işlemi gerçekleştirilir.</li>
                        </ul>

                        <p className="mb-8">
                            İadesi onaylanan tutarlar, ödemeyi gerçekleştirdiğiniz kredi kartına/hesaba 7-10 iş günü içerisinde iade edilir.
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
                </div>
            </div>
            <Footer />
        </main>
    );
}
