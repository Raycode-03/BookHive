export interface Book {
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
  isOptimistic?: boolean
}
