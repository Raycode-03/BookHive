"use client"
import React, { useState, useEffect } from 'react'
import { Users, BookOpen, Clock, CalendarCheck } from 'lucide-react'
import UserManagement from '@/components/admin/UserManagement'
import BorrowedBooks from '@/components/admin/BorrowedBooks'
import OverdueReturns from '@/components/admin/OverdueReturns'
import Reservations from '@/components/admin/Reservations'
import { UsersBoxSkeleton } from '@/components/users/skeleton'

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<'users' | 'borrowed' | 'overdue' | 'reservations'>('users')
  const [stats, setStats] = useState({
    users: { total: 0, newToday: 0, premium: 0, admin: 0 },
    borrowed: { total: 0, dueToday: 0 },
    overdue: { total: 0, totalFines: 0 },
    reservations: { total: 0, highPriority: 0 }
  })
  const [loading, setLoading] = useState(true)

  // Fetch all dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'User Management',
      description: 'Manage all library users',
      icon: <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />,
      key: 'users' as const,
      count: `${stats.users.total} Users`,
      alert: `${stats.users.newToday} New Today`
    },
    {
      title: 'Borrowed Books',
      description: 'Currently issued books',
      icon: <BookOpen className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />,
      key: 'borrowed' as const,
      count: `${stats.borrowed.total} Active`,
      alert: `${stats.borrowed.dueToday} Due Today`
    },
    {
      title: 'Overdue & Fines',
      description: 'Pending returns & payments',
      icon: <Clock className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />,
      key: 'overdue' as const,
      count: `${stats.overdue.total} Overdue`,
      alert: `$${stats.overdue.totalFines} in Fines`
    },
    {
      title: 'Book Reservations',
      description: 'Pending book reservations',
      icon: <CalendarCheck className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto" />,
      key: 'reservations' as const,
      count: `${stats.reservations.total} Reservations`,
      alert: `${stats.reservations.highPriority} High Priority`
    }
  ]

  if (loading) {
    return <UsersBoxSkeleton count={4} />
  }

  return (
    <div className="mx-auto p-6 space-y-6  w-full max-w-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage library operations and users</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {cards.map(card => (
          <div
            key={card.key}
            className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow cursor-pointer border border-gray-200 dark:border-gray-700 hover:shadow-lg transition ${
              activeSection === card.key 
                ? 'ring-4 ring-blue-400 dark:ring-blue-500' 
                : ''
            }`}
            onClick={() => setActiveSection(card.key)}
          >
            {card.icon}
           <h3 className="text-sm sm:text-base md:text-[17px] lg:text-lg font-semibold mt-2 text-gray-900 dark:text-white line-clamp-1">{card.title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{card.description}</p>
          <div className="mt-3 text-xs sm:text-sm flex justify-between items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-gray-200 truncate flex-1">{card.count}</span>
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs whitespace-nowrap shrink-0">
              {card.alert}
            </span>
          </div>
          </div>
        ))}
      </div>

      {/* Dynamic Content Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        {activeSection === 'users' && (
          <SectionTemplate title="User Management">
            <UserManagement />
          </SectionTemplate>
        )}
        {activeSection === 'borrowed' && (
          <SectionTemplate title="Currently Borrowed Books">
            <BorrowedBooks />
          </SectionTemplate>
        )}
        {activeSection === 'overdue' && (
          <SectionTemplate title="Overdue Returns & Fines">
            <OverdueReturns />
          </SectionTemplate>
        )}
        {activeSection === 'reservations' && (
          <SectionTemplate title="Book Reservations">
            <Reservations />
          </SectionTemplate>
        )}
      </div>
    </div>
  )
}

type SectionTemplateProps = {
  title: string
  children: React.ReactNode
}

const SectionTemplate: React.FC<SectionTemplateProps> = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold border-b pb-2 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
      {title}
    </h2>
    <div>
      {children}
    </div>
  </div>
)

export default AdminDashboard