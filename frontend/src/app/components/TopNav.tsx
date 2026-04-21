'use client';
import React from 'react';

export default function TopNav() {
  const link = (href: string, label: string) => (
    <a href={href} className="text-sm text-gray-700 hover:text-blue-700 hover:underline">
      {label}
    </a>
  );

  return (
    <nav className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-semibold">Prop Calculator</a>
        <div className="flex items-center gap-4">
          {link('/', 'Home')}
          {link('/compare', 'Compare')}
          {link('/docs', 'API Docs')}
          {link('/receipt', 'Receipt')}
        </div>
      </div>
    </nav>
  );
}

