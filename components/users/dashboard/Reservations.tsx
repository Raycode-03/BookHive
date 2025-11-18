import React from 'react'
import { BookCard } from './BookCard'

const Reservations: React.FC = () => {
  const reservedBooks = [
    {
      id: '3',
      title: 'The Lean Startup',
      author: 'Eric Ries',
      imageUrl: '/logos/cd.jpg',
      daysRemaining: 5,
      borrowFee: 0,
    },
    // more...
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {reservedBooks.map(book => (
        <BookCard
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl}
          daysRemaining={book.daysRemaining}
          ctaLabel="Cancel Reservation"
          onClick={() => console.log('Cancel', book.id)}
        />
      ))}
    </div>
  )
}

export default Reservations
