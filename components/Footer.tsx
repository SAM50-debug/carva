"use client";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-brand-gold/15 mt-auto" style={{ background: 'linear-gradient(to top, rgba(201,162,39,0.03) 0%, transparent 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden shadow-lg">
            <Image src="/rimt-logo.webp" alt="RIMT" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-2xl tracking-tight text-brand-cream">
              CARAVAN <span className="text-brand-crimson">'26</span>
            </h4>
            <p className="text-brand-cream/40 text-sm font-medium">RIMT University Youth Festival</p>
          </div>
        </div>
        <nav className="flex gap-8 text-sm font-semibold text-brand-cream/50 bg-brand-cream/[0.04] px-6 py-3 rounded-full border border-brand-gold/15">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/events" className="hover:text-brand-gold transition-colors block">Events</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/rules" className="hover:text-brand-gold transition-colors block">Rules &amp; Guidelines</Link>
          </motion.div>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-10 border-t border-brand-gold/[0.08] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-brand-cream/30">
        <p>© 2026 RIMT University. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="mailto:caravan@rimt.ac.in" className="hover:text-brand-gold transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            caravan@rimt.ac.in
          </a>
          <a href="https://rimt.ac.in/" target="_blank" rel="noreferrer" className="hover:text-brand-gold transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            rimt.ac.in
          </a>
        </div>
      </div>
    </footer>
  );
}
