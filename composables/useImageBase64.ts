/**
 * Mengompresi file gambar menjadi data URL string Base64 yang ringan
 * agar aman disimpan langsung di dokumen Cloud Firestore.
 * 
 * Target ukuran output: < 300 KB (string Base64 < 450.000 karakter).
 * Batas dokumen Firestore: 1 MiB (1.048.576 bytes) untuk keseluruhan dokumen.
 */
export async function compressImageToBase64(
  file: File,
  maxDimension = 600,
  quality = 0.75,
  maxBase64Length = 550_000 // ~400 KB raw data, aman dari limit 1 MiB Firestore
): Promise<string> {
  // 1. Validasi tipe file di awal
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan gambar yang valid.')
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = image

      // 2. Skalakan dimensi proporsional
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
      canvas.width = Math.max(1, width)
      canvas.height = Math.max(1, height)
      const ctx = canvas.getContext('2d')

      // 3. Jangan fallback ke file asli jika context canvas gagal
      if (!ctx) {
        reject(new Error('Browser gagal memproses kanvas grafis untuk kompresi gambar.'))
        return
      }

      try {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        // 4. Utamakan webp untuk rasio kompresi lossy terbaik + dukungan transparansi
        // Fallback ke jpeg jika webp tidak didukung
        let base64String = canvas.toDataURL('image/webp', quality)
        if (!base64String.startsWith('data:image/webp')) {
          base64String = canvas.toDataURL('image/jpeg', quality)
        }

        // 5. Validasi ukuran string Base64 akhir agar tidak membobol batas 1 MiB Firestore
        if (base64String.length > maxBase64Length) {
          // Percobaan kompresi darurat kedua dengan resolusi & kualitas lebih rendah
          const emergencyCanvas = document.createElement('canvas')
          emergencyCanvas.width = Math.round(canvas.width * 0.7)
          emergencyCanvas.height = Math.round(canvas.height * 0.7)
          const emergencyCtx = emergencyCanvas.getContext('2d')
          if (emergencyCtx) {
            emergencyCtx.drawImage(canvas, 0, 0, emergencyCanvas.width, emergencyCanvas.height)
            base64String = emergencyCanvas.toDataURL('image/jpeg', 0.6)
          }

          if (base64String.length > maxBase64Length) {
            reject(new Error('Ukuran gambar terkompresi masih melebihi batas aman dokumen Firestore (< 400 KB).'))
            return
          }
        }

        resolve(base64String)
      } catch (err) {
        reject(new Error(`Gagal mengonversi gambar ke Base64: ${err instanceof Error ? err.message : String(err)}`))
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Gagal memuat file gambar. Pastikan format file tidak korup.'))
    }

    image.src = objectUrl
  })
}
