// components/admin/AdminBookCard.tsx
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Crown, Edit, Trash2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface AdminBookCardProps {
  title: string
  author: string
  imageUrl: string
  packageType?: string
  availableCopies: number
  totalCopies: number
  onEdit: () => void
  onDelete: () => void
}

export const AdminBookCard: React.FC<AdminBookCardProps> = ({
  title,
  author,
  imageUrl,
  packageType,
  availableCopies,
  totalCopies,
  onEdit,
  onDelete,
}) => {
  const isMobile = useIsMobile()

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden transition-all flex flex-col hover:shadow-lg">
      
      {/* Book Image */}
      <div className="relative h-40 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* Stock Badge */}
        <div className="absolute top-2 left-2 bg-blue-100 dark:bg-blue-800 dark:text-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {availableCopies}/{totalCopies}
        </div>

        {/* Premium Badge */}
        {packageType === 'premium' && (
          <div className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-700 rounded-full p-1 shadow-sm">
            <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
          </div>
        )}
      </div>

      {/* Book Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm sm:text-lg line-clamp-2 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">by {author}</p>

        {/* Admin Actions */}
  <div className="flex flex-row gap-2 mt-auto">
  <Button
    variant="outline"
    size="sm"
    className="flex-1"
    onClick={onEdit}
  >
    <Edit className="h-4 w-4" />
  </Button>
  <Button
    variant="destructive"
    size="sm"
    className="flex-1"
    onClick={onDelete}
  >
    <Trash2 className="h-4 w-4" />
    
  </Button>
</div>


      </div>
    </div>
  )
}