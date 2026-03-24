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

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-sm italic text-gray-500 mt-10">
                            Bu metin, ProBrew Teknoloji Hizmetleri-nin genel iptal ve iade politikalarını özetlemektedir. Özel projeler ve kurumsal anlaşmalar (Enterprise) için imzalanan ana hizmet sözleşmesi maddeleri önceliklidir.
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
