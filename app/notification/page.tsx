"use client"
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Calendar, BookOpen, AlertCircle, CheckCircle, XCircle, Clock, Check, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  _id: string
  userId: string
  type: 'reservation_to_borrow' | 'overdue_fine' | 'system' | 'reminder' | 'return_reminder' | 'overdue'
  title: string
  message: string
  bookId?: string
  borrowId?: string
  fineAmount?: number
  overdueDays?: number
  read: boolean
  createdAt: string
}

const NotificationPage = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'unread' | 'fines'>('all')

  // Fetch notifications
  const { 
    data: notifications, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/users/notifications')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch notifications')
      }
      
      return data.data
    }
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/users/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as read')
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to mark as read')
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification marked as read')
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`)
    }
  })

  // Mark all as read
  const markAllAsRead = () => {
    const unreadNotifications = notifications?.filter(n => !n.read) || []
    unreadNotifications.forEach(notification => {
      markAsReadMutation.mutate(notification._id)
    })
  }

  // Filter notifications
  const filteredNotifications = notifications?.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'fines') return notification.type === 'overdue_fine'
    return true
  }) || []

  // Unread count
  const unreadCount = notifications?.filter(n => !n.read).length || 0

  // Get icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation_to_borrow':
        return <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
      case 'overdue_fine':
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
      case 'return_reminder':
      case 'reminder':
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
    }
  }

  // Get badge color based on type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'reservation_to_borrow':
        return 'bg-blue-100 text-blue-800'
      case 'overdue_fine':
        return 'bg-red-100 text-red-800'
      case 'reminder':
      case 'return_reminder':
        return 'bg-amber-100 text-amber-800'
      case 'overdue':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format type for display
  const formatType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 sm:h-28 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-8 sm:py-10">
          <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-red-600 mb-2">Error Loading Notifications</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">{(error as Error).message}</p>
          <Button onClick={() => refetch()} size="sm" className="text-sm">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 sm:h-8 sm:w-8" />
            Notifications
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || markAsReadMutation.isPending}
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            {markAsReadMutation.isPending ? 'Processing...' : 'Mark All Read'}
          </Button>
          <Button 
            onClick={() => refetch()} 
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm dark:text-gray-100"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
          className="whitespace-nowrap text-xs sm:text-sm"
        >
          All ({notifications?.length || 0})
        </Button>
        <Button 
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          size="sm"
          className="whitespace-nowrap text-xs sm:text-sm"
        >
          Unread ({unreadCount})
        </Button>
        <Button 
          variant={filter === 'fines' ? 'default' : 'outline'}
          onClick={() => setFilter('fines')}
          size="sm"
          className="whitespace-nowrap text-xs sm:text-sm"
        >
          Fines ({notifications?.filter(n => n.type === 'overdue_fine').length || 0})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <CardContent className="px-4 sm:px-6">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {filter === 'unread' 
                  ? 'You have no unread notifications' 
                  : filter === 'fines'
                  ? 'You have no fines'
                  : 'You have no notifications'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(notification => (
            <Card 
              key={notification._id} 
              className={`transition-all hover:shadow-md ${notification.read ? 'opacity-80' : 'border-l-4 border-l-blue-500'}`}
            >
              <CardHeader className="pb-2 px-4 sm:px-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-lg truncate">
                        {notification.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getBadgeColor(notification.type)} text-xs`}>
                          {formatType(notification.type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(notification.createdAt), 'PP')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile dropdown menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.read && (
                        <DropdownMenuItem 
                          onClick={() => markAsReadMutation.mutate(notification._id)}
                          disabled={markAsReadMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => refetch()}>
                        Refresh
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pt-0">
                <p className="text-gray-700 text-sm sm:text-base mb-3">
                  {notification.message}
                </p>
                
                {/* Fine details */}
                {notification.type === 'overdue_fine' && notification.fineAmount && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400 text-sm sm:text-base">
                          Fine Amount: ₦{notification.fineAmount}
                        </p>
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-300">
                          Overdue by: {notification.overdueDays} day{notification.overdueDays !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {/* <Button variant="destructive" size="sm" className="mt-2 sm:mt-0 text-xs sm:text-sm">
                        Pay Fine
                      </Button> */}
                    </div>
                  </div>
                )}

                {/* Desktop mark as read button */}
                <div className="hidden sm:block mt-3">
                  {!notification.read && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(notification._id)}
                      disabled={markAsReadMutation.isPending}
                      className="w-full"
                    >
                      {markAsReadMutation.isPending ? 'Processing...' : 'Mark as read'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationPage