'use client';
import ScenarioCompare from '../components/ScenarioCompare';
import TopNav from '../components/TopNav';

export default function ComparePage() {
  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-gray-50 py-12">
        <ScenarioCompare />
      </main>
    </>
  );
}

