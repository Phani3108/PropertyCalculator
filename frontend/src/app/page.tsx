'use client';

import PropertyCalculator from './components/PropertyCalculator';
import TopNav from './components/TopNav';

export default function Home() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-gray-50 py-12">
        <PropertyCalculator />
      </main>
    </>
  );
} 