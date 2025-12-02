"use client"
import React, {useState, useEffect} from 'react'
import { DollarSign, User, BookOpen, CheckCircle,  Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { FineType } from '@/types/Admin'

function OverdueReturns() {
  const [dues, setDues] = useState<FineType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverdues()
  }, [])

  const fetchOverdues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/fines')
      const data = await response.json()
      setDues(data)
    } catch (error) {
      console.error('Failed to fetch overdue fines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPaid = async (fineId: string) => {
    try {
      await fetch(`/api/admin/fines/${fineId}/mark-paid`, {
        method: 'POST'
      })
      fetchOverdues()
    } catch (error) {
      console.error('Failed to mark fine as paid:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600 text-sm">Loading fines...</p>
      </div>
    )
  }

  const unpaidFines = dues.filter(fine => fine.status === 'unpaid')
  const totalAmount = unpaidFines.reduce((sum, fine) => sum + fine.fineAmount, 0)

  return (
    <div className="space-y-3">
      {/* Stats Section - Always 3 in a row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Unpaid</p>
              <p className="text-base font-bold">{unpaidFines.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Total Due</p>
              <p className="text-base font-bold">₦{totalAmount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs text-gray-600 mb-1">Avg. Fine</p>
              <p className="text-base font-bold">
                ₦{unpaidFines.length > 0 ? 
                  Math.round(totalAmount / unpaidFines.length) 
                  : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fines Grid - Responsive columns */}
      {unpaidFines.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-gray-500 text-sm">No unpaid fines</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {unpaidFines.map(fine => (
            <Card key={fine._id} className="border hover:shadow-sm transition-shadow h-full flex flex-col">
              <CardContent className="p-3 flex-1 flex flex-col">
                {/* Header with amount and status */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                      <DollarSign className="h-3 w-3 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">₦{fine.fineAmount}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(fine.createdAt), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">Unpaid</Badge>
                </div>

                {/* Compact details */}
                <div className="space-y-1.5 mb-2 flex-1">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{fine.bookTitle || 'Unknown Book'}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{fine.overdueDays} day{fine.overdueDays !== 1 ? 's' : ''} overdue</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs truncate">{fine.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500 truncate">{fine.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Buttons - Stacked */}
                <div className="flex flex-col gap-1.5 mt-auto">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleMarkPaid(fine._id)}
                    className="h-7 text-xs w-full cursor-pointer"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Paid
                  </Button>
                
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default OverdueReturns