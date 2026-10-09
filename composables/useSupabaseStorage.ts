import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let storageClient: SupabaseClient | undefined

export function useSupabaseStorage() {
  const config = useRuntimeConfig()
  const { auth } = useFirebaseClient()

  if (!config.public.supabaseUrl || !config.public.supabasePublishableKey) {
    throw new Error('Supabase Storage is not configured')
  }

  if (!storageClient) {
    storageClient = createClient(config.public.supabaseUrl, config.public.supabasePublishableKey, {
      accessToken: async () => (await auth.currentUser?.getIdToken()) ?? null,
    })
  }

  return storageClient
}

async function compressImage(file: File, maxDimension = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = image

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(image, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else resolve(file)
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      )
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Gagal memproses gambar.'))
    }

    image.src = objectUrl
  })
}

export async function uploadProductImage(productId: string, file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) throw new Error('Foto harus berformat JPEG, PNG, atau WebP.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran foto maksimal 5 MB (SOP/GRC/DEV-SPB/2026/008).')

  const processedBlob = await compressImage(file)
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const path = `${productId}/${crypto.randomUUID()}.${extension}`
  const { error } = await useSupabaseStorage().storage
    .from('product-images')
    .upload(path, processedBlob, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload foto gagal: ${error.message}`)
  return path
}

export async function deleteProductImage(path: string) {
  const { error } = await useSupabaseStorage().storage.from('product-images').remove([path])
  if (error) throw new Error(`Hapus foto gagal: ${error.message}`)
}

export async function getProductImageUrl(path: string) {
  const { data, error } = await useSupabaseStorage().storage
    .from('product-images')
    .createSignedUrl(path, 60 * 60)

  if (error) throw new Error(`Gagal memuat foto: ${error.message}`)
  return data.signedUrl
}
