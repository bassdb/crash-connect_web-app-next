import { z } from 'zod'

export const userNameSchema = z.object({
  username: z.string().min(2).max(50),
})

const fileSizeLimit = 5 * 1024 * 1024

export const fullNameSchema = z.object({
  fullname: z.string().min(2).max(50),
})

export const fileUploadSchema = z.object({
  file:
    typeof window === 'undefined'
      ? z.any()
      : z
          .instanceof(FileList)
          .refine((file) => file?.length == 1, 'File is required.')
          .refine((file) => ['image/jpeg', 'image/png'].includes(file[0].type), {
            message: 'Nur JPEG- und PNG-Dateien sind erlaubt.',
          }),
})

// export const fileUploadSchema = z
//   .custom<File>((value) => value instanceof File, {
//     message: 'Es muss eine Datei hochgeladen werden.',
//   })
// .refine((file) => ['image/jpeg', 'image/png'].includes(file[0].type), {
//   message: 'Nur JPEG- und PNG-Dateien sind erlaubt.',
// })
//   .refine((file) => file.size <= fileSizeLimit, {
//     message: 'File size should not exceed 5MB',
//   })
// .refine((file) => file instanceof File, {
//   message: 'Es muss eine Datei hochgeladen werden.',
// })
