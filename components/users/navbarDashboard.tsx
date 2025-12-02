"use client"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Bell, Search, LogOut, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { UserAvatar } from "./userAvatar"
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from 'sonner';
import { SearchBar } from "@/components/users/SearchBar";
import { useRouter } from "next/navigation"
import  Link from "next/link";
interface NavbarProps {
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string;
        isAdmin: boolean;
        packageType: string;
    }
    pageTitle?: string;
    searchBooks?: boolean;
}

export default function NavbarDashboard({ user, pageTitle = "dashboard", searchBooks }: NavbarProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    useEffect(() => setMounted(true), []);
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };
    
    const isMobileDevice = useIsMobile()
    const [query, setQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [loading, setLoading] = useState(false)
    const [keywords, setKeywords] = useState([])
    const [showSearchMobile, setShowSearchMobile] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const { state, isMobile } = useSidebar()
    const sidebarWidth = state === "expanded" ? "16rem" : "3rem"
    
    const searchRef = useRef<HTMLDivElement>(null)
    const userMenuRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const mobileSearchInputRef = useRef<HTMLInputElement>(null)
    // Close handlers
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Close search results when clicking outside
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
            
            // Close mobile search when clicking outside the entire search area
            if (showSearchMobile && searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchMobile(false);
                setShowSearchResults(false);
                setQuery("");
            }
            
            // Close user menu when clicking outside
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSearchMobile]);

    // Focus mobile search input when opened
    useEffect(() => {
        if (showSearchMobile && mobileSearchInputRef.current) {
            mobileSearchInputRef.current.focus();
        }
    }, [showSearchMobile]);

    // Search keywords
    useEffect(() => {
        if (!query.trim()) {
            setKeywords([]);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                  setLoading(true);
            const res = await fetch(`/api/books/keywords?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (!res.ok) toast.error(data.error|| "Failed to fetch keywords");
            setKeywords(data);
            } catch (error) {
                if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                    toast.error("📡 Connection lost. Please check your internet.");
                } else if (error instanceof Error) {
                    // Show the actual server error message
                    toast.error(`Search error: ${error.message}`);
                } else {
                    toast.error("An unexpected error occurred");
                }
                setKeywords([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query]);

    const handleSignOut = async () => {
        try {
            const res = await fetch('/api/auth/user_auth/logout', { method: 'POST' });

            if (!res.ok) {
                toast.error("Couldn't logout");
            } else {
                toast.success('Logout Successful!');
                window.location.href = "/login";
            }
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error("Logout failed");
        }
    };

    const SearchResults = () => (
        <div
            className={`absolute top-12 left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-30 ${
                showSearchResults ? "block" : "hidden"
            }`}
        >
            {loading && (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            )}

            {!loading && keywords.length === 0 && query.trim() && (
                <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">No results found</p>
            )}
            
            {!loading && keywords.length > 0 && (
                <ul className="max-h-60 overflow-y-auto">
                    {keywords.map((word: any, i: number) => (
                        <li
                            key={i}
                            onClick={() => {
                                // setQuery(word.snippet);
                                // setShowSearchResults(false);
                                const route = user?.isAdmin 
                                ? `/admin/library?search=${encodeURIComponent(word.snippet)}`
                                : `/resources?search=${encodeURIComponent(word.snippet)}`;
                                
                                router.push(route);
                                setShowSearchResults(false);
                                setQuery("");
                                if (isMobileDevice) {
                                    setShowSearchMobile(false);
                                }
                            }}
                            className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{word.snippet}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
     // Update SearchBar component to handle Enter key
  const handleSearchSubmit = () => {
    if (query.trim()) {
      // Navigate to admin/resources with search query
       const route = user?.isAdmin
       ?`/admin/library?search=${encodeURIComponent(query)}`
       : `/resources?search=${encodeURIComponent(query)}`;
       
      
      router.push(route);
      setShowSearchResults(false);
      setQuery(""); // Clear the input
    }
  };
    return (
        <>
            {/* Main Navbar */}
            <div
                className="fixed top-0 z-30 h-20 flex items-center justify-between px-6 bg-blue-600/90 backdrop-blur-md  dark:bg-blue-600/90 text-white shadow-lg transition-all duration-300"
                style={{
                    left: isMobile ? "0" : sidebarWidth,
                    width: isMobile ? "100%" : `calc(100% - ${sidebarWidth})`,
                }}
            >
                {/* Left Section - Sidebar Trigger and Page Title */}
                <div className="flex items-center gap-4 flex-1">
                    <SidebarTrigger className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors flex-shrink-0" />
                    
                    {!showSearchMobile && (
                        <h1 className="text-xl font-bold capitalize text-white">
                            {pageTitle}
                        </h1>
                    )}
                </div>

                {/* Center/Right Section - Search, Icons, and User Menu */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* Desktop Search - Positioned on the right */}
                    {!isMobileDevice && searchBooks && (
                        <div className="relative mr-4 w-full max-w-xs" ref={searchRef}>
                            <SearchBar
                                query={query}
                                setQuery={setQuery}
                                setShowSearchResults={setShowSearchResults}
                                inputRef={searchInputRef}
                                onSearchSubmit={handleSearchSubmit}
                            />
                            <SearchResults />
                        </div>
                    )}

                    {/* Mobile Search Toggle */}
                    {isMobileDevice && searchBooks && !showSearchMobile && (
                        <button 
                            onClick={() => setShowSearchMobile(true)}
                            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Search className="w-5 h-5 text-white" />
                        </button>
                    )}

                    {/* Right Section - Icons & User Menu */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <Link href="/notification" className="relative cursor-pointer">
                            <button className="p-2 rounded-lg hover:bg-blue-700 transition-colors group relative">
                                <Bell className="w-5 h-5 text-white" />
                                <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                            </button>
                        </Link>

                        {/* Theme Toggle */}
                        <li className="list-none">
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg hover:bg-blue-700 transition-all duration-300 group"
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

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="p-0 transition-colors rounded-full hover:ring-2 hover:ring-blue-400"
                            >
                                {user?.email ? (
                                    <UserAvatar 
                                        avatar={user.image} 
                                        email={user.email} 
                                        size={35}
                                        className="rounded-full border-2 border-white"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user?.name || user?.email || "Guest"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                            {user?.packageType || "Free"} Plan
                                            {user?.isAdmin && " • Admin"}
                                        </p>
                                    </div>
                                    
                                    <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors">
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                    <button 
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {searchBooks && isMobileDevice && showSearchMobile && (
                <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900">
                    <div 
                        className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        ref={searchRef}
                    >
                        <div className="flex-1 mr-3">
                            <SearchBar
                              query={query}
                              setQuery={setQuery}
                              setShowSearchResults={setShowSearchResults}
                              inputRef={mobileSearchInputRef}
                              isMobile={true}
                            />
                        </div>
                        <button 
                            onClick={() => {
                                setShowSearchMobile(false);
                                setShowSearchResults(false);
                                setQuery("");
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 font-medium text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                    
                    {/* Search Results for Mobile */}
                    <div className="absolute top-16 left-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-30 overflow-auto">
                        {showSearchResults && <SearchResults />}
                    </div>
                </div>
            )}
        </>
    );
}