import React, { useState } from 'react'
import { TrashIcon } from 'lucide-react'

interface User {
  id: number
  name: string
  type: string
  user_id: string
  subscription: string
  joinedTime: string
  avatar: string
}

export function UsersTable({ filter, search }: { filter?: string; search?: string }) {
  const initial: User[] = [
    {
      id: 1,
      name: 'Hourglass',
      type: 'Enterprise',
      user_id: '46332',
      subscription: 'Enterprise',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'Lana Steiner',
      type: 'Freelancers',
      user_id: '46332',
      subscription: '-',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 3,
      name: 'Hourglass',
      type: 'Enterprise',
      user_id: '46332',
      subscription: 'Enterprise',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 4,
      name: 'Lana Steiner',
      type: 'Freelancers',
      user_id: '46332',
      subscription: '-',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 5,
      name: 'Hourglass',
      type: 'Enterprise',
      user_id: '46332',
      subscription: 'Enterprise',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 6,
      name: 'Hourglass',
      type: 'Enterprise',
      user_id: '46332',
      subscription: 'Enterprise',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 7,
      name: 'Hourglass',
      type: 'Enterprise',
      user_id: '46332',
      subscription: 'Enterprise',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 8,
      name: 'Lana Steiner',
      type: 'Freelancers',
      user_id: '46332',
      subscription: '-',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 9,
      name: 'Lana Steiner',
      type: 'Freelancers',
      user_id: '46332',
      subscription: '-',
      joinedTime: '30 min ago',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  ]
  const [users, setUsers] = useState<User[]>(initial)

  const filtered = users.filter((u) => {
    if (filter && filter !== '') {
      if (filter.toLowerCase() !== u.type.toLowerCase()) return false
    }
    if (search && search.trim() !== '') {
      const s = search.toLowerCase()
      if (!u.name.toLowerCase().includes(s) && !u.user_id.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User_id
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Subscription Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {user.joinedTime}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.user_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.subscription}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={async () => {
                      const ok = confirm(`Delete user ${user.name} (id: ${user.id})?`)
                      if (!ok) return
                      try {
                        const res = await fetch('/api/admin/delete-user', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: user.id, name: user.name }),
                        })
                        const data = await res.json()
                        if (data?.ok) {
                          setUsers((prev) => prev.filter((p) => p.id !== user.id))
                        } else {
                          alert('Failed to delete user')
                        }
                      } catch (err) {
                        console.error(err)
                        alert('Error deleting user')
                      }
                    }}
                    className="p-1 rounded-full bg-red-50 text-red-500"
                  >
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
