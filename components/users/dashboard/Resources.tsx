"use client"
import React, { useState, useEffect } from 'react'
import { BookCard } from './BookCard'
import { Book } from '@/types/BookCard'
import { BooksSkeleton } from '@/components/users/skeleton';
const Resources: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)


  if (loading) {
    return <BooksSkeleton count={8} />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map(book => (
        <BookCard
          key={book._id}
          _id={book._id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl}
          packageType={book.packageType}
          ctaLabel="Borrow"
          onClick={() => console.log('Borrow', book._id)}
        />
      ))}
    </div>
  )
}

export default Resources