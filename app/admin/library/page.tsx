import React from 'react'
import Resources from '@/components/users/dashboard/Resources'
import CreateResourceForm from '@/components/admin/CreateResourceForm'

function AdminResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Resources</h1>
        <CreateResourceForm />
      </div>

      <Resources />
    </div>
  )
}

export default AdminResourcesPage