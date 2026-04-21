'use client';
import React, { useState } from 'react';

export default function TopNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/compare', label: 'Compare' },
    { href: '/contribute', label: 'Add City' },
    { href: '/docs', label: 'API Docs' },
    { href: '/receipt', label: 'Receipt' },
  ];

  return (
    <nav className="w-full bg-white border-b print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold text-lg">🏠 PropCalc</a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-blue-700 hover:underline">
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-1" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t px-4 py-2 bg-white space-y-2">
          {links.map(l => (
            <a key={l.href} href={l.href} className="block text-sm text-gray-700 py-1 hover:text-blue-700" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

