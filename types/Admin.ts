// types/admin.ts
export interface ReservationType {
  _id: string
  userId: string
  bookId: string
  reserveStartDate: string
  returnDate: string
  status: 'active' | 'cancelled' | 'processed'
  createdAt: string
  book?: {
    _id: string
    title: string
    author: string
  }
  user?: {
    _id: string
    name: string
    email: string
  }
}

export interface BorrowType {
  _id: string
  userId: string
  bookId: string
  borrowDate: string
  returnDate: string
  status: 'active' | 'returned' | 'overdue'
  createdAt: string
  book?: {
    _id: string
    title: string
    author: string
  }
  user?: {
    _id: string
    name: string
    email: string
  }
}

export interface FineType {
  _id: string
  userId: string
  loanId: string
  bookId: string
  overdueDays: number
  fineAmount: number
  status: 'unpaid' | 'paid' | 'waived'
  createdAt: string
  bookTitle?: string
  user?: {
    _id: string
    name: string
    email: string
  }
}
export interface UserType {
  _id: string
  name: string
  email: string
  image?: string
  isAdmin: boolean
  packageType: string
  createdAt: string
  isSuspended?: boolean
}