export interface Book {
  _id: string
  title: string
  author: string
  imageUrl: string
  description?: string
  category?: string
  packageType: string
  isbn?: string
  isOptimistic?: boolean
   totalCopies?: number;
  availableCopies?: number;
  createdAt?: string;
  isOverdue?: boolean;
  overdueDays?: number;
  isBorrowedByUser?:boolean;
  isReservedByUser?:boolean;
}
export interface LoanWithBook {
  _id: string
  userId: string
  borrowDate: string
  returnDate: string
  status: "active" | "returned" | "overdue"
  createdAt: string

  // Nested book data from $lookup
  book: Book
}
export interface ReservationWithBook {
  _id: string
  userId: string
  reserveStartDate: string
  reserveEndDate: string
  status: "active" | "expired" | "cancelled"
  createdAt: string
  returnDate?: string
  // Nested book data from $lookup
  book: Book
}
