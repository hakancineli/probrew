import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Kullanım Koşulları | ProBrew Lisans Sözleşmesi',
    description: 'ProBrew POS yazılımı kullanım koşulları, lisans şartları ve hizmet politikaları.',
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32">
                <div className="bg-white p-10 md:p-20 rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-xs font-black mb-8 border border-gray-200 tracking-widest uppercase">
                        HUKUKİ METİN
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-10 text-brand-dark tracking-tighter uppercase">KULLANIM KOŞULLARI</h1>
                    <p className="text-gray-400 font-bold mb-12 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                        Son Güncelleme: 14 Mart 2026
                    </p>

                    <div className="space-y-12 text-gray-600 font-medium leading-relaxed text-lg">
                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">1. Hizmet Tanımı</h2>
                            <p>
                                ProBrew, kafe ve restoranlar için geliştirilmiş bulut tabanlı bir işletme yönetim ve POS yazılımıdır. Platformu kullanarak, sunduğumuz yazılım hizmetlerini (SaaS) ve ilgili güncellemeleri bu koşullar çerçevesinde kullanmayı kabul etmiş sayılırsınız.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">2. Lisans ve Kullanım Hakkı</h2>
                            <p>
                                Abonelik süresince ProBrew, kullanıcıya kişisel ve devredilemez bir kullanım lisansı verir. Yazılımın kopyalanması, kaynak koduna erişilmesi veya tersine mühendislik yapılması kesinlikle yasaktır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">3. Abonelik ve Ödemeler</h2>
                            <p>
                                Hizmetlerimiz aylık veya yıllık abonelik paketleri üzerinden sunulur. Belirtilen süre sonunda yenilenmeyen aboneliklerde erişim kısıtlanabilir. PROBREW, fiyatlandırma ve kampanya koşullarında 30 gün öncesinden bildirmek kaydıyla değişiklik yapma hakkını saklı tutar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">4. Veri Güvenliği ve Bulut Yedekleme</h2>
                            <p>
                                İşletmenize ait tüm veriler (satışlar, stoklar, müşteri kayıtları) güvenli bulut sunucularımızda saklanır. Donanım arızası durumunda verileriniz korunur ve yeni bir cihazdan anında erişim sağlanabilir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight uppercase">5. Sorumluluk Sınırları</h2>
                            <p>
                                ProBrew, internet kesintileri veya donanım uyumsuzluklarından kaynaklanan geçici aksaklıklardan sorumlu tutulamaz. Ancak "Offline Mode" özelliği ile verilerinizin kaybolmaması için gerekli tüm teknolojik önlemleri almaktadır.
                            </p>
                        </section>

                        <section className="pt-10 border-t border-gray-100 italic text-sm text-gray-400">
                            Sitedeki tüm görsel, logo ve içerikler PROBREW markasına aittir. İzinsiz kullanılması veya ticari amaçla çoğaltılması yasal işleme tabidir.
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
