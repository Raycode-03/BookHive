import React from 'react'
import { BookCard } from './BookCard'

const Overdueloans: React.FC = () => {
  const overdueBooks = [
    {
      id: '2',
      title: 'Atomic Habits',
      author: 'James Clear',
      imageUrl: '/logos/cd.jpg',
      daysRemaining: -3,
      borrowFee: 0,
    },
    // more...
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {overdueBooks.map(book => (
        <BookCard
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl}
          isOverdue={true}
          overdueDays={Math.abs(book.daysRemaining ?? 0)}
          ctaLabel="Return"
          onClick={() => console.log('Return', book.id)}
        />
      ))}
    </div>
  )
}

export default Overdueloans
