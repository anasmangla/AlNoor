"use client";
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // Optionally report error to an APM service
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-4">An unexpected error occurred. Please try again.</p>
          <button onClick={() => reset()} className="text-blue-700 hover:underline">Reload</button>
        </div>
      </body>
    </html>
  );
}

