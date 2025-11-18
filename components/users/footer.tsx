import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
function Footer() {
  return (
    <div>
        {/* footer */}
    <footer className="px-6 md:px-16 py-20 bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100">
  {/* Main Grid Section */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8">
    {/* About Us */}
    <div>
     <h4 className="text-lg font-semibold mb-4">About Us</h4>
        <ul className="space-y-2 text-sm">
        <li>
            <Link href="/about" className="hover:text-green-300 transition-colors">
            About BookHive
            </Link>
        </li>
        <li>
            <Link href="/resources" className="hover:text-green-300 transition-colors">
            Explore Features
            </Link>
        </li>
        <li>
            <Link href="/signup" className="hover:text-green-300 transition-colors">
            Join BookHive
            </Link>
        </li>
        </ul>
    </div>

    {/* Privacy Section */}
    <div>
            <h4 className="text-lg font-semibold mb-4">Privacy</h4>
        <ul className="space-y-2 text-sm">
        <li>
            <Link href="/terms" className="hover:text-green-300 transition-colors">
            Terms & Conditions
            </Link>
        </li>
        <li>
            <Link href="/privacy" className="hover:text-green-300 transition-colors">
            Privacy Policy
            </Link>
        </li>
        </ul>
    </div>

    {/* BookHive Info */}
    <div>
        <h4 className="text-lg font-semibold mb-4">BookHive</h4>
        <p className="text-sm text-gray-500 mb-3">
        BookHive is your cloud-based library management platform for books, board games, movies, music, and video games. Perfect for libraries, schools, organizations, and home collections.
        </p>
        <h5 className="font-semibold mb-1">Contact us:</h5>
        <p className="text-sm mb-3">+234 7017 3453 453</p>
        <div className="flex items-center gap-8">
            <Link href="https://instagram.com">
                <Image src="/logos/instagram.png" alt="Instagram" width={25} height={25} />
            </Link>
            <Link href="https://facebook.com">
                <Image src="/logos/facebook.png" alt="Facebook" width={25} height={25} />
            </Link>
        </div>

    </div>
  </div>

  {/* Bottom Bar */}
    <div className="pt-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} BookHive. All rights reserved.
    </div>
</footer>
    </div>
  )
}

export default Footer