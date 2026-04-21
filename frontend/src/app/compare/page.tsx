'use client';
import ScenarioCompare from '../components/ScenarioCompare';
import TopNav from '../components/TopNav';
import ChatPanel from '../components/ChatPanel';

const BG_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=60&auto=format&fit=crop';

export default function ComparePage() {
  return (
    <>
      <TopNav />
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <main className="relative min-h-screen pt-24 pb-12 px-4">
        <ScenarioCompare />
      </main>
      <ChatPanel />
    </>
  );
}

