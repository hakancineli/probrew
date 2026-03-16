import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function LegalPage({ params }: { params: { slug: string, type: string } }) {
    const business = await prisma.business.findUnique({
        where: { slug: params.slug },
        include: { systemSettings: true }
    });

    if (!business || !business.systemSettings) {
        return notFound();
    }

    const { officialName, officialAddress, officialPhone, taxOffice, taxNumber, brandName } = business.systemSettings;
    const date = new Date().toLocaleDateString('tr-TR');

    const renderContent = () => {
        switch (params.type) {
            case 'distance-sales':
                return (
                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <h1 className="text-2xl font-black text-slate-900 border-b pb-4">MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
                        <p className="text-sm italic text-slate-500">Son Güncelleme: {date}</p>
                        
                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">1. TARAFLAR</h2>
                            <p><strong>SATICI:</strong> {officialName || brandName || business.name}</p>
                            <p><strong>ADRES:</strong> {officialAddress || 'Belirtilmedi'}</p>
                            <p><strong>TELEFON:</strong> {officialPhone || 'Belirtilmedi'}</p>
                            <p><strong>VERGİ DAİRESİ/NO:</strong> {taxOffice} / {taxNumber}</p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">2. KONU</h2>
                            <p>
                                İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait ProBrew altyapısı üzerinden elektronik ortamda siparişini verdiği 
                                ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler 
                                Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerinin saptanmasıdır.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">3. ÜRÜN BİLGİLERİ VE TESLİMAT</h2>
                            <p>
                                Ürünlerin cinsi, miktarı, marka/modeli, satış bedeli, ödeme şekli, siparişin sonlandığı andaki bilgilerden oluşmaktadır. 
                                Gıda maddesi içeren siparişlerde teslimat, işletme içerisinde masa servisi veya ALICI tarafından belirtilen adrese (paket servis aktifse) yapılır.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">4. GENEL HÜKÜMLER</h2>
                            <p>
                                4.1. ALICI, SATICI'ya ait internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli 
                                ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.
                            </p>
                            <p>
                                4.2. Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin 
                                uzaklığına bağlı olarak internet sitesindeki ön bilgiler içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
                            </p>
                        </section>
                    </div>
                );
            case 'return-policy':
                return (
                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <h1 className="text-2xl font-black text-slate-900 border-b pb-4">İPTAL VE İADE KOŞULLARI</h1>
                        
                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">1. CAYMA HAKKI İSTİSNALARI</h2>
                            <p className="bg-amber-50 p-4 border-l-4 border-amber-400 text-amber-900 text-sm">
                                <strong>ÖNEMLİ:</strong> Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca; "Çabuk bozulabilen veya son kullanma 
                                tarihi geçebilecek malların teslimine ilişkin sözleşmelerde" tüketici cayma hakkını kullanamaz.
                            </p>
                            <p className="mt-4">
                                Hazırlanan sıcak/soğuk içecekler, taze gıda ürünleri ve pastane ürünleri bu kapsama girmektedir. 
                                Bu nedenle hazırlanmaya başlanmış veya teslim edilmiş gıda ürünlerinde iade kabul edilmemektedir.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">2. SİPARİŞ İPTALİ</h2>
                            <p>
                                ALICI, hazırlık süreci başlamamış siparişlerini ilgili işletmeye doğrudan telefonla ulaşarak veya sistem üzerinden ilgili buton aktif ise 
                                iptal edebilir. Hazırlık aşamasına geçmiş ürünlerin iptali mümkün değildir.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">3. AYIPLI ÜRÜN</h2>
                            <p>
                                Teslim edilen ürünün sipariş edilenden farklı, bozuk veya ayıplı olması durumunda ALICI durumu derhal SATICI'ya bildirmelidir. 
                                İnceleme sonucunda haklı bulunan taleplerde ürün değişimi veya ücret iadesi SATICI tarafından gerçekleştirilir.
                            </p>
                        </section>
                    </div>
                );
            case 'privacy-policy':
                return (
                    <div className="space-y-6 text-slate-700 leading-relaxed">
                        <h1 className="text-2xl font-black text-slate-900 border-b pb-4">GİZLİLİK VE KVKK POLİTİKASI</h1>
                        
                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">1. VERİ SORUMLUSU</h2>
                            <p>{officialName || brandName || business.name} (Bundan sonra "İşletme" olarak anılacaktır.)</p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">2. İŞLENEN VERİLER</h2>
                            <p>
                                Sipariş verme sürecinde adınız, soyadınız, telefon numaranız ve opsiyonel olarak e-posta adresiniz 
                                hizmetin sunulabilmesi amacı ile kaydedilmektedir. Ödeme kart bilgileriniz hiçbir şekilde bizim sistemlerimizde 
                                saklanmamakta, doğrudan banka/ödeme kuruluşu altyapısı (SSL korumalı) üzerinden işlenmektedir.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg text-slate-900 mb-2">3. VERİLERİN KORUNMASI</h2>
                            <p>
                                Kişisel verileriniz 6698 sayılı KVKK hükümlerine uygun olarak korunmaktadır. Verileriniz üçüncü taraflarla 
                                yalnızca yasal yükümlülükler çerçevesinde veya hizmetin ifası (kurye teslimatı vb.) için paylaşılabilir.
                            </p>
                        </section>
                        
                        <section>
                             <h2 className="font-bold text-lg text-slate-900 mb-2">4. İLETİŞİM</h2>
                             <p>KVKK kapsamındaki talepleriniz için {officialPhone || 'İşletme ile'} üzerinden irtibata geçebilirsiniz.</p>
                        </section>
                    </div>
                );
            default:
                return notFound();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm border rounded-2xl">
                {renderContent()}
                
                <div className="mt-12 pt-8 border-t flex justify-between items-center opacity-40 grayscale italic">
                    <span className="text-sm font-bold tracking-tighter">Powered by PROBREW</span>
                    <span className="text-xs">{officialName || brandName}</span>
                </div>
            </div>
        </div>
    );
}
