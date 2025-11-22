"use client"
import React, { useState, useEffect} from 'react'
import { AdminBookCard } from '@/components/admin/AdminBookCard'
import { BooksSkeleton } from '@/components/users/skeleton'
import { BookOpen ,  ChevronLeft, ChevronRight} from 'lucide-react'
import { toast } from 'sonner'
import EditBookCard from '@/components/admin/EditBookCard'
import { Book } from '@/types/BookCard'
import { useSearchParams } from 'next/navigation';
interface AdminResourcesProps {
  refetchTrigger?: number,
  optimisticBooks?: Book[] 
}
const AdminResources = ({  refetchTrigger = 0,  optimisticBooks: externalOptimisticBooks = [] }: AdminResourcesProps) => {
  const searchParams = useSearchParams(); // Add this
  const urlSearch = searchParams.get('search') || '';
  // for the pagenation
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'available' | 'unavailable'>('all')
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set()) // Track deleting books
  const [editingBook, setEditingBook] = useState<Book | null>(null) // ✅ Track editing book
  // Combine books and filter out any that are being deleted
  const allBooks = [
    ...books.filter(book => !deletingIds.has(book._id)), 
    ...externalOptimisticBooks.filter(book => !deletingIds.has(book._id))
  ]

  const fetchBooks = async () => {
    try {
     const endpoint = urlSearch 
        ? `/api/admin/resources?search=${encodeURIComponent(urlSearch)}&page=${page}&limit=${limit}`
        : `/api/admin/resources?page=${page}&limit=${limit}`;
      const response = await fetch(endpoint);
      const data = await response.json()
      setBooks(data.books);  // <-- array for this page
      setTotal(data.total); 
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchBooks()
  }, [refetchTrigger , urlSearch, page])

   const handleEdit = (book: Book) => {
    setEditingBook(book) // Set the book to edit
  }

  // ✅ Handle when edit is completed
  const handleEditComplete = () => {
    setEditingBook(null) // Close edit modal
    fetchBooks() // Refresh the book list
  }

  // ✅ Handle when edit is cancelled
  const handleEditCancel = () => {
    setEditingBook(null) // Close edit modal
  }

  const handleDelete = async (id: string) => {
    // Optimistically remove the book immediately
    setDeletingIds(prev => new Set(prev).add(id))
    
    try {
      const res = await fetch('/api/admin/resources', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ id }),
      })  
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete');
      }
      
      toast.success('Book deleted successfully');
      // Refresh the list to get the updated data from server
      await fetchBooks();
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (err) {
      // If there's an error, add the book back
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      toast.error("Couldn't delete the Book")
    }
  }
const totalPages = Math.ceil(total / limit);
const maxVisiblePages = 5;

const getVisiblePages = () => {
  let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let end = Math.min(totalPages, start + maxVisiblePages - 1);
  
  // Adjust start if we're near the end
  start = Math.max(1, end - maxVisiblePages + 1);
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
  // Filter books based on search and filter
  const filteredBooks = allBooks.filter(book => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'free' ? book.packageType === 'free' :
      filter === 'premium' ? book.packageType === 'premium' :
      filter === 'available' ? (book.availableCopies ?? 0)> 0 :
      filter === 'unavailable' ? book.availableCopies === 0 : true
    
    return matchesFilter
  })

  if (loading) {
    return <BooksSkeleton count={8} />
  }

  return (
    <div className="p-6 space-y-6">
       {urlSearch && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Search results for: &apos; {urlSearch} &apos;
          </h2>
          <button
            onClick={() => window.location.href = '/admin/library'} // Clear search
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}
       {editingBook && (
        <EditBookCard 
          book={editingBook}
          onSuccess={handleEditComplete}
          onCancel={handleEditCancel}
        />
      )}
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-between">
        {/* <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div> */}
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Books</option>
            <option value="free">Free Books</option>
            <option value="premium">Premium Books</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{allBooks.length}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Books</div>
        </div>
        <div className="bg-white dark:bg-purple-900/20 p-4 rounded-lg border dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {allBooks.filter(b => b.packageType === 'premium').length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Premium Books</div>
        </div>
        <div className="bg-white dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {allBooks.filter(b => ( b.availableCopies ?? 0 )> 0).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Available</div>
        </div>
        <div className="bg-white dark:bg-red-900/20 p-4 rounded-lg border dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {allBooks.filter(b => b.availableCopies === 0).length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Unavailable</div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Showing {filteredBooks.length} of {allBooks.length} books
          {externalOptimisticBooks.length > 0 && (
            <span className="text-sm text-blue-500 ml-2">
              ({externalOptimisticBooks.length} updating...)
            </span>
          )}
          {deletingIds.size > 0 && (
            <span className="text-sm text-orange-500 ml-2">
              ({deletingIds.size} deleting...)
            </span>
          )}
        </h2>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBooks.map(book => (
           <AdminBookCard
            key={book._id}
            _id={book._id}
            title={book.title}
            author={book.author}
            imageUrl={book.imageUrl}
            packageType={book.packageType}
            availableCopies={book.availableCopies}
            totalCopies={book.totalCopies}
            createdAt={book.createdAt}
            isOptimistic={book._id.startsWith('temp-') || book.isOptimistic || deletingIds.has(book._id)}
            onEdit={() => handleEdit(book)}
            onDelete={() => handleDelete(book._id)}
          />
        ))}
      </div>
     <div className="flex justify-center items-center gap-2 mt-6">
  <button
    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
    disabled={page === 1}
    className={`px-3 py-1 border rounded flex items-center gap-1 ${
      page === 1 
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
    }`}
  >
    <ChevronLeft/>
  </button>

  {/* Show first page + ellipsis if needed */}
  {getVisiblePages()[0] > 1 && (
    <>
      <button
        onClick={() => setPage(1)}
        className="px-3 py-1 border rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        1
      </button>
      {getVisiblePages()[0] > 2 && <span className="px-2">...</span>}
    </>
  )}

  {/* Visible page numbers */}
  {getVisiblePages().map(num => (
    <button
      key={num}
      onClick={() => setPage(num)}
      className={`px-3 py-1 border rounded ${
        page === num 
          ? 'bg-blue-600 text-white border-blue-600' 
          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
      }`}
    >
      {num}
    </button>
  ))}

  {/* Show last page + ellipsis if needed */}
  {getVisiblePages()[getVisiblePages().length - 1] < totalPages && (
    <>
      {getVisiblePages()[getVisiblePages().length - 1] < totalPages - 1 && (
        <span className="px-2">...</span>
      )}
      <button
        onClick={() => setPage(totalPages)}
        className="px-3 py-1 border rounded bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        {totalPages}
      </button>
    </>
  )}

  <button
    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
    disabled={page === totalPages}
    className={`px-3 py-1 border rounded flex items-center gap-1 ${
      page === totalPages
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
    }`}
  >
    <ChevronRight/>
  </button>
</div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books found</h3>
        </div>
      )}
    </div>
  )
}

export default AdminResources