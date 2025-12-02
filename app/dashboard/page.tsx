"use client"
import React, { useState } from 'react'
import { BookOpen, Clock, CalendarCheck } from 'lucide-react'
import Overdueloans from '@/users/dashboard/Overdueloans'
import Resources from '@/users/dashboard/Resources'
import Reservations from '@/users/dashboard/Reservations'
import { CardSkeleton } from '@/components/users/skeleton'
import { useQuery } from '@tanstack/react-query'

interface DashboardStatsCount {
    ActiveLoansCount: number;
    ActiveReservesCount: number;
    OverdueLoansCount: number;
}

const DashboardPage = () => {
    const [activeSection, setActiveSection] = useState<'resources' | 'overdue' | 'reservations'>('resources')
    
    // Fetch only COUNTS on initial load
    const { 
        data: stats, 
        isLoading, 
        error, 
        refetch 
    } = useQuery<DashboardStatsCount>({
        queryKey: ['dashboard-stats-count'],
        queryFn: async () => {
            const response = await fetch('/api/users/dashboard/stats')
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch dashboard stats')
            }
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch dashboard stats')
            }
            
            return data.data
        }
    })

    const cards = [
        {
            title: 'Library Resources',
            description: isLoading ? 'Loading...' : `${stats?.ActiveLoansCount || 0} Active Loans`,
            icon: <BookOpen className="w-8 h-8 text-blue-600 mx-auto" />,
            key: 'resources' as const,
        },
        {
            title: 'Overdue Loans',
            description: isLoading ? 'Loading...' : `${stats?.OverdueLoansCount || 0} Books Overdue`,
            icon: <Clock className="w-8 h-8 text-red-600 mx-auto" />,
            key: 'overdue' as const,
        },
        {
            title: 'Reservations',
            description: isLoading ? 'Loading...' : `${stats?.ActiveReservesCount || 0} Active Reservations`,
            icon: <CalendarCheck className="w-8 h-8 text-green-600 mx-auto" />,
            key: 'reservations' as const,
        },
    ]

    if (isLoading) {
        return (
            <div className="mx-auto p-6 space-y-6"> 
                <CardSkeleton count={3}/>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mx-auto p-6 space-y-6">
                <div className="text-center py-10">
                    <div className="text-red-600 text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600">Error Loading Dashboard</h3>
                    <p className="mt-2 text-gray-600">{(error as Error).message}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mx-auto p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                    {cards.map(card => (
                        <div
                            key={card.key}
                            className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition text-center ${
                                activeSection === card.key ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setActiveSection(card.key)}
                        >
                            <div className="flex justify-center">{card.icon}</div>
                            <h3 className="text-[11px] sm:text-lg font-semibold mt-2">{card.title}</h3>
                            <p className="mt-1 text-gray-500 text-[9px] sm:text-xs">{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className=" p-6 shadow dark:bg-gray-900">
                {activeSection === 'resources' && (
                    <SectionTemplate title="Your Active Loans">
                        <Resources />
                    </SectionTemplate>
                )}
                {activeSection === 'overdue' && (
                    <SectionTemplate title="Your Overdue Loans">
                        <Overdueloans />
                    </SectionTemplate>
                )}
                {activeSection === 'reservations' && (
                    <SectionTemplate title="Your Reservations">
                        <Reservations />
                    </SectionTemplate>
                )}
            </div>
        </>
    )
}

type SectionTemplateProps = {
    title: string
    children: React.ReactNode
}

const SectionTemplate: React.FC<SectionTemplateProps> = ({ title, children }) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
        <div className="gap-4">
            {children}
        </div>
    </div>
)

export default DashboardPage