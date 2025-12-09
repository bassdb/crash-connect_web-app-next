'use client'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { fullNameSchema } from '@/types/user-profile'
import { Button } from '@/components/ui/button'
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
import { updateFullName } from '@/server/actions/user-account-settings'
import { useToast } from '@/hooks/use-toast'

export default function InputFullName({ userFullName }: { userFullName: string }) {
  const { toast } = useToast()
  const { form, action, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
    updateFullName,
    zodResolver(fullNameSchema),
    {
      actionProps: {
        onSuccess: () => {
          // resetFormAndAction()
          toast({ title: 'Success', description: 'Your full name has been updated!' })
          console.log('Success')
        },
      },
      formProps: {
        defaultValues: {
          fullname: '',
        },
      },
      errorMapProps: {},
    }
  )

  const { isPending } = action

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmitWithAction}
        // onSubmit={form.handleSubmit(onSubmit)}
        className='grid grid-cols-[2fr_1fr] w-full max-w-xl items-end gap-2'
      >
        <FormField
          control={form.control}
          name='fullname'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  placeholder={userFullName ? userFullName : 'First and last name'}
                  {...field}
                  disabled={isPending}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          {!isPending ? 'Update' : 'Updating...'}
        </Button>
      </form>
    </Form>
  )
}
