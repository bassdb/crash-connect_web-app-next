'use client'
import { deleteHypeTemplate } from '../actions/manage-template-actions'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

async function handleDeleteTemplate(templateId: string) {
  const result = await deleteHypeTemplate(templateId)
  if (result.error) {
    console.error('Error deleting template:', result.error)
  } else {
    console.log('Template deleted successfully')
  }
}

export default function DeleteHypeTemplate({ templateId }: { templateId: string }) {
  return (
    <DropdownMenuItem
      className='text-red-600 cursor-pointer hover:bg-red-600 hover:text-white'
      onClick={() => handleDeleteTemplate(templateId)}
    >
      Löschen
    </DropdownMenuItem>
  )
}
