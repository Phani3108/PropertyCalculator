'use client';
import React, { useEffect, useState } from 'react';
import TopNav from '../components/TopNav';

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
      <main className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-4">API Docs</h1>
        {!schema && <div className="text-gray-600">Loading schema…</div>}
        {schema && (
          <pre className="bg-gray-900 text-green-200 text-xs p-4 rounded overflow-auto">{JSON.stringify(schema, null, 2)}</pre>
        )}
        <div className="mt-6 text-sm text-gray-600">
          This is a basic OpenAPI schema. You can import it into tools like Postman or Swagger UI.
        </div>
      </main>
    </>
  );
}

