'use client';
import React, { useEffect, useState } from 'react';
import TopNav from '../components/TopNav';
import ChatPanel from '../components/ChatPanel';

const BG_IMAGE = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=60&auto=format&fit=crop';

export default function DocsPage() {
  const [schema, setSchema] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/openapi');
      if (res.ok) setSchema(await res.json());
    };
    run();
  }, []);

  return (
    <>
      <TopNav />
      <div
        className="page-bg"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <main className="relative max-w-4xl mx-auto pt-24 pb-12 px-6">
        <div className="glass-card p-6 sm:p-8">
          <h1 className="text-2xl font-serif font-bold text-espresso mb-4">API Documentation</h1>
          {!schema && <div className="text-sand-500">Loading schema…</div>}
          {schema && (
            <pre className="bg-charcoal text-gold-400 text-xs p-5 rounded-xl overflow-auto max-h-[70vh]">{JSON.stringify(schema, null, 2)}</pre>
          )}
          <div className="mt-6 text-sm text-sand-500">
            Import this OpenAPI schema into Postman, Swagger UI, or any API client. Use header <code className="bg-sand-100 px-1.5 py-0.5 rounded text-xs">x-api-key</code> for v1 endpoints.
          </div>
        </div>
      </main>
      <ChatPanel />
    </>
  );
}

