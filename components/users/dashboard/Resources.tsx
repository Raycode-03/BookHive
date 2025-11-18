"use client"
import React, { useState, useEffect } from 'react'
import { BookCard } from './BookCard'

interface Book {
  id: string
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

const Resources: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/resources')
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading resources...</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map(book => (
        <BookCard
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl}
          packageType={book.packageType}
          ctaLabel="Borrow"
          onClick={() => console.log('Borrow', book.id)}
        />
      ))}
    </div>
  )
}

export default Resources