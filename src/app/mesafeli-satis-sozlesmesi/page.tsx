import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DistanceSalesAgreement() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32">
                <div className="bg-white p-10 md:p-20 rounded-[3rem] shadow-sm border border-gray-100">
                    <h1 className="text-4xl font-black mb-10 text-brand-dark uppercase tracking-tighter">Mesafeli Satış Sözleşmesi</h1>
                    <div className="prose prose-lg prose-brand max-w-none text-gray-600 font-medium leading-relaxed">
                        
                        <h2 className="text-xl font-black text-brand-dark mb-4 uppercase">MADDE 1 – TARAFLAR</h2>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 space-y-2 text-sm">
                            <p><strong>SATICI ÜNVANI:</strong> ProBrew Teknoloji Grubu</p>
                            <p><strong>ADRES:</strong> Zafer mahallesi, Baki Sk. no: 12-A Bahçelievler / İstanbul</p>
                            <p><strong>TELEFON:</strong> +90 554 581 20 34</p>
                            <p><strong>E-POSTA:</strong> info@probrew.com.tr</p>
                        </div>

                        <h2 className="text-xl font-black text-brand-dark mb-4 uppercase">MADDE 2 – KONU</h2>
                        <p className="mb-8">
                            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.probrew.com.tr internet sitesi üzerinden elektronik ortamda siparişini yaptığı ProBrew POS Yazılım Lisansı (SaaS) ve/veya donanım ürünlerinin satışı ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerinin belirlenmesidir. 
                        </p>

                        <h2 className="text-xl font-black text-brand-dark mb-4 uppercase">MADDE 3 – SÖZLEŞME KONUSU HİZMET/ÜRÜN</h2>
                        <p className="mb-8">
                            Sözleşmeye konu hizmet, kafe ve restoranlar için bulut tabanlı işletme yönetim yazılımı kullanım hakkıdır. Satın alınan paketin niteliği, süresi ve ek modülleri sipariş özetinde belirtildiği gibidir.
                        </p>

                        <h2 className="text-xl font-black text-brand-dark mb-4 uppercase">MADDE 4 – GENEL HÜKÜMLER</h2>
                        <p className="mb-4">
                            4.1. ALICI, internet sitesinde sözleşme konusu yazılımın temel nitelikleri, kullanım süresi, satış fiyatı ve ödeme şekli ile ilgili ön bilgileri okuyup bilgi sahibi olduğunu beyan eder.
                        </p>
                        <p className="mb-8">
                            4.2. Yazılım hizmeti (SaaS), ödemenin onaylanmasını müteakip ALICI tarafından oluşturulan işletme hesabı üzerinden dijital olarak anında aktif edilir.
                        </p>

                        <h2 className="text-xl font-black text-brand-dark mb-4 uppercase">MADDE 5 – CAYMA HAKKI VE İSTİSNALAR</h2>
                        <p className="mb-10">
                            Mesafeli Sözleşmeler Yönetmeliği'nin 15. Maddesi gereği; "Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde" cayma hakkı kullanılamaz. ProBrew POS yazılımı bu kapsamda anında aktif edilen bir dijital hizmet olduğu için, aktivasyon sonrası cayma hakkı bulunmamaktadır. Ancak donanım ürünlerinde ambalaj açılmadığı sürece 14 günlük yasal cayma hakkı saklıdır.
                        </p>

                        <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-xs italic text-gray-500">
                            İşbu sözleşme metni genel bilgilendirme amaçlıdır. Ödeme anında onayladığınız dijital sözleşme, yasal olarak bağlayıcı olan metindir.
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
