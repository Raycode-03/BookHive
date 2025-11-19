"use client"
import React, { useState, useEffect } from 'react'
import { AdminBookCard } from '@/components/admin/AdminBookCard'
import { BooksSkeleton } from '@/components/users/skeleton'
import { Search, Filter, Crown, BookOpen } from 'lucide-react'

interface Book {
  _id: string
  title: string
  author: string
  imageUrl: string
  description?: string
  category?: string
  packageType: string
  totalCopies: number
  availableCopies: number
  isbn?: string
  createdAt: string
}

const AdminResources: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'available' | 'unavailable'>('all')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/admin/resources')
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter books based on search and filter
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'free' ? book.packageType === 'free' :
      filter === 'premium' ? book.packageType === 'premium' :
      filter === 'available' ? book.availableCopies > 0 :
      filter === 'unavailable' ? book.availableCopies === 0 : true
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return <BooksSkeleton count={8} />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-between ">
            <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg     focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg  focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{books.length}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Books</div>
        </div>
        <div className="bg-white dark:bg-purple-900/20 p-4 rounded-lg border dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {books.filter(b => b.packageType === 'premium').length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Premium Books</div>
        </div>
        <div className="bg-white dark:bg-green-900/20 p-4 rounded-lg border dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {books.filter(b => b.availableCopies > 0).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Available</div>
        </div>
        <div className="bg-white dark:bg-red-900/20 p-4 rounded-lg border dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {books.filter(b => b.availableCopies === 0).length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Unavailable</div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Showing {filteredBooks.length} of {books.length} books
        </h2>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBooks.map(book => (
          <AdminBookCard
            key={book._id}
            title={book.title}
            author={book.author}
            imageUrl={book.imageUrl}
            packageType={book.packageType}
            availableCopies={book.availableCopies}
            totalCopies={book.totalCopies}
            onEdit={() => console.log('Edit', book._id)}
            onDelete={() => console.log('Delete', book._id)}
          />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No books match the current filter'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminResources