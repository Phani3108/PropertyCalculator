'use client';
import React, { useState, useEffect } from 'react';

interface TopNavProps {
  transparent?: boolean;
}

export default function TopNav({ transparent = false }: TopNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  const isTransparent = transparent && !scrolled && !open;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/compare', label: 'Compare' },
    { href: '/contribute', label: 'Add City' },
    { href: '/docs', label: 'API Docs' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 print:hidden ${
        isTransparent ? 'nav-transparent' : 'nav-solid'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏛</span>
          <span className={`font-serif text-xl font-bold tracking-tight transition-colors ${
            isTransparent ? 'text-white' : 'text-espresso'
          }`}>
            PropCalc
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium tracking-wide transition-colors relative
                after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px]
                after:bg-gold-400 after:transition-all after:duration-300 hover:after:w-full
                ${isTransparent
                  ? 'text-white/90 hover:text-white'
                  : 'text-sand-500 hover:text-espresso'
                }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-colors ${isTransparent ? 'text-white' : 'text-espresso'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-sand-50/98 backdrop-blur-md border-t border-sand-200 px-5 py-4 space-y-1">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2.5 text-sm font-medium text-espresso hover:text-gold-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

