'use client';

import PropertyCalculator from './components/PropertyCalculator';
import TopNav from './components/TopNav';
import ChatPanel from './components/ChatPanel';

// Unsplash: Dubai skyline at golden hour (free to use)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80&auto=format&fit=crop';

export default function Home() {
  return (
    <>
      <TopNav transparent />

      {/* ── Hero Section ── */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-sand-50" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto animate-fade-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight text-balance">
            Your Global Property<br />
            <span className="text-gold-400">Intelligence</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white/80 font-sans max-w-xl mx-auto">
            Calculate property costs across 35 cities worldwide. Stamp duty, registration, EMI — all verified to the last digit.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#calculator" className="btn-gold text-base">
              Start Calculating
            </a>
            <a href="/compare" className="btn-secondary text-base !text-white !border-white/30 hover:!bg-white/10">
              Compare Cities
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Calculator Section ── */}
      <main id="calculator" className="relative min-h-screen bg-sand-50 py-12 md:py-20 px-4">
        {/* Subtle background pattern */}
        <div
          className="page-bg opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=60&auto=format&fit=crop')`,
          }}
        />
        <div className="relative z-10">
          <PropertyCalculator />
        </div>
      </main>

      {/* ── Chat Panel ── */}
      <ChatPanel />
    </>
  );
} 