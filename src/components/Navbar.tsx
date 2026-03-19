'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import clsx from 'clsx';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'POS Çözümleri', href: '/pos' },
    { name: 'Özellikler', href: '/#ozellikler' },
    { name: 'Kurumsal', href: '/corporate' },
    { name: 'SSS', href: '/faq' },
    { name: 'İletişim', href: '/contact' },
  ];

  return (
    <nav
      className={clsx(
        'fixed w-full z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-4',
        scrolled ? 'top-2' : 'top-0'
      )}
    >
      <div
        className={clsx(
          'max-w-7xl mx-auto rounded-[2rem] transition-all duration-300 px-6 py-3 flex items-center justify-between',
          scrolled ? 'bg-white/80 backdrop-blur-xl shadow-2xl shadow-brand-dark/5 border border-white/20' : 'bg-transparent'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
            <img 
              src="/images/logo/probrew-logo.png" 
              alt="ProBrew POS" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-black text-brand-dark tracking-tighter uppercase">
            PROBREW <span className="text-emerald-500 font-extrabold">POS</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-bold text-gray-600 hover:text-brand-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}

          <div className="h-6 w-px bg-gray-200"></div>

          <Link
            href="/login"
            className="text-sm font-black text-brand-dark hover:opacity-70 transition-opacity"
          >
            Giriş Yap
          </Link>

          <Link
            href="/login?register=true"
            className="px-6 py-2.5 bg-brand-dark text-white rounded-xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-dark/20 flex items-center space-x-2"
          >
            <span>15 Gün Ücretsiz Deneyin</span>
            <FiArrowRight />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-brand-dark"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-black text-brand-dark"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr />
          <Link
            href="/login"
            className="text-xl font-bold text-brand-dark"
            onClick={() => setIsOpen(false)}
          >
            Giriş Yap
          </Link>
          <Link
            href="/login?register=true"
            className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-center shadow-xl flex items-center justify-center space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <span>15 Gün Ücretsiz Deneyin</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
