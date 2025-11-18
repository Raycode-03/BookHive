"use client"
import React, { useState } from 'react'
import { BookOpen, Clock, CalendarCheck } from 'lucide-react'
import Overdueloans from '@/users/dashboard/Overdueloans'
import Resources from '@/users/dashboard/Resources'
import Reservations from '@/users/dashboard/Reservations'

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState<'resources' | 'overdue' | 'reservations'>('resources')

  // Card data to simplify JSX
  const cards = [
    {
      title: 'Library Resources',
      description: '1200 Books Available',
      icon: <BookOpen className="w-8 h-8 text-blue-600 mx-auto" />,
      key: 'resources' as const,
    },
    {
      title: 'Overdue Loans',
      description: '5 Books Overdue',
      icon: <Clock className="w-8 h-8 text-red-600 mx-auto" />,
      key: 'overdue' as const,
    },
    {
      title: 'Reservations',
      description: '3 Active Reservations',
      icon: <CalendarCheck className="w-8 h-8 text-green-600 mx-auto" />,
      key: 'reservations' as const,
    },
  ]

  return (
    <>
    <div className="mx-auto p-6 space-y-6 ">

      {/* Top summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {cards.map(card => (
          <div
            key={card.key}
            className={`bg-white  dark:bg-gray-800 p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition text-center ${
              activeSection === card.key ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveSection(card.key)}
          >
            {card.icon}
            <h3 className="text-lg font-semibold mt-2">{card.title}</h3>
            <p className="mt-1 text-gray-500">{card.description}</p>
          </div>
        ))}
      </div>

   
    </div>
       {/* Dynamic content section */}
      <div className="bg-white p-6 shadow text-center  dark:bg-gray-900">
        {activeSection === 'resources' && (
          <SectionTemplate title="Library Resources">
            <Resources />
          </SectionTemplate>
        )}
        {activeSection === 'overdue' && (
          <SectionTemplate title="Overdue Loans">
            <Overdueloans />
          </SectionTemplate>
        )}
        {activeSection === 'reservations' && (
          <SectionTemplate title="Reservations">
            <Reservations />
          </SectionTemplate>
        )}
      </div>
      </>
  )
}

export default DashboardPage

// Section template for consistent design
type SectionTemplateProps = {
  title: string
  children: React.ReactNode
}

const SectionTemplate: React.FC<SectionTemplateProps> = ({ title, children }) => (
  <div className="space-y-4 ">
    <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
    <div className="gap-4 ">
      {children}
    </div>
  </div>
)
