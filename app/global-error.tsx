'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
            <p className="mt-2 text-gray-600">We apologize for the inconvenience.</p>
            <button
              onClick={() => reset()}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}