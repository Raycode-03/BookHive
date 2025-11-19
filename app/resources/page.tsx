// components/UserResources.tsx
"use client"
import React, { useState, useEffect } from 'react'
import { BookCardWithAction } from '@/components/users/dashboard/BookCardWithAction'

interface Book {
  id: string
  title: string
  author: string
  imageUrl: string
  description?: string
  category?: string
  packageType: string
  availableCopies: number
}

const UserResources: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/resources') // PUBLIC API
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
        <BookCardWithAction
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl}
          packageType={book.packageType}
          ctaLabel={book.availableCopies > 0 ? "Borrow" : "Unavailable"}
          disabled={book.availableCopies === 0}
          onClick={() => book.availableCopies > 0 && console.log('Borrow', book.id)}
        />
      ))}
    </div>
  )
}

export default UserResources