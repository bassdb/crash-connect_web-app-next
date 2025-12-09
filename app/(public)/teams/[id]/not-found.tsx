import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, Search } from 'lucide-react'

export default function TeamNotFound() {
  return (
    <div className='container mx-auto py-12 px-4'>
      <div className='max-w-md mx-auto text-center'>
        <Card>
          <CardHeader>
            <div className='mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4'>
              <Search className='w-8 h-8 text-muted-foreground' />
            </div>
            <CardTitle className='text-xl'>Team nicht gefunden</CardTitle>
            <CardDescription>
              Das gesuchte Team existiert nicht oder Sie haben keine Berechtigung, es anzuzeigen.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Mögliche Gründe:
              </p>
              <ul className='text-sm text-muted-foreground space-y-1 text-left'>
                <li>• Das Team wurde gelöscht</li>
                <li>• Sie sind kein Mitglied des Teams</li>
                <li>• Die Team-ID ist ungültig</li>
              </ul>
            </div>
            
            <div className='flex flex-col gap-2 pt-4'>
              <Link href='/teams'>
                <Button className='w-full gap-2'>
                  <ArrowLeft className='w-4 h-4' />
                  Zurück zu Ihren Teams
                </Button>
              </Link>
              
              <Link href='/teams/create'>
                <Button variant='outline' className='w-full gap-2'>
                  <Users className='w-4 h-4' />
                  Neues Team erstellen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 