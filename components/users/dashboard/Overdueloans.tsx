import React , {useState} from 'react'
import { BookCard } from './BookCard'
import { Book } from '@/types/BookCard'
const Overdueloans: React.FC = () => {
 const [books, setBooks] = useState<Book[]>([])

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
          isOverdue={true}
          // overdueDays={Math.abs(book.daysRemaining ?? 0)}
          ctaLabel="Return"
          onClick={() => console.log('Return', book._id)}
        />
      ))}
    </div>
  )
}

export default Overdueloans
