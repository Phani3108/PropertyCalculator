'use client';
import ScenarioCompare from '../components/ScenarioCompare';
import TopNav from '../components/TopNav';

export default function ComparePage() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-gray-50 py-6 md:py-12 px-2 sm:px-4">
        <ScenarioCompare />
      </main>
    </>
  );
}

