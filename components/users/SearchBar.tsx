"use client";
import { Search, X } from "lucide-react";
import React from "react";

interface SearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  setShowSearchResults: (state: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isMobile?: boolean;
  onSearchSubmit?: () => void;
}

export function SearchBar({
  query,
  setQuery,
  setShowSearchResults,
    inputRef,
    isMobile = false,
    onSearchSubmit,
    }: SearchBarProps) {
      const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
          onSearchSubmit?.(); // Call the submit handler
        }
      };
    return (
        <div className="flex items-center w-full max-w-md h-10 rounded-lg px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 shadow-sm transition-all">
        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />

        <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
            setQuery(e.target.value);
            setShowSearchResults(!!e.target.value.trim());
        }}
        onKeyPress={handleKeyPress}
        onFocus={() => {
          if (query.trim()) {
            setShowSearchResults(true);
          }
        }}
        placeholder="Search..."
        className="flex-1 bg-transparent px-3  outline-none text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
      />

      {query && (
        <button
          onClick={() => {
            setQuery("");
            setShowSearchResults(false);
            inputRef.current?.focus();
          }}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}
