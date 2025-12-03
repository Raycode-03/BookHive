"use client"
import React from 'react'
import { BookCard } from './BookCard'
import { BooksSkeleton } from '@/components/users/skeleton'
import { useQuery , useMutation , useQueryClient} from '@tanstack/react-query'
import { ReservationWithBook } from '@/types/BookCard'
import { CalendarMinus} from 'lucide-react'
import { toast } from 'sonner';
const Reservations: React.FC = () => {
   const queryClient = useQueryClient()
    // Fetch reservations ONLY when this component renders
    const { 
        data: reservations, 
        isLoading, 
        error 
    } = useQuery<ReservationWithBook[]>({
        queryKey: ['reservations'],
        queryFn: async () => {
            const response = await fetch('/api/users/dashboard/reserves')
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch reservations')
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch reservations')
            }
            
            return data.activeReserves
        }
    })
// Mutation for cancelling reservations
    const cancelMutation = useMutation({
        mutationFn: async ({ reservationId, bookId }: { reservationId: string, bookId: string }) => {
            const response = await fetch('/api/users/reserve/cancel-reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationId, bookId })
            })
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel reservation')
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to cancel reservation')
            }
            
            return data
        },
        onSuccess: () => {
            // Invalidate and refetch both queries
            queryClient.invalidateQueries({ queryKey: ['reservations'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats-count'] })
            toast.success('Reservation cancelled successfully!')
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

    if (!reservations || reservations.length === 0) {
        return (
            <div className="text-center py-8">
                            <div className="flex justify-center mb-2">
                <CalendarMinus size={30} />
            </div>
                <p className="text-gray-500">No active reservations</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {reservations.map(reservation => {
                if (!reservation.book) return null;
                 const returnDate = reservation.returnDate 
                    ? new Date(reservation.returnDate)
                    : null;
                const today = new Date();
                 let daysRemaining = 0;
                if(returnDate){
                    daysRemaining = Math.ceil(
                        (returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    );
                }
                
                
                return (
                    <BookCard
                        key={reservation._id}
                        _id={reservation.book._id}
                        title={reservation.book.title}
                        author={reservation.book.author}
                        imageUrl={reservation.book.imageUrl}
                        packageType={reservation.book.packageType}
                        daysRemaining={daysRemaining}
                        ctaLabel="Cancel Reservation"
                         onClick={() => {
                            if (cancelMutation.isPending) return;
                            cancelMutation.mutate({ 
                                reservationId: reservation._id, 
                                bookId: reservation.book._id 
                            })
                        }}
                    />
                );
            })}
        </div>
    )
}

export default Reservations