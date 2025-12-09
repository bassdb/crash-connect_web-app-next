'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { fileUploadSchema } from '@/types/user-profile'
import { logAvatarFile } from '@/server/actions/user-account-settings'

import { FormError } from '@/components/error-handling/form-error'

export default function InputAvatar() {
  const { toast } = useToast()

  type FileInputFormData = z.infer<typeof fileUploadSchema>

  // const { register, handleSubmit } = useForm<z.infer<typeof fileUploadSchema>>({
  //   resolver: zodResolver(fileUploadSchema),
  //   defaultValues: {
  //     file: '',
  //   },
  // })

  const { register, handleSubmit } = useForm<z.infer<typeof fileUploadSchema>>({
    resolver: zodResolver(fileUploadSchema),
  })

  const onSubmit = (data: z.infer<typeof fileUploadSchema>) => {
    console.log('hello')
    console.log(data)
    logAvatarFile(data)
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='grid grid-cols-[2fr_1fr] gap-4 items-start'
      >
        <Input {...register('file')} type='file' />

        <Button type='submit'>Upload</Button>
      </form>
    </div>
  )
}
