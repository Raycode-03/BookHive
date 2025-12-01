// components/users/dashboard/BookCardWithAction.tsx
"use client"
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown, BookOpen, Bookmark } from "lucide-react";
import { Book } from "@/types/BookCard";
import BookActionForm from "@/components/users/resourceActionForm/bookActionForm";
import { useIsMobile } from "@/hooks/use-mobile";
interface BookCardWithActionProps extends Pick<Book,'_id' | 'title' | 'author' | 'imageUrl' | 'packageType' | 'availableCopies'> {
  ctaLabel: string;
  onSuccess?: () => void;
  isBorrowedByUser?: boolean;
  isReservedByUser?: boolean;
}

export const BookCardWithAction: React.FC<BookCardWithActionProps> = ({
  _id,
  title,
  author,
  imageUrl,
  availableCopies,
  packageType,
  ctaLabel,
  onSuccess,
  isBorrowedByUser = false,
  isReservedByUser = false,
}) => {
  const [saved, setSaved] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentAction, setCurrentAction] = useState<'borrow' | 'reserve'>('borrow');
  const isMobile= useIsMobile();
  // If user has already borrowed or reserved this book, update local state
  React.useEffect(() => {
    if (isBorrowedByUser) setSaved(true);
    if (isReservedByUser) setReserved(true);
  }, [isBorrowedByUser, isReservedByUser]);

  // Show only one button if user has already taken action
  const showSingleButton = saved || reserved || isBorrowedByUser || isReservedByUser;

  const getBorrowButtonState = () => {
    if (saved || isBorrowedByUser) {
      return { 
        text:"Borrowed", 
        shortText: "Borrowed",
        icon: <BookOpen className="h-4 w-4" />,
        disabled: true 
      };
    }
    if (reserved || isReservedByUser) {
      return { 
        text: "Cannot Borrow", 
        shortText: "Unavailable",
        icon: <BookOpen className="h-4 w-4" />,
        disabled: true 
      };
    }
    if (availableCopies === 0) {
      return { 
        text: "Unavailable", 
        shortText: "Unavailable",
        icon: <BookOpen className="h-4 w-4" />,
        disabled: true 
      };
    }
    return { 
      text: ctaLabel, 
      shortText: ctaLabel,
      icon: <BookOpen className="h-4 w-4" />,
      disabled: false 
    };
  };

  const getReserveButtonState = () => {
    if (reserved || isReservedByUser) {
      return { 
        text: "Reserved", 
        shortText: "Reserved",
        icon: <Bookmark className="h-4 w-4" />,
        disabled: true 
      };
    }
    if (saved || isBorrowedByUser) {
      return { 
        text:"Cannot Reserve", 
        shortText: "Unavailable",
        icon: <Bookmark className="h-4 w-4" />,
        disabled: true 
      };
    }
    if (availableCopies === 0) {
      return { 
        text:  "Unavailable", 
        shortText: "Unavailable",
        icon: <Bookmark className="h-4 w-4" />,
        disabled: true 
      };
    }
    return { 
      text: "Reserve", 
      shortText: "Reserve",
      icon: <Bookmark className="h-4 w-4" />,
      disabled: false 
    };
  };

  const borrowButtonState = getBorrowButtonState();
  const reserveButtonState = getReserveButtonState();

  const handleBorrow = () => {
    setCurrentAction('borrow');
    setShowForm(true);
  };

  const handleReserve = () => {
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

  // Determine which button to show as primary when showing single button
  const getPrimaryButtonState = () => {
    if (saved || isBorrowedByUser) return borrowButtonState;
    if (reserved || isReservedByUser) return reserveButtonState;
    return borrowButtonState; // Default to borrow button
  };

  const primaryButtonState = getPrimaryButtonState();

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
          {showSingleButton ? (
            // Show only one button when user has already taken action
            <Button
              className={`w-full min-w-0 ${
                primaryButtonState.disabled 
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              } dark:text-gray-100`}
              onClick={primaryButtonState.disabled ? undefined : 
                (primaryButtonState === borrowButtonState ? handleBorrow : handleReserve)}
              disabled={primaryButtonState.disabled}
              size="sm"
            >
              <span className="flex items-center gap-2 truncate">
                {primaryButtonState.icon}
                <span className="truncate">{primaryButtonState.shortText}</span>
              </span>
            </Button>
          ) : (
            // Show both buttons when no action taken
            <>
              <Button
                className={`flex-1 min-w-0 px-2 ${
                  borrowButtonState.disabled 
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                } dark:text-gray-100`}
                onClick={handleBorrow}
                disabled={borrowButtonState.disabled}
                size="sm"
              >
                <span className="flex items-center gap-1 sm:gap-2 truncate">
                  {!isMobile && borrowButtonState.icon}
                  <span className="truncate text-xs sm:text-sm">{borrowButtonState.shortText}</span>
                </span>
              </Button>

              <Button
                className={`flex-1 min-w-0 px-2 ${
                  reserveButtonState.disabled
                    ? "border-gray-400 text-gray-400 dark:border-gray-600 dark:text-gray-600 cursor-not-allowed"
                    : "border-blue-600 text-blue-600 hover:bg-blue-100 hover:text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
                }`}
                variant="outline"
                onClick={handleReserve}
                disabled={reserveButtonState.disabled}
                size="sm"
              >
                <span className="flex items-center gap-1 sm:gap-2 truncate">
                  {!isMobile && reserveButtonState.icon}
                  <span className="truncate text-xs sm:text-sm">{reserveButtonState.shortText}</span>
                </span>
              </Button>
            </>
          )}
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