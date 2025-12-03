import React from 'react'
import Navbar from '@/components/users/navbar'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Footer from '@/components/users/footer'
import { getUnifiedSession } from '@/lib/getUnifiedSession'

async function Page() {
  const session = await getUnifiedSession();
  const user = session?.user;
  const features = [
    {
      title: "Smart Cataloging",
      description:
        "Easily reserve your books, games, movies, music, and more. One can also reserve for the future — all in one cloud-based system.",
      img: "/logos/lshelf.jpg",
    },
    {
      title: "Quick Search & Filters",
      description:
        "Find what you need instantly using smart search, categories, and filters. No more manual digging through lists.",
      img: "/logos/lshelf.jpg",
    },
    {
      title: "Borrowing & Reservations",
      description:
        "Let users reserve or borrow items and track due dates with ease. Smooth resource management made simple.",
      img: "/logos/lshelf.jpg",
    },
    {
      title: "Overdue Fine Tracking",
      description:
        "Automatic fine calculation for late returns to keep things fair and organized.",
      img: "/logos/lshelf.jpg",
    },
  ];

  return (
    <main className="relative w-full min-h-screen">

      {/* HERO IMAGE SECTION */}
      <div className="w-full min-h-screen relative">
        <Image
          src="/logos/luci.jpg"
          alt="background image"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Text on top of hero */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <h1 className="text-4xl xs:text-7xl font-bold mb-4 text-white">
            Cloud Cataloging
          </h1>

          <h2 className="text-lg sm:text-3xl mb-5 text-white max-w-2xl">
            Your library has never looked so good<br />
            Books, Board Games, Movies, Music and Video Games
          </h2>

          <Button className="bg-blue-600 rounded-full px-10 py-6 text-white hover:bg-blue-700 transition duration-200">
            <Link href={'/resources'}>
              Get Started
            </Link>
          </Button>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <Navbar user={user} />

      {/* FEATURES */}
      <section className="bg-gray-100 dark:bg-gray-900 py-16 px-4 sm:px-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          App Features
        </h1>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image */}
              <div className="w-full h-44 sm:h-48 relative">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Text */}
              <div className="p-6 text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {feature.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VISION SECTION */}
      <section className="bg-white dark:bg-gray-900 py-20 px-6 sm:px-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Our Vision
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          At BookHive, we believe that resource sharing should be simple, smart,
          and social. Whether you&apos;re a student, a gamer, or a film lover, our
          platform helps you find and borrow what you love, faster than ever.
        </p>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-blue-600 py-20 text-center text-white px-6 sm:px-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Have a Question or Need Help?
        </h2>

        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
          We&apos;re always here to assist you. Reach out to our team anytime and get
          quick support for your library system.
        </p>

        <a
          href="/contact"
          className="bg-white text-blue-600 px-10 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
        >
          Contact Us
        </a>
      </section>

      <Footer />
    </main>
  )
}

export default Page
