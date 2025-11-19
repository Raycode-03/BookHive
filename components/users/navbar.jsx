  "use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, X, BellDot , ChevronDown , BookOpen, Mail , Info , LayoutDashboard , Shield , User , LogOut , Settings} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserAvatar } from './userAvatar';
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
export default function Navbar({ user }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    // Detect scroll
    useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 10);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ✅ Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignup = () => {
        router.push('/signup')
        setMenuOpen(false);
    };

    const handleLogin = () => {
        router.push('/login')
        setMenuOpen(false);
    };

   const handleSignOut = async () => {
      try {
        const res = await fetch('/api/auth/user_auth/logout', { method: 'POST' });

        if (!res.ok) {
          toast.error("Couldn't logout");
        } else {
          toast.success('Logout Successful!');
          setMenuOpen(false);
          window.location.href = "/login"; // <-- ensure the user is redirected
        }
      } catch (error) {
        console.error('Logout failed:', error);
        toast.error("Logout failed");
      }
    };
    
    return (
  <nav
    className={`fixed top-0 left-0 px-6 sm:px-10 md:px-20 z-20 w-full h-20 flex justify-between items-center transition-all duration-300 ${
      scrolled
        ? "bg-blue-600/90 backdrop-blur-md text-white shadow-lg"
        : "text-white"
    }`}
  >
    {/* Logo */}
    <div className="flex items-center space-x-3">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logos/book.png"
            alt="BookHive Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <p className='font-bold text-xl text-white'>BookHive</p>
        </div>
      </Link>
    </div>

    {/* Desktop Menu */}
    <ul className="hidden md:flex items-center gap-8 text-sm font-medium lg:text-base">
            {user ? ( // ✅ FIXED: Simple check if user exists
        // User is logged in
        <>
         
          {/* Admin Panel - Only for admins */}
          {user?.isAdmin === true ? (
            <>
              <li>
                <Link
                  href="/admin/dashboard"
                  className="hover:text-gray-300 transition-colors duration-200"
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/library"
                  className="hover:text-gray-300 transition-colors duration-200"
                >
                  Library Management
                </Link>
              </li>
            </>
          ): (
            <>
              <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-gray-300 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
              </li>
              <li>
                  <Link
                    href="/resources"
                    className="hover:text-gray-300 transition-colors duration-200"
                  >
                    Resources
                  </Link>
              </li>
          
            </>
          )}
          
          {/* Notifications */}
          <li>
            <Link
              href="/notifications"
              className="hover:text-gray-300 transition-colors duration-200 relative"
            >
              <BellDot size={22} />
            </Link>
          </li>
           
          <li>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-300 group"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Moon size={20} className="text-white group-hover:scale-110 transition-transform" />
                ) : (
                  <Sun size={20} className="text-white group-hover:scale-110 transition-transform" />
                )}
              </button>
            )}
          </li>                
          
          {/* User Menu Dropdown */}
          <li className="relative group">
            <button className="flex items-center gap-2 hover:opacity-80 transition-all duration-200">
              <UserAvatar avatar={user?.image} email={user?.email} className='rounded-lg'/>
              <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>

            {/* Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50">
              <div className="py-2">
                {/* User Info */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <Link
                  href="/settings"
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <hr className="my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </li>
        </>
      ) : (
        // User is not logged in
        <>
          <li>
            <Link
              href="/resources"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Resources
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:text-gray-300 transition-colors duration-200"
            >
              Contact
            </Link>
          </li>
          {/* Theme Toggle - Better positioned for guests */}
              <li>
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-300 group"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Moon size={20} className="text-white group-hover:scale-110 transition-transform" />
                    ) : (
                      <Sun size={20} className="text-white group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                )}
              </li>

          <li className="relative group">
            <button className="flex items-center gap-2 bg-blue-400 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full transition-all duration-200 shadow-lg font-medium">
              Get Started
              <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50">
              <div className="py-2">
                <button
                  onClick={handleSignup}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 text-center font-medium"
                >
                  Sign Up
                </button>
                <button
                  onClick={handleLogin}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 text-center"
                >
                  Login
                </button>
              </div>
            </div>
          </li>
        </>
      )}
    </ul>

    {/* Mobile Menu Icon */}
    <button
      onClick={() => setMenuOpen((prev) => !prev)}
      className="md:hidden text-white focus:outline-none"
    >
      {menuOpen ? <X size={28} /> : <Menu size={28} />}
    </button>

     {/* Mobile Menu */}
            {menuOpen && (
                <div
                    ref={menuRef}
                    className="absolute top-full right-4 mt-2 w-64 bg-white rounded-lg shadow-xl md:hidden transition-all duration-200 z-20 dark:bg-gray-800 dark:text-gray-300 border-0 hover:rounded-2xl"
                >
                    <div className="">
                        {user ? (
                            // Mobile menu for logged in user
                            <>
                                {/* User Info Header */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:bg-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar 
                                            avatar={user.image} 
                                            email={user.email} 
                                            size={35}
                                            className="w-5 h-5 text-blue-600 bg-black rounded-lg"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name[0].toUpperCase()+user.name.slice(1)}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                            {user?.isAdmin && (
                                                <span>
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* ADMIN MOBILE MENU */}
                                {user?.isAdmin ? (
                                    <>
                                        <Link
                                            href="/admin/dashboard"
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <LayoutDashboard size={18} />
                                            Admin Dashboard
                                        </Link>
                                        <Link
                                            href="/admin/library"
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <Shield size={18} />
                                            Library Management
                                        </Link> 
                                    </>
                                ) : (
                                    // REGULAR USER MOBILE MENU
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/resources"
                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <BookOpen size={18} />
                                            Resources
                                        </Link>
                                    </>
                                )}
                                
                                {/* Common mobile links for all users */}
                                <Link
                                    href="/notifications"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <BellDot size={18} />
                                    Notifications
                                </Link>
                                
                                <hr className="my-1" />
                                
                                {/* Theme toggle */}
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </button>
                                
                              
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Settings size={18} />
                                    Settings
                                </Link>
                                
                                <hr className="my-1" />
                                
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            // Mobile menu for guest
                            <>
                                <Link
                                    href="/resources"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <BookOpen size={18} />
                                    Resources
                                </Link>
                                <Link
                                    href="/about"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Info size={18} />
                                    About
                                </Link>
                                <Link
                                    href="/contact"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <Mail size={18} />
                                    Contact
                                </Link>
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </button>
                                <hr className="my-1" />
                                
                                <button
                                    onClick={handleSignup}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm text-white bg-blue-500 hover:bg-blue-600 font-medium"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

  </nav>
);
}
