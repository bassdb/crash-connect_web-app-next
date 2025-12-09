import { ProfileSidebar } from './components/ProfileSidebar'

export default function UserAccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='container mx-auto py-6'>
      <div className='flex flex-row gap-6'>
        <ProfileSidebar />
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  )
}
