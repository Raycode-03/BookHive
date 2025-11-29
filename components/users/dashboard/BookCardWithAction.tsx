// components/users/dashboard/BookCardWithAction.tsx
"use client"
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Book } from "@/types/BookCard";
import BookActionForm from "@/components/users/resourceActionForm/bookActionForm";
interface BookCardWithActionProps extends Pick<Book,'_id' | 'title' | 'author' | 'imageUrl' | 'packageType' | 'availableCopies'> {
  ctaLabel: string;
  onSuccess?: () => void;
  isBorrowedByUser?: boolean;
}

export const  BookCardWithAction: React.FC<BookCardWithActionProps> = ({
  _id,
  title,
  author,
  imageUrl,
  availableCopies,
  packageType,
  ctaLabel,
  onSuccess,
  isBorrowedByUser,
}) => {
  const [saved, setSaved] = useState(false);
  const [reserved, setReserved] = useState(false);
   const [showForm, setShowForm] = useState(false);
  const [currentAction, setCurrentAction] = useState<'borrow' | 'reserve'>('borrow');

  const getBorrowButtonState = () => {
    if (isBorrowedByUser) {
      return { text: "Borrowed", disabled: true };
    }
    if (availableCopies === 0) {
      return { text: "Unavailable", disabled: true };
    }
    return { text: ctaLabel, disabled: false };
  };
    const borrowButtonState = getBorrowButtonState();
   const handleBorrow = () => {
    if (isBorrowedByUser || borrowButtonState.disabled) return;
    setCurrentAction('borrow');
    setShowForm(true);
  };

  const handleReserve = () => {
    if (reserved || availableCopies === 0 || isBorrowedByUser) return;
    setCurrentAction('reserve');
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    // Update local state based on the action
    if (currentAction === 'borrow') {
      setSaved(true);
    } else {
      setReserved(true);
    }
    
    setShowForm(false);
    onSuccess?.(); // Call parent's success callback if provided
  };

  const handleFormClose = () => {
    setShowForm(false);
  };
    // Book data to pass to the form
  const bookData = {
    _id,
    title,
    author,
    imageUrl,
    packageType,
    availableCopies
  };
  return (
    <div className="w-full bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-2xl overflow-hidden transition-all flex flex-col hover:shadow-lg">
      <div className="relative h-40">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover" 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" 
        />
        {packageType === 'premium' && (
          <div className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-700 rounded-full p-1 shadow-sm">
            <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 relative gap-2">
        <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">by {author}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {availableCopies} {availableCopies === 1 ? 'copy' : 'copies'} available
        </p>

        <div className="flex gap-2 mt-auto">
          <Button
            className={`flex-1 dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-600 hover:bg-blue-700 dark:text-gray-100 ${saved || reserved ? "cursor-not-allowed !important" : "cursor-pointer"  }`}
            onClick={handleBorrow}
            disabled={borrowButtonState.disabled || saved}
          >
            {saved ? "Borrowed" : borrowButtonState.text}
          </Button>

          <Button
            className={`flex-1 border-blue-600 text-blue-600 hover:bg-blue-100 hover:text-blue-600 cursor-pointer dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 ${saved || reserved ? "cursor-not-allowed" : "cursor-pointer"  }`}
            variant="outline"
            onClick={handleReserve}
             disabled={reserved || availableCopies === 0 || isBorrowedByUser}
          >
            {reserved ? "Reserved" : "Reserve"}
          </Button>
        </div>
      </div>
      {showForm && (
        <BookActionForm
          book={bookData}
          actionType={currentAction}
          onSuccess={handleFormSuccess}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};