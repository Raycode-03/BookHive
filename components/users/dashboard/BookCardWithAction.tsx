"use client"
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface BookCardWithActionProps {
  title: string;
  author: string;
  imageUrl: string;
  packageType:string;
  ctaLabel:string;
  disabled:boolean;
  daysAvailable?: number;
  type?: string;
  onClick:()=>void;
}

export const BookCardWithAction: React.FC<BookCardWithActionProps> = ({
  title,
  author,
  imageUrl,
  daysAvailable,
  type,
}) => {
  const [saved, setSaved] = useState(false);
  const [reserved, setReserved] = useState(false);

  return (
    <div className="w-full bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-2xl overflow-hidden transition-all flex flex-col hover:shadow-lg">
      <div className="relative h-40">
        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="100%" />
      </div>

      <div className="p-4 flex flex-col flex-1 relative gap-2">
        {type === "premium" && (
          <div className="absolute top-2 right-2 bg-yellow-100 rounded-full p-1 shadow-sm">
            <Crown className="h-4 w-4 text-yellow-500" />
          </div>
        )}

        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-600">by {author}</p>
        <p className="text-sm text-gray-500">{daysAvailable} days available</p>

        <div className="flex gap-2 mt-auto">
          <Button
            className="flex-1"
            onClick={() => {
              setSaved(true);
              console.log(`Borrow ${title}`);
            }}
            disabled={saved}
          >
            {saved ? "Borrowed" : "Borrow"}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => {
              setReserved(true);
              console.log(`Reserved ${title}`);
            }}
            disabled={reserved}
          >
            {reserved ? "Reserved" : "Reserve"}
          </Button>
        </div>
      </div>
    </div>
  );
};
