// components/UserResources.tsx
"use client"
import React from 'react'
import { BookCardWithAction } from '@/components/users/dashboard/BookCardWithAction'
import { Book } from '@/types/BookCard'
import { useRouter, useSearchParams } from 'next/navigation';
import { BooksSkeleton } from '@/components/users/skeleton'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

interface BooksResponse {
  books: Book[];
  hasMore: boolean;
  currentPage: number;
  total: number;
}

const UserResources: React.FC = () => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const router = useRouter();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['books', urlSearch],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const endpoint = urlSearch 
          ? `/api/users/resources?search=${encodeURIComponent(urlSearch)}&page=${pageParam}&limit=10`
          : `/api/users/resources?page=${pageParam}&limit=10`;
        
        const res = await fetch(endpoint);
        
        if (res.status === 401) {
          router.push("/login");
          throw new Error('Unauthorized');
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Unable to fetch books");
        }
        
        return res.json();
      } catch (err) {
        console.log(err);
        toast.error('Network error. Trying again...');
        throw err;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: BooksResponse) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  // Simple intersection observer
  const { ref, inView } = useInView();
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Flatten all books from all pages and remove duplicates
  const allBooks = React.useMemo(() => {
    const books = data?.pages.flatMap(page => page.books) || [];
    
    // Remove duplicates by _id
    const uniqueBooks = books.reduce((acc: Book[], current: Book) => {
      const exists = acc.find(book => book._id === current._id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return uniqueBooks;
  }, [data]);

  // Show loading state
  if (isLoading) {
    return <BooksSkeleton count={8} />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading books. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search info */}
      {urlSearch && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Search results for: &apos;{urlSearch}&apos;
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {allBooks.length} books
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allBooks.map(book => (
          <BookCardWithAction
            key={book._id}
            title={book.title}
            author={book.author}
            imageUrl={book.imageUrl}
            packageType={book.packageType}
            availableCopies={book.availableCopies}
            ctaLabel={(book.availableCopies ?? 0) > 0 ? "Borrow" : "Unavailable"}
            disabled={book.availableCopies === 0}
            onClick={() => (book.availableCopies ?? 0) > 0 && console.log('Borrow', book._id)}
          />
        ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      {isFetchingNextPage && <BooksSkeleton count={4} />}

      {/* Intersection observer trigger */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {hasNextPage ? (
          <p className="text-gray-500">Scroll to load more books...</p>
        ) : allBooks.length > 0 ? (
          <p className="text-gray-500 p-15 mt-30">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            No more books to load</p>
        ) : null}
      </div>

      {/* No results message */}
      {allBooks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            No books found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {urlSearch ? 'Try a different search term' : 'No books available at the moment'}
          </p>
        </div>
      )}
    </div>
  );
}

export default UserResources;