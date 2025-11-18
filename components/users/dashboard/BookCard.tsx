import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'

interface BookCardProps {
  title: string
  author: string
  imageUrl: string
  daysAvailable?: number
  daysRemaining?: number
  overdueDays?: number
  isOverdue?: boolean
  borrowFee?: number
  packageType?: string
  ctaLabel: string
  onClick?: () => void
}

export const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  imageUrl,
  isOverdue,
  overdueDays,
  ctaLabel,
  onClick,
  packageType,
  daysAvailable,
  daysRemaining,
}) => {
  return (
    <div
      className={`w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden transition-all flex flex-col ${
        isOverdue ? 'bg-red-50 border border-red-200' : 'hover:shadow-lg'
      }`}
    >
      {/* Book Image */}
      <div className="relative h-40">
        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="100%" />
      </div>

      {/* Book Details */}
      <div className="p-4 flex flex-col flex-1 relative gap-2">
        {/* Optional Premium Badge */}
        {packageType === 'premium' && (
          <div className="absolute top-2 right-2 bg-yellow-100 rounded-full p-1 shadow-sm">
            <Crown className="h-4 w-4 text-yellow-500" />
          </div>
        )}

        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">by {author}</p>

        {/* Status Info */}
        {isOverdue && overdueDays !== undefined ? (
          <p className="text-sm font-medium text-red-600">
            Overdue by {overdueDays} {overdueDays > 1 ? 'days' : 'day'}
          </p>
        ) : daysAvailable ? (
          <p className="text-sm text-gray-500">{daysAvailable} days available</p>
        ) : (
          <p className="text-sm text-gray-500">{daysRemaining} days remaining</p>
        )}

        {/* CTA */}
        <Button className="w-full mt-auto" onClick={onClick}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
