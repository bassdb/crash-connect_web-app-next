'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TeamsList } from './teams-list'
import { CreateTeamForm } from './create-team-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Team } from '@/types/teams-types'

interface TeamsPageClientProps {
  initialTeams: (Team & { userRole: string })[]
}

export function TeamsPageClient({ initialTeams }: TeamsPageClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  // Auto-select if only one team exists
  useEffect(() => {
    if (initialTeams.length === 1) {
      const team = initialTeams[0]
      router.push(`/teams/${team.id}`)
    }
  }, [initialTeams, router])

  const handleCreateNewClick = () => {
    setShowCreateForm(true)
  }

  const handleBackToList = () => {
    setShowCreateForm(false)
  }

  return (
    <div className='container mx-auto py-2 px-4'>
      <div className='max-w-6xl mx-auto'>
        {showCreateForm ? (
          <div className='space-y-6'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={handleBackToList} className='gap-2'>
                <ArrowLeft className='w-4 h-4' />
                Zurück zu Teams
              </Button>
            </div>
            <CreateTeamForm />
          </div>
        ) : (
          <TeamsList onCreateNewClick={handleCreateNewClick} initialTeams={initialTeams} />
        )}
      </div>
    </div>
  )
} 