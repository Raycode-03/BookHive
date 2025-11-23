// components/users/dashboard/BookCardWithAction.tsx
"use client"
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Book } from "@/types/BookCard";

interface BookCardWithActionProps extends Pick<Book, 'title' | 'author' | 'imageUrl' | 'packageType' | 'availableCopies'> {
  ctaLabel: string;
  disabled: boolean;
  onClick: () => void;
}

export const BookCardWithAction: React.FC<BookCardWithActionProps> = ({
  title,
  author,
  imageUrl,
  availableCopies,
  packageType,
  ctaLabel,
  disabled,
  onClick,
}) => {
  const [saved, setSaved] = useState(false);
  const [reserved, setReserved] = useState(false);

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
            className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => {
              setSaved(true);
              onClick();
            }}
            disabled={disabled || saved}
          >
            {saved ? "Borrowed" : ctaLabel}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => {
              setReserved(true);
              console.log(`Reserved ${title}`);
            }}
            disabled={reserved || availableCopies === 0}
          >
            {reserved ? "Reserved" : "Reserve"}
          </Button>
        </div>
      </div>
    </div>
  );
};