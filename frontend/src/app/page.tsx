'use client';

import PropertyCalculator from './components/PropertyCalculator';
import TopNav from './components/TopNav';

export default function Home() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-gray-50 py-6 md:py-12 px-2 sm:px-4">
        <PropertyCalculator />
      </main>
    </>
  );
} 