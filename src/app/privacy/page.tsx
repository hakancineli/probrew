import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Gizlilik Politikası | Veri Güvenliği Taahhüdü',
    description: 'ProBrew veri gizliliği politikası. İşletme verileri, müşteri bilgileri ve KVKK uyumluluğu hakkında detaylı bilgi.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32">
                <div className="bg-white p-10 md:p-20 rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="inline-block px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-black mb-8 border border-brand-primary/20 tracking-widest uppercase">
                        GÜVENLİK STANDARTLARI
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-10 text-brand-dark tracking-tighter uppercase">GİZLİLİK POLİTİKASI</h1>
                    <p className="text-gray-400 font-bold mb-12 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Son Güncelleme: 14 Mart 2026
                    </p>

                    <div className="space-y-12 text-gray-600 font-medium leading-relaxed text-lg">
                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">1. Verilerin Korunması ve KVKK</h2>
                            <p>
                                PROBREW olarak, hem işletmenize ait verilerin hem de son kullanıcılarınızın (müşterilerinizin) kişisel verilerinin korunmasına büyük önem veriyoruz. Tüm süreçlerimizi 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve uluslararası veri güvenliği standartlarına (GDPR) uygun olarak yönetiyoruz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">2. Toplanan Veri Türleri</h2>
                            <p>
                                İşletme sahibi olarak sisteme kaydolduğunuzda; ticari ünvanınız, iletişim bilgileriniz ve vergi dairesi bilgileri toplanır. Uygulama içerisinde ise; yapılan satışlar, stok hareketleri, personel işlem logları ve (loyalty programı kullanıyorsanız) müşterilerinizin işlem hacimleri şifreli olarak saklanır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">3. Verilerin İşlenme Amacı</h2>
                            <p>
                                Verileriniz yalnızca aşağıdaki amaçlarla işlenir:
                            </p>
                            <ul className="list-disc ml-10 mt-6 space-y-4">
                                <li>İşletme raporlarınızın ve AI analizlerinin oluşturulması.</li>
                                <li>Mutfak ve stok yönetim süreçlerinin otomasyonu.</li>
                                <li>Yazılım güncellemeleri ve teknik destek süreçlerinin yönetimi.</li>
                                <li>Vergi mevzuatına uygun şekilde fatura/fiş süreçlerinin yürütülmesi.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">4. Üçüncü Taraflar ile Paylaşım</h2>
                            <p>
                                İşletme verileriniz asla reklam amacıyla üçüncü taraflara satılmaz veya paylaşılmaz. Ancak, onayı dahilinde pazaryeri entegrasyonları (Getir, Yemeksepeti vb.) ve ödeme kuruluşları (Iyzico, PayTR vb.) ile yalnızca işlemin tamamlanması için gerekli veriler paylaşılır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">5. Güvenlik ve Şifreleme</h2>
                            <p>
                                Sistemimize iletilen tüm veriler uçtan uca SSL (Secure Sockets Layer) teknolojisi ile şifrelenir. Veritabanlarımız, periyodik olarak sızma testlerine (Pentest) tabi tutulan ve ISO 27001 sertifikalı veri merkezlerinde barındırılır.
                            </p>
                        </section>

                        <section className="pt-10 border-t border-gray-100 italic text-sm text-gray-400">
                            Gizlilik politikamız hakkındaki tüm sorularınız için <span className="font-bold text-brand-primary">info@probrew.com.tr</span> adresinden veri güvenliği temsilcimize ulaşabilirsiniz.
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
