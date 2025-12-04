import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Optional: Add your logo or branding */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-indigo-600">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go back home
            </Link>
          </div>
          
          <div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </Link>
          </div>

          {/* Optional: Search or suggestions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Can&apos;t find what you need? 
              <Link href="/contact" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}