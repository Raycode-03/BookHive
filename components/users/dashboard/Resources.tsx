"use client"
import React from 'react'
import { BookCard } from './BookCard'
import { BooksSkeleton } from '@/components/users/skeleton'
import { useQuery , useMutation , useQueryClient} from '@tanstack/react-query'
import { LoanWithBook } from '@/types/BookCard'
import { BookX } from 'lucide-react'
import { toast } from 'sonner';
const Resources: React.FC = () => {
    const queryClient = useQueryClient()
    // Fetch active loans ONLY when this component renders
    const { 
        data: activeLoans, 
        isLoading, 
        error 
    } = useQuery<LoanWithBook[]>({
        queryKey: ['active-loans'],
        queryFn: async () => {
            const response = await fetch('/api/users/dashboard/active-loans')
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch active loans')
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch active loans')
            }
            return data.activeLoansList
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

    if (!activeLoans || activeLoans.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="flex justify-center mb-2">
                  <BookX size={30} />
                </div>          
                <p className="text-gray-500">You don&apos;t have any books checked out</p>
            </div>
        )
    }
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeLoans.map(loan => {
                if (!loan.book) return null;
                
                const returnDate = new Date(loan.returnDate);
                const today = new Date();
                const daysRemaining = Math.ceil(
                    (returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysRemaining < 0;
                
                return (
                    <BookCard
                        key={loan._id}
                        _id={loan.book._id}
                        title={loan.book.title}
                        author={loan.book.author}
                        imageUrl={loan.book.imageUrl}
                        packageType={loan.book.packageType}
                        daysRemaining={!isOverdue ? daysRemaining : undefined}
                        ctaLabel={"Return Now" }
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

export default Resources