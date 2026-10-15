/**
 * Mengompresi file gambar menjadi data URL string Base64 yang sangat ringan (< 225 KB)
 * agar aman disimpan langsung di dokumen Cloud Firestore tanpa membebani limit 1 MiB.
 *
 * Menggunakan pendekatan iteratif (loop): menurunkan kualitas lalu dimensi
 * jika gambar berdetail tinggi masih melampaui target.
 */
export async function compressImageToBase64(
  file: File,
  maxDimension = 600,
  initialQuality = 0.75,
  maxBase64Length = 300_000 // ~225 KB raw data, batas konservatif yang sangat aman untuk Firestore
): Promise<string> {
  // 1. Validasi awal tipe file
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan format gambar yang didukung.')
  }

  const isPng = file.type === 'image/png'
  let objectUrl: string | null = null

  try {
    objectUrl = URL.createObjectURL(file)
    const image = await loadImage(objectUrl)

    // Tentukan format target yang aman
    const targetMime = determineTargetMime(isPng)

    // 2. Iterasi kompresi: mulai dari kualitas awal, turunkan kualitas, lalu turunkan resolusi jika perlu
    let currentDimension = maxDimension
    let currentQuality = initialQuality
    let bestBase64 = ''

    for (let attempt = 1; attempt <= 4; attempt++) {
      const { width, height } = calculateDimensions(image.width, image.height, currentDimension)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, width)
      canvas.height = Math.max(1, height)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Browser gagal menginisialisasi kanvas grafis untuk pemrosesan gambar.')
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      bestBase64 = canvas.toDataURL(targetMime, currentQuality)

      // Jika browser tidak mendukung webp dan fallback jpeg dipaksa, cek header
      if (targetMime === 'image/webp' && !bestBase64.startsWith('data:image/webp')) {
        // Fallback: jika gambar transparan gunakan png kualitas canvas, jika tidak gunakan jpeg
        const fallbackMime = isPng ? 'image/png' : 'image/jpeg'
        bestBase64 = canvas.toDataURL(fallbackMime, currentQuality)
      }

      // Jika ukuran sudah di bawah ambang batas aman, langsung kembalikan
      if (bestBase64.length <= maxBase64Length) {
        return bestBase64
      }

      // Penyesuaian iteratif untuk putaran berikutnya
      if (attempt === 1) {
        currentQuality = 0.6
      } else if (attempt === 2) {
        currentDimension = Math.round(maxDimension * 0.75) // misal: 450px
        currentQuality = 0.55
      } else if (attempt === 3) {
        currentDimension = Math.round(maxDimension * 0.5) // misal: 300px
        currentQuality = 0.5
      }
    }

    // Jika setelah 4 kali percobaan ukuran masih melebihi target
    if (bestBase64.length > maxBase64Length) {
      throw new Error(
        `Gambar terlalu kompleks untuk disimpan langsung di Firestore (${Math.round((bestBase64.length * 0.75) / 1024)} KB > target 225 KB). Silakan gunakan gambar dengan resolusi lebih kecil.`
      )
    }

    return bestBase64
  } finally {
    // 3. Pastikan pembersihan object URL selalu dieksekusi di blok finally
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat file gambar. Pastikan file tidak rusak/korup.'))
    img.src = src
  })
}

function calculateDimensions(
  origWidth: number,
  origHeight: number,
  maxDim: number
): { width: number; height: number } {
  let width = origWidth
  let height = origHeight

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width)
      width = maxDim
    } else {
      width = Math.round((width * maxDim) / height)
      height = maxDim
    }
  }

  return { width, height }
}

function determineTargetMime(isPng: boolean): string {
  // WebP mendukung lossy compression + alpha transparency di semua modern browser
  // Jika file PNG, WebP menjaga transparansi logo tanpa background hitam
  return 'image/webp'
}
