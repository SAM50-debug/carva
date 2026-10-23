"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { areCertificatesLive } from '@/lib/constants';

export default function Navigation() {
  const { scrollY } = useScroll();
  const [isExtended, setIsExtended] = useState(false);
  const [certificatesLive, setCertificatesLive] = useState(false);

  useEffect(() => {
    setCertificatesLive(areCertificatesLive());
  }, []);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsExtended(latest > 50);
    });
  }, [scrollY]);

  const navBg = useTransform(scrollY, [0, 80], ["rgba(248,250,252,0)", "rgba(248,250,252,0.12)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(201,162,39,0)", "rgba(201,162,39,0.2)"]);
  const navShadow = useTransform(scrollY, [0, 80], ["none", "0 8px 32px rgba(0,0,0,0.4)"]);
  const navY = useTransform(scrollY, [0, 80], [0, 12]);
  const navRadius = useTransform(scrollY, [0, 80], ["0px", "999px"]);
  const navWidth = useTransform(scrollY, [0, 80], ["100%", "960px"]);
  const navPx = useTransform(scrollY, [0, 80], ["0.75rem", "1.5rem"]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 pointer-events-none">
      <motion.header
        style={{
          y: navY,
          borderRadius: navRadius,
          width: navWidth,
          backgroundColor: navBg,
          borderColor: navBorder,
          boxShadow: navShadow,
          paddingLeft: navPx,
          paddingRight: navPx,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
        className="pointer-events-auto border border-transparent flex items-center h-16 md:h-20 transition-none"
      >
        {/* Left — Logo + Brand */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0 flex">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-white/[0.15] rounded-xl flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
              <Image src="/rimt-logo.webp" alt="RIMT" width={36} height={36} className="object-contain" />
            </div>
            <span className="hidden sm:block font-black text-base md:text-lg text-white tracking-tight">
              CARAVAN <span className="text-brand-red">'26</span>
            </span>
          </Link>
        </motion.div>

        {/* Center — Links (Certificates hidden from middle nav as requested) */}
        <nav className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 mx-auto px-2 md:px-8">
          {[
            { label: "Categories", href: "/#categories", hideMobile: true },
            { label: "Events", href: "/events" },
            { label: "Schedules", href: "/schedules", showWhenExtended: true },
            { label: "Rules", href: "/rules" },
          ].map((link) => {
            const isHiddenOnMobile = link.hideMobile || (link.showWhenExtended && !isExtended);
            return (
              <motion.div key={link.href} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={link.href}
                  className={`block text-xs md:text-sm font-semibold text-white/60 hover:text-white transition-opacity whitespace-nowrap ${
                    isHiddenOnMobile ? 'hidden md:block' : ''
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right — CTA (Toggles from REGISTER to CERTIFICATES at release time) */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="ml-auto shrink-0">
          <Link
            href={certificatesLive ? "/certificate" : "/register"}
            className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all shadow-lg whitespace-nowrap block ${
              certificatesLive
                ? "bg-gradient-to-r from-amber-500 via-brand-gold to-yellow-500 text-black hover:opacity-95 shadow-brand-gold/30 ring-1 ring-white/20"
                : "bg-brand-red text-white hover:bg-red-600 shadow-brand-red/20"
            }`}
          >
            {certificatesLive ? "CERTIFICATES" : "REGISTER"}
          </Link>
        </motion.div>
      </motion.header>
    </div>
  );
}
