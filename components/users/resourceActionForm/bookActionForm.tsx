"use client"
import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"
import { useMutation, useQueryClient } from '@tanstack/react-query'
interface Book {
  _id: string
  title: string
}

interface BookActionFormProps {
  book: Book
  actionType: 'borrow' | 'reserve'
  onSuccess?: () => void
  onClose: () => void
}

// API functions
const borrowBook = async (bookData: {bookId: string; returnDate: string }) => {
  console.log("Rboorowign book with data:", bookData);
  const response = await fetch('/api/users/borrow', {
    method: 'POST',
    body: JSON.stringify(bookData),
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to borrow book')
  return response.json()
}

const reserveBook = async (bookData: { bookId: string; returnDate: string }) => {
  console.log("Reserving book with data:", bookData);
  const response = await fetch('/api/users/reserve', {
    method: 'POST',
    body: JSON.stringify(bookData),
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to reserve book')
  return response.json()
}

function BookActionForm({ book, actionType, onSuccess, onClose }: BookActionFormProps) {
  // const session = getUnifiedSession();
  const formRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  
  const [returnDate, setReturnDate] = useState('')

  // ✅ Fixed: Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (formRef.current && !formRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Check if date is valid
  const isDateValid = () => {
    if (!returnDate) return false;

    const selectedDate = new Date(returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    maxDate.setHours(23, 59, 59, 999);

    return selectedDate >= today && selectedDate <= maxDate;
  };

  // Choose the right mutation based on actionType
  const actionMutation = useMutation({
    mutationFn: actionType === 'borrow' ? borrowBook : reserveBook,
    onSuccess: () => {
      setReturnDate('')
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['user-borrows'] })
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] })
      onSuccess?.()
      onClose()
      toast.success(`Book ${actionType === 'borrow' ? 'borrowed' : 'reserved'} successfully!`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${actionType} book: ${error.message}`)
    }
  })

  // Get today's date in YYYY-MM-DD format
  const getToday = () => new Date().toISOString().split('T')[0]

  // Get max date (today + 14 days)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 14)
    return maxDate.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!returnDate) {
      toast.error('Please select a return date')
      return
    }

    if (!isDateValid()) {
      toast.error('Please select a valid return date')
      return
    }

     // ✅ FIXED: Send bookId (_id) instead of title
    actionMutation.mutate({  bookId: book._id ,  returnDate })
  }

  // Dynamic text based on actionType
  const titles = {
    borrow: {
      main: 'Borrow Book',
      button: 'Borrow Book',
      loading: 'Borrowing...',
      success: 'borrowed'
    },
    reserve: {
      main: 'Reserve Book',
      button: 'Reserve Book',
      loading: 'Reserving...',
      success: 'reserved'
    }
  }

  const currentTitle = titles[actionType]

  // ✅ Button is disabled when date is invalid or mutation is pending
  const isButtonDisabled = !isDateValid() || actionMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={formRef}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{currentTitle.main}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
              Book Title *
            </Label>
            <Input
              id="title"
              value={book.title}
              disabled
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="returnDate" className="text-sm font-medium mb-2 block">
              Return Date *
            </Label>
            <Input
              type="date"
              id="returnDate"
              value={returnDate}
              min={getToday()}
              max={getMaxDate()}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Select a date between today and {getMaxDate()} (max 14 days)
            </p>
            
            {/* ✅ Show validation message */}
            {returnDate && !isDateValid() && (
              <p className="text-xs text-red-500 mt-1">
                Please select a date within the next 14 days
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isButtonDisabled}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {actionMutation.isPending ? currentTitle.loading : currentTitle.button}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookActionForm