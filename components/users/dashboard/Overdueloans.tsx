"use client"
import React from 'react'
import { BookCard } from './BookCard'
import { BooksSkeleton } from '@/components/users/skeleton'
import { useQuery , useMutation , useQueryClient} from '@tanstack/react-query'
import { LoanWithBook } from '@/types/BookCard'
import {CalendarX} from 'lucide-react'
import { toast } from 'sonner';
const Overdueloans: React.FC = () => {
     const queryClient = useQueryClient();
    // Fetch overdue loans ONLY when this component renders
    const { 
        data: overdueLoans, 
        isLoading, 
        error 
    } = useQuery<LoanWithBook[]>({
        queryKey: ['overdue-loans'],
        queryFn: async () => {
            const response = await fetch('/api/users/dashboard/overdues')
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch overdue loans')
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch overdue loans')
            }
            
            return data.overdueLoans
        }
    })
     // Mutation for returning books
    const returnMutation = useMutation({
        mutationFn: async ({ loanId, bookId }: { loanId: string, bookId: string }) => {
            const response = await fetch('/api/users/borrow/return', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loanId, bookId })
            })
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to return book')
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to return book')
            }
            
            return data
        },
        onSuccess: () => {
            // Invalidate and refetch both queries
            queryClient.invalidateQueries({ queryKey: ['active-loans'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats-count'] })
            toast.success('Book returned successfully!')
        },
        onError: (error: Error) => {
            toast.error(`Error: ${error.message}`)
        }
    })
    if (isLoading) {
        return <BooksSkeleton count={5} />
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error: {(error as Error).message}</p>
            </div>
        )
    }

    if (!overdueLoans || overdueLoans.length === 0) {
        return (
          <div className="text-center py-8">
            <div className="flex justify-center mb-2">
                <CalendarX size={30} />
            </div>
            <p className="text-gray-500">No overdue loans found</p>
        </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {overdueLoans.map(loan => {
                if (!loan.book) return null;
                
                const returnDate = new Date(loan.returnDate);
                const today = new Date();
                const overdueDays = Math.ceil(
                    (today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                    <BookCard
                        key={loan._id}
                        _id={loan.book._id}
                        title={loan.book.title}
                        author={loan.book.author}
                        imageUrl={loan.book.imageUrl}
                        packageType={loan.book.packageType}
                        isOverdue={true}
                        overdueDays={overdueDays}
                        ctaLabel="Return Now"
                        onClick={() => {
                          if (returnMutation.isPending) return;
                            returnMutation.mutate({ 
                                loanId: loan._id, 
                                bookId: loan.book._id 
                            })
                        }}
                    />
                );
            })}
        </div>
    )
}

export default Overdueloans