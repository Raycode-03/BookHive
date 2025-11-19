import React from 'react'
import AdminResources from '@/components/admin/AdminResources'
import CreateResourceForm from '@/components/admin/CreateResourceForm'

function AdminResourcesPage() {
  return (
    <div className="  px-6">
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Manage Resources</h1>
        <CreateResourceForm />
      </div>
      <AdminResources/>
    </div>
  )
}

export default AdminResourcesPage