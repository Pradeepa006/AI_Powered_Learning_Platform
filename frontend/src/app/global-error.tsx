'use client';

import { useEffect } from 'react';
import { ServerCrash } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center">
          <ServerCrash className="w-24 h-24 text-red-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-lg text-gray-500 mb-6">
            We're sorry, but an unexpected error occurred.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
