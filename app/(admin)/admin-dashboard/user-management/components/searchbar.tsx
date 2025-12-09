'use client'

import { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

// Mock user data
const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
  { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com' },
  { id: 6, name: 'Fiona Apple', email: 'fiona@example.com' },
  { id: 7, name: 'George Michael', email: 'george@example.com' },
  { id: 8, name: 'Hannah Montana', email: 'hannah@example.com' },
  { id: 9, name: 'Ian McKellen', email: 'ian@example.com' },
  { id: 10, name: 'Julia Roberts', email: 'julia@example.com' },
]

export function UserSearch() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useCallback((value: string) => {
    setIsSearching(false)
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsSearching(true)
    debouncedSearch(value)
  }

  const filteredUsers = useMemo(() => {
    if (!query) return []
    return mockUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  return (
    <div className='w-full max-w-2xl py-4'>
      <div className='relative'>
        <Input
          type='text'
          placeholder='Search users...'
          value={query}
          onChange={handleSearch}
          className='w-full py-2 pl-4 pr-10 text-sm border rounded-md focus:outline-none focus:border-emerald-500'
        />
        {isSearching && (
          <div className='absolute right-3 top-2.5'>
            <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
          </div>
        )}
      </div>
      {filteredUsers.length > 0 && (
        <div className='mt-4 bg-white rounded-lg shadow-lg'>
          <ul className='divide-y divide-gray-200'>
            {filteredUsers.map((user) => (
              <li key={user.id} className='px-4 py-3 hover:bg-gray-50'>
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center'>
                      <span className='text-sm font-medium text-gray-700'>
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{user.name}</p>
                    <p className='text-sm text-gray-500 truncate'>{user.email}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
