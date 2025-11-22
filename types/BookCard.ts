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
}
