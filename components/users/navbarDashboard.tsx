"use client"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Bell, Search, X, LogOut, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { UserAvatar } from "./userAvatar"
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from 'sonner';
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
    searchBooks?:boolean;
}

export default function NavbarDashboard({ user  , pageTitle="dashboard" , searchBooks}: NavbarProps ) {
   const { theme, setTheme } = useTheme();
       const [mounted, setMounted] = useState(false);
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
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/feeds/keywords?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to fetch keywords");
        const data = await res.json();
        setKeywords(data);
      } catch (err) {
        console.error("Error fetching keywords:", err);
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
        window.location.href = "/login"; // <-- ensure the user is redirected
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error("Logout failed");
    }
  };


  const SearchBar = ({ isMobile = false }) => (
    <div className="flex items-center w-[22em] h-10 rounded-lg px-3 bg-white border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 shadow-sm transition-all">
      <Search className="w-5 h-5 text-gray-500 flex-shrink-0" /> 
      <input
        ref={isMobile ? mobileSearchInputRef : null}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSearchResults(!!e.target.value.trim());
        }}
        placeholder="Search Posts..."
        className="flex-1 px-3 bg-transparent outline-none text-gray-700 placeholder-gray-500 text-sm"
      />
      {query && (
        <button 
          onClick={() => { 
            setQuery(""); 
            setShowSearchResults(false);
            if (isMobile) {
              mobileSearchInputRef.current?.focus();
            }
          }} 
          className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );

  const SearchResults = () => (
    <div
      className={`absolute top-12 left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 p-2 z-30 ${
        showSearchResults ? "block" : "hidden"
      }`}
    >
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && keywords.length === 0 && query.trim() && (
        <p className="text-gray-500 text-sm py-4 text-center">No results found</p>
      )}
      
      {!loading && keywords.length > 0 && (
        <ul className="max-h-60 overflow-y-auto">
          {keywords.map((word: any, i: number) => (
            <li
              key={i}
              onClick={() => {
                setQuery(word.snippet);
                setShowSearchResults(false);
                if (isMobileDevice) {
                  setShowSearchMobile(false);
                }
              }}
              className="cursor-pointer px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700">{word.snippet}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {/* Main Navbar */}
      <div
        className="fixed top-0 z-30 h-20 flex items-center justify-between px-4  bg-blue-600/90 backdrop-blur-md text-white shadow-lg transition-all"
        style={{
          left: isMobile ? "0" : sidebarWidth,
          width: isMobile ? "100%" : `calc(100% - ${sidebarWidth})`,
        }}
      >
        {/* Left Section - Logo & Trigger with better spacing */}
        <div className="flex items-center gap-3 md:gap-4">
          <SidebarTrigger className="text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors flex-shrink-0" />
          
          {!showSearchMobile && (
            <div className="flex items-center gap-5 text-2xl font-bold">
              <h1>{pageTitle}</h1>
            </div>
          )}
          
          {/* Mobile Search Toggle - Better positioned */}
          {isMobileDevice && !showSearchMobile && (
            <button 
              onClick={() => setShowSearchMobile(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto md:ml-0"
            >
              {searchBooks===true &&(
                  <Search className="w-5 h-5 text-gray-600" />
              )}
              
            </button>
          )}
        </div>

        {/* Desktop Search - Moved to the right */}
        {!isMobileDevice && (
          <div className="flex items-center gap-4">

           {searchBooks &&(
               <div className="relative" ref={searchRef}>
              <SearchBar />
              <SearchResults />
            </div>
           )}

            {/* Right Section - Icons & User Menu */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors group relative">
                <Bell className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
                <div className="absolute -top-0 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <div>
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
              </div>
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-0 border-0 transition-colors"
                >
                  {user?.email ? (
                    <UserAvatar 
                      avatar={user.image} 
                      email={user.email} 
                      size={35}
                      className="w-5 h-5  text-blue-600 bg-black rounded-lg"
                    />
                  ) : (
                    <User className="w-5 h-5 text-blue-600 bg-black" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name || user?.email || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.packageType || "Free"} Plan
                      </p>
                    </div>
                    
                    <button className="w-full text-left px-3 py-2 text-black hover:bg-gray-50 flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Right Section - Icons & User Menu */}
        {!isMobileDevice && showSearchMobile ? null : isMobileDevice && !showSearchMobile && (
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors group relative">
              <Bell className="w-5 h-5 text-blue-600 group-hover:text-blue-800" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <div>
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
            </div>
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-0 bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                {user?.email ? (
                  <UserAvatar 
                    avatar={user.image} 
                    email={user.email} 
                    className="w-5 h-5 text-blue-600"
                  />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || user?.email || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.packageType || "Free"} Plan
                    </p>
                  </div>
                  
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Overlay - Full screen overlay */}
      {isMobileDevice && showSearchMobile && (
        <div className="fixed inset-0 z-40 bg-white">
          <div 
            className="flex items-center h-16 px-4 border-b border-gray-200 bg-white"
            ref={searchRef}
          >
            <div className="flex-1 mr-3">
              {searchBooks &&(
                  <SearchBar isMobile={true} />
              )}
              
            </div>
            <button 
              onClick={() => {
                setShowSearchMobile(false);
                setShowSearchResults(false);
                setQuery("");
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 font-medium text-sm"
            >
              Cancel
            </button>
          </div>
          
          {/* Search Results for Mobile */}
          <div className="absolute top-16 left-0 right-0 bottom-0 bg-white z-30 overflow-auto">
            {showSearchResults && <SearchResults />}
          </div>
        </div>
      )}
    </>
  );
}