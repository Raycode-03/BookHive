"use client"
import React, { useState } from 'react' // Add useRef import
import AdminResources from '@/components/admin/AdminResources'
import CreateResourceForm from '@/components/admin/CreateResourceForm'
import { Book } from '@/types/BookCard'


function AdminResourcesPage() {
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [optimisticBooks, setOptimisticBooks] = useState<Book[]>([])
  
  const handleSuccess = () => {
  setRefetchTrigger(prev => prev + 1)
  setOptimisticBooks([])  // FIX duplication
};

  const handleOptimisticCreate = (bookData: Book) => {
    // Add to optimistic books immediately
    setOptimisticBooks(prev => [...prev, bookData])
  }

  return (
    <div className="px-6">
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Manage Resources</h1>
        <CreateResourceForm 
          onSuccess={handleSuccess} 
          onOptimisticCreate={handleOptimisticCreate} // Pass the function
        />
      </div>
      {/* Add ref to AdminResources */}
      <AdminResources refetchTrigger={refetchTrigger}  optimisticBooks={optimisticBooks}   />
    </div>
  )
}

export default AdminResourcesPage