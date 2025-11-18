"use client"
import React, { useState, useEffect } from 'react'
import { Search, Mail, UserCheck, UserX, User } from 'lucide-react'
import { UsersSkeleton } from '../users/skeleton'
import { toast } from 'sonner'
interface User {
  _id: string
  name: string
  email: string
  image?: string
  isAdmin: boolean
  packageType: string
  createdAt: string
  isSuspended?: boolean
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'admin'>('all')

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'free' ? user.packageType === 'free' :
      filter === 'premium' ? user.packageType === 'premium' :
      filter === 'admin' ? user.isAdmin : true
    
    return matchesSearch && matchesFilter
  })

  const makeAdmin = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/make_admin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json();
      if(!res.ok){
        toast.error(data?.error || "error converting user to admin ")
      }else {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to make user admin:', error)
    }
  }

  const suspendUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/suspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if(!res.ok){
        toast.error(data?.error || "error converting user to admin ")
      }else {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to suspend user:', error)
    }
  }

  const unsuspendUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/unsuspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json();
      if(!res.ok){
        toast.error(data?.error || "error converting user to admin ")
      }else {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to unsuspend user:', error)
    }
  }

  const formatAdminDate = (dateString: string) => {
    const datePart = dateString.split(' at ')[0];
    const timePart = dateString.split(' at ')[1];
    
    const date = new Date(datePart);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    
    return `${day}/${month}/${year} ${timePart}`;
  };

  if (loading) {
    return <UsersSkeleton count={4} />
  }

  return (
    <div className="space-y-6 w-full">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between w-full">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Users</option>
            <option value="free">Free Plan</option>
            <option value="premium">Premium Plan</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table - Fixed for all screen sizes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto w-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[25%]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                  Package
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[20%] hidden md:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.image ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.image}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                          {user.isSuspended && (
                            <span className="ml-2 text-xs text-red-500">(Suspended)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.packageType === 'premium' 
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {user.packageType.charAt(0).toUpperCase() + user.packageType.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isAdmin 
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isSuspended
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {user.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {formatAdminDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      {/* Admin Management */}
                      {!user.isAdmin && (
                        <button
                          onClick={() => makeAdmin(user._id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Make Admin"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Suspend/Unsuspend */}
                      {user.isSuspended ? (
                        <button
                          onClick={() => unsuspendUser(user._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Unsuspend User"
                        >
                          <User className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => suspendUser(user._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Suspend User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Email */}
                      <button
                        onClick={() => {/* Implement email functionality */}}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Users</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {users.filter(u => u.packageType === 'premium').length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Premium Users</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
            {users.filter(u => u.packageType === 'free').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Free Users</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {users.filter(u => u.isAdmin).length}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Admin Users</div>
        </div>
      </div>

      {/* Suspended Users Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {users.filter(u => u.isSuspended).length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Suspended Users</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => !u.isSuspended).length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Active Users</div>
        </div>
      </div>
    </div>
  ) 
}

export default UserManagement