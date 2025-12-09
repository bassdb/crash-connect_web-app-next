'use client'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { userNameSchema } from '@/types/user-profile'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
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
import { updateUserName } from '@/server/actions/user-account-settings'

export default function InputUsername({ userN }: { userN: string }) {
  const { toast } = useToast()

  const { form, action, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
    updateUserName,
    zodResolver(userNameSchema),
    {
      actionProps: {
        onSuccess: () => {
          // resetFormAndAction()
          toast({ title: 'Success', description: 'Your username has been updated!' })
          console.log('Success')
        },
      },
      formProps: {
        defaultValues: {
          username: '',
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
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder={userN ? userN : 'Choose your username}'}
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
