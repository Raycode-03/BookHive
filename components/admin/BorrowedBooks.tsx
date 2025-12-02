"use client"
import React, {useState, useEffect} from 'react'
import { Calendar, BookOpen, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { BorrowType } from '@/types/Admin'

function BorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBorrowedBooks()
  }, [])

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/borrows')
      const data = await response.json()
      setBorrowedBooks(data)
    } catch (error) {
      console.error('Failed to fetch borrowed books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForceReturn = async (borrowId: string) => {
    
    try {
      await fetch(`/api/admin/borrows/${borrowId}/force-return`, {
        method: 'POST'
      })
      fetchBorrowedBooks()
    } catch (error) {
      console.error('Failed to force return:', error)
    }
  }

  const handleExtendDueDate = async (borrowId: string) => {
    const daystoadd =  7
    try {
      await fetch(`/api/admin/borrows/${borrowId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daystoadd })
      })
      fetchBorrowedBooks()
    } catch (error) {
      console.error('Failed to extend due date:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading borrowed books...</p>
      </div>
    )
  }

  const activeBooks = borrowedBooks.filter(book => book.status === 'active')
  const dueToday = activeBooks.filter(book => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const returnDate = new Date(book.returnDate)
    return returnDate >= today && returnDate < tomorrow
  }).length
  const overdue = activeBooks.filter(book => {
    const returnDate = new Date(book.returnDate)
    const today = new Date()
    return returnDate < today
  }).length

  return (
    <div className="space-y-3">
      {/* Stats - Always 3 in a row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Active Loans</p>
              <p className="text-base font-bold">{activeBooks.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Due Today</p>
              <p className="text-base font-bold">{dueToday}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Overdue</p>
              <p className="text-base font-bold">{overdue}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Books Grid - FIXED: Proper grid layout */}
      {activeBooks.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-gray-500 text-sm">No active borrowed books</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {activeBooks.map(book => {
            const returnDate = new Date(book.returnDate)
            const today = new Date()
            const isOverdue = returnDate < today
            const daysOverdue = isOverdue ? 
              Math.ceil((today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

            return (
              <Card key={book._id} className={`border hover:shadow-sm transition-shadow h-full flex flex-col ${
                isOverdue ? 'border-red-200' : ''
              }`}>
                <CardContent className="p-3 flex-1 flex flex-col">
                  {/* Header with book info */}
                  <div className="mb-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-3 w-3 text-blue-600" />
                        </div>
                        <p className="font-bold text-sm truncate max-w-[140px]">
                          {book.book?.title || 'Unknown Book'}
                        </p>
                      </div>
                      {isOverdue ? (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                          {daysOverdue}d overdue
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs px-1.5 py-0.5">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      Author: {book.book?.author || 'Unknown'}
                    </p>
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{book.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500 truncate">
                        Borrowed: {format(new Date(book.borrowDate), 'MMM dd')}
                      </p>
                    </div>
                  </div>

                  {/* Due date section */}
                  <div className={`p-2 rounded mb-2 `}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                        <div>
                          <p className="text-xs font-medium">Due Date</p>
                          <p className="text-xs">{format(returnDate, 'MMM dd, yyyy')}</p>
                        </div>
                      </div>
                      {isOverdue && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Buttons - Stacked */}
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExtendDueDate(book._id)}
                      className="h-7 text-xs w-full cursor-pointer"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Extend 7 Days
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleForceReturn(book._id)}
                      className="h-7 text-xs w-full cursor-pointer"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mark Returned
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BorrowedBooks