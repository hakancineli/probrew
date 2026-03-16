import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export const metadata: Metadata = {
    title: 'İletişim',
    description: 'ProBrew ile iletişime geçin. Adres, telefon, e-posta ve çalışma saatlerimizi burada bulabilirsiniz.',
    alternates: {
        canonical: 'https://www.probrew.com.tr/contact',
    },
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Contact Info */}
                <div className="bg-brand-secondary p-12 lg:p-24 text-white flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-8">BİZE ULAŞIN</h1>
                    <p className="mb-12 text-lg opacity-90">Soru, öneri ve talepleriniz için her zaman buradayız. Bizimle iletişime geçmekten çekinmeyin.</p>

                    <div className="space-y-8">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaPhone className="text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Telefon</h4>
                                <p className="opacity-80">+90 554 581 20 34</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaEnvelope className="text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">E-posta</h4>
                                <p className="opacity-80">info@probrew.com.tr</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaMapMarkerAlt className="text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Adres</h4>
                                <p className="opacity-80">Zafer mahallesi, Baki Sk. no: 46 Bahçelievler / İstanbul</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaClock className="text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Çalışma Saatleri</h4>
                                <p className="opacity-80">Hafta İçi: 08:00 - 22:00<br />Hafta Sonu: 09:00 - 23:00</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form / Map */}
                <div className="p-12 lg:p-24 flex flex-col justify-center">
                    <form className="space-y-6 max-w-lg mx-auto w-full">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Mesaj Gönderin</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adınız Soyadınız</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Joe Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none">
                                <option>Genel Sorular</option>
                                <option>Şikayet / Teşekkür</option>
                                <option>Kurumsal İşbirliği</option>
                                <option>Diğer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mesajınız</label>
                            <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="Mesajınızı buraya yazınız..." />
                        </div>
                        <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg">
                            Yayınla
                        </button>
                    </form>
                </div>
            </div>

            {/* Map Section */}
            <section className="h-[400px] w-full grayscale contrast-125 transition-all hover:grayscale-0">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1505.53982054625!2d28.8315180!3d40.9996914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa364e!2sZafer%2C%20Baki%20Sk.%20No%3A46%2C%2034197%20Bah%C3%A7elievler%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1741951500000!5m2!1str!2str"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                />
            </section>

            <Footer />
        </main>
    );
}
