"use client";
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Navigation() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(248,250,252,0)", "rgba(248,250,252,0.12)"]);
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(201,162,39,0)", "rgba(201,162,39,0.2)"]);
  const navShadow = useTransform(scrollY, [0, 80], ["none", "0 8px 32px rgba(0,0,0,0.4)"]);
  const navY = useTransform(scrollY, [0, 80], [0, 12]);
  const navRadius = useTransform(scrollY, [0, 80], ["0px", "999px"]);
  const navWidth = useTransform(scrollY, [0, 80], ["100%", "960px"]);
  const navPx = useTransform(scrollY, [0, 80], ["1rem", "2rem"]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
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

        {/* Center — Links */}
        <nav className="flex items-center gap-4 md:gap-8 mx-auto px-2 md:px-8">
          {[
            { label: "Categories", href: "/#categories", hideMobile: true },
            { label: "Events", href: "/events" },
            { label: "Rules", href: "/rules" },
          ].map((link) => (
            <motion.div key={link.href} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={link.href}
                className={`block text-xs md:text-sm font-semibold text-white/60 hover:text-white transition-opacity whitespace-nowrap ${link.hideMobile ? 'hidden md:block' : ''}`}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right — CTA */}
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          href="https://forms.cloud.microsoft/r/3c3TxNrbsM"
          target="_blank"
          rel="noreferrer"
          className="ml-auto shrink-0 bg-brand-red text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm hover:bg-red-600 transition-colors shadow-lg shadow-brand-red/20 whitespace-nowrap"
        >
          REGISTER
        </motion.a>
      </motion.header>
    </div>
  );
}
