"use client";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Search and Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Skeleton className="w-full h-10 rounded-lg dark:bg-gray-700" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-32 h-10 rounded-lg dark:bg-gray-700" />
        </div>
      </div>

      {/* Users Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['User', 'Package', 'Role', 'Joined', 'Actions'].map((header) => (
                  <th 
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: count }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-700" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-32 dark:bg-gray-700" />
                        <Skeleton className="h-3 w-24 dark:bg-gray-700" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-16 rounded-full dark:bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-12 rounded-full dark:bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-20 dark:bg-gray-700" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6 rounded dark:bg-gray-700" />
                      <Skeleton className="h-6 w-6 rounded dark:bg-gray-700" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <Skeleton className="h-8 w-12 mb-2 dark:bg-gray-600" />
            <Skeleton className="h-4 w-20 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsersBoxSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="text-center">
        <Skeleton className="h-8 w-64 mx-auto dark:bg-gray-700" />
        <Skeleton className="h-4 w-48 mx-auto mt-2 dark:bg-gray-700" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700"
          >
            {/* Icon Skeleton */}
            <Skeleton className="w-8 h-8 rounded-full mx-auto dark:bg-gray-700" />
            
            {/* Title Skeleton */}
            <Skeleton className="h-5 w-32 mx-auto mt-2 dark:bg-gray-700" />
            
            {/* Description Skeleton */}
            <Skeleton className="h-4 w-24 mx-auto mt-1 dark:bg-gray-700" />
            
            {/* Stats Skeleton */}
            <div className="mt-3 flex justify-between items-center">
              <Skeleton className="h-5 w-16 dark:bg-gray-700" />
              <Skeleton className="h-6 w-20 rounded dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Section Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        {/* Section Title Skeleton */}
        <Skeleton className="h-6 w-48 mb-4 dark:bg-gray-700" />
        
        {/* Content Area Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full dark:bg-gray-700" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 dark:bg-gray-700" />
                <Skeleton className="h-3 w-1/2 dark:bg-gray-700" />
              </div>
              <Skeleton className="h-8 w-20 rounded dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function BooksSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="w-full bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden transition-all flex flex-col animate-pulse"
          >
            {/* Image Skeleton */}
            <div className="relative h-40 bg-gray-300 dark:bg-gray-600" />
            
            {/* Content Skeleton */}
            <div className="p-4 flex flex-col flex-1 gap-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              
              <div className="flex gap-2 mt-auto">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded flex-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}