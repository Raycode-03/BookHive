"use client"
import React, {useState, useEffect} from 'react'
import { Calendar, BookOpen, User, X, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, isValid } from 'date-fns'
import { ReservationType } from '@/types/Admin'

function Reservations() {
  const [reserves, setReserves] = useState<ReservationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reserves')
      const data = await response.json()
      setReserves(data)
    } catch (error) {
      console.error('Failed to fetch reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    
    try {
      await fetch(`/api/admin/reserves/${reservationId}`, {
        method: 'DELETE'
      })
      fetchReservations()
    } catch (error) {
      console.error('Failed to cancel reservation:', error)
    }
  }

  const handleExtendReservation = async (reservationId: string) => {
    
    const daystoadd = 3; // Extend by 3 days
    
    try {
      await fetch(`/api/admin/reserves/${reservationId}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daystoadd })
      })
      fetchReservations()
    } catch (error) {
      console.error('Failed to extend reservation:', error)
    }
  }

  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return isValid(date) ? format(date, 'MMM dd') : 'Invalid date'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading reservations...</p>
      </div>
    )
  }

  const activeReservations = reserves.filter(r => r.status === 'active')
  const startingSoon = activeReservations.filter(r => {
    if (!r.reserveStartDate) return false
    const startDate = new Date(r.reserveStartDate)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    return isValid(startDate) && startDate <= threeDaysFromNow
  }).length

  return (
    <div className="space-y-3">
      {/* Stats - Always 3 in a row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-base font-bold">{reserves.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Active</p>
              <p className="text-base font-bold">{activeReservations.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Starting Soon</p>
              <p className="text-base font-bold">{startingSoon}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Grid */}
      {reserves.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-gray-500 text-sm">No reservations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {reserves.map(reserve => (
            <Card key={reserve._id} className="border hover:shadow-sm transition-shadow h-full flex flex-col">
              <CardContent className="p-3 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="font-bold text-sm truncate max-w-[140px]">
                        {reserve.book?.title || 'Unknown Book'}
                      </p>
                    </div>
                    <Badge variant={
                      reserve.status === 'active' ? 'default' : 
                      reserve.status === 'cancelled' ? 'destructive' : 'secondary'
                    } className="text-xs px-1.5 py-0.5">
                      {reserve.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    Author: {reserve.book?.author || 'Unknown'}
                  </p>
                </div>

                {/* User info */}
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{reserve.user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 truncate">{reserve.user?.email}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="p-2 rounded bg-gray-50">
                    <p className="text-xs font-medium text-gray-600">Start</p>
                    <p className="text-xs">{safeFormatDate(reserve.reserveStartDate)}</p>
                  </div>
                  <div className="p-2 rounded bg-gray-50">
                    <p className="text-xs font-medium text-gray-600">Return</p>
                    <p className="text-xs">{safeFormatDate(reserve.returnDate)}</p>
                  </div>
                </div>

                {/* Buttons - Stacked (only for active) */}
                {reserve.status === 'active' && (
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExtendReservation(reserve._id)}
                      className="h-7 text-xs w-full cursor-pointer"
                    >
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Extend 3 Days
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleCancelReservation(reserve._id)}
                      className="h-7 text-xs w-full cursor-pointer"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reservations