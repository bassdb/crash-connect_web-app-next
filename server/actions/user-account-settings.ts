'use server'

import { createClient } from '@/server/supabase/server'
import { actionClient } from '@/lib/safe-action'

import { z } from 'zod'
import { userNameSchema, fullNameSchema, fileUploadSchema } from '@/types/user-profile'

import { revalidatePath } from 'next/cache'

export const updateUserName = actionClient
  .schema(userNameSchema)
  .action(async ({ parsedInput: { username } }) => {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    console.log(data)
    console.log('hello from action!')
    if (!data) {
      return { error: 'No user found!' }
    }
    const { status, error } = await supabase
      .from('profiles')
      .update({
        username: username,
      })
      .eq('id', data.user?.id)

    if (error) {
      console.log(error)
      return { error: error.message }
    }
    revalidatePath('/profile')
    return { success: 'Username updated!', status: { status } }
  })

export const updateFullName = actionClient
  .schema(fullNameSchema)
  .action(async ({ parsedInput: { fullname } }) => {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    console.log('hello from Update Full Name action!')
    if (!data) {
      return { error: 'No user found!' }
    }
    const { status, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullname,
      })
      .eq('id', data.user?.id)

    if (error) {
      console.log(error)
      return { error: error.message }
    }
    revalidatePath('/profile')
    return { success: 'Username updated!', status: { status } }
  })

export async function logAvatarFile(files: z.infer<typeof fileUploadSchema>) {
  console.log('hello from avatarFile upload server action')
  console.log(files)
  // const avatarFile = files.avatar[0]
  const avatarFile = files.file[0]
  console.log(avatarFile)
  if (!avatarFile) return { error: 'No file uploaded' }

  const name = avatarFile.name
  const size = avatarFile.size
  const type = avatarFile.type.split('/').pop()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No user found!' }
  }

  const { data: userData } = await supabase.from('profiles').select().eq('id', user.id).single()

  if (userData?.avatar_url) {
    console.log('avatar url exists')
    const fileName = userData.avatar_url.split('/').pop()
    console.log('Now removing: ', fileName)
    const { data: delData, error: delError } = await supabase.storage
      .from('avatars')
      .remove([`user/${user.id}/${fileName}`])
  }

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(`user/${user.id}/${Date.now()}_avatar.${type}`, avatarFile, {
      cacheControl: '3600',
      upsert: true,
    })
  if (uploadError) {
    console.log(uploadError)
    return { error: 'sth went wrong' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)

  console.log(publicUrl)

  const { status } = await supabase
    .from('profiles')
    .update({
      avatar_url: publicUrl,
    })
    .eq('id', userData?.id)

  revalidatePath('/profile')
  return { success: 'Profile picture updated!' }
}
