/**
 * Mengompresi file gambar menjadi data URL string Base64 yang ringan
 * agar aman disimpan langsung di dokumen Firestore (jauh di bawah batas 1 MB).
 */
export async function compressImageToBase64(file: File, maxDimension = 600, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = image

      // Batasi resolusi maksimal agar ukuran file Base64 kecil (ideal < 200 KB)
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
        // Fallback FileReader murni jika context 2d gagal
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
        return
      }

      ctx.drawImage(image, 0, 0, width, height)
      // Gunakan jpeg atau webp untuk kompresi optimal
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const base64String = canvas.toDataURL(mimeType, quality)
      resolve(base64String)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Gagal memproses file gambar.'))
    }

    image.src = objectUrl
  })
}
