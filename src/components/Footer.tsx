'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Çözümlerimiz',
      links: [
        { name: 'POS Yazılımı', href: '/pos' },
        { name: 'Mutfak Ekranı (KDS)', href: '/pos' },
        { name: 'Mobil Sipariş', href: '/pos' },
        { name: 'QR Menü', href: '/pos' },
      ],
    },
    {
      title: 'Kurumsal',
      links: [
        { name: 'Hakkımızda', href: '/about' },
        { name: 'Kurumsal Çözümler', href: '/corporate' },
        { name: 'Çözüm Ortaklığı', href: '/franchising' },
        { name: 'İletişim', href: '/contact' },
        { name: 'SSS', href: '/faq' },
      ],
    },
    {
      title: 'Yasal',
      links: [
        { name: 'Gizlilik Politikası', href: '/privacy' },
        { name: 'Kullanım Koşulları', href: '/terms' },
        { name: 'KVKK Metni', href: '/kvkk' },
        { name: 'İptal ve İade', href: '/iptal-iade-kosullari' },
        { name: 'Abonelik Yönetimi', href: '/account' },
      ],
    },
  ];

  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 border-b border-white/10 pb-16">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/images/logo/probrew-logo.png"
                  alt="ProBrew POS"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">
                PROBREW <span className="text-emerald-500 font-extrabold font-sans">POS</span>
              </span>
            </Link>
            <p className="text-gray-400 font-medium max-w-sm leading-relaxed">
              İşletmenizi modern çağın gereksinimlerine göre dijitalleştiriyoruz.
              Yapay zeka destekli POS çözümlerimizle verimliliği artırın, operasyonu sadeleştirin.
              <br /><br />
              <span className="text-sm">Destek: <span className="text-white">info@probrew.com.tr</span></span>
            </p>
            <div className="flex space-x-4 pt-4">
              {[FaLinkedin, FaTwitter, FaInstagram, FaFacebook].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-primary transition-all">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm font-medium">
          <p>© {new Date().getFullYear()} ProBrew Technology Group. Tüm hakları saklıdır.</p>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Sistem Durumu: Aktif</span>
            </span>
            <p>Zafer mahallesi, Baki Sk. no: 46 Bahçelievler / İstanbul</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/5 pt-8 text-[10px] text-gray-600 leading-relaxed font-medium">
          <p>
            ProBrew, işletmeler için özelleştirilmiş bir ara yüz sunan bağımsız bir platformdur ve Google ile herhangi bir bağlılığı, sponsorluğu veya onayı bulunmamaktadır. Gemini modeline olan erişim, özel ara yüzümüz aracılığıyla sağlanmaktadır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
