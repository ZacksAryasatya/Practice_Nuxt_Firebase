/**
 * Mengompresi file gambar menjadi data URL string Base64 yang sangat ringan (< 225 KB)
 * agar aman disimpan langsung di dokumen Cloud Firestore tanpa membebani limit 1 MiB.
 *
 * Menggunakan array konfigurasi deklaratif (data-driven attempts):
 * menurunkan kualitas lossy terlebih dahulu, lalu menurunkan skala dimensi jika diperlukan.
 */

interface CompressionStep {
  scale: number
  quality: number
}

const COMPRESSION_STEPS: CompressionStep[] = [
  { scale: 1.0, quality: 0.75 },
  { scale: 1.0, quality: 0.60 },
  { scale: 0.75, quality: 0.55 },
  { scale: 0.50, quality: 0.50 },
]

export async function compressImageToBase64(
  file: File,
  maxDimension = 600,
  maxBase64Length = 300_000 // ~225 KB biner, margin sangat aman untuk dokumen Firestore
): Promise<string> {
  // 1. Validasi parameter input
  if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
    throw new Error('Parameter maxDimension harus berupa angka positif.')
  }
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File yang dipilih bukan berkas gambar yang didukung.')
  }

  const isPng = file.type === 'image/png'
  let objectUrl: string | null = null

  try {
    objectUrl = URL.createObjectURL(file)
    const image = await loadImage(objectUrl)

    // 2. Validasi integritas visual: tolak gambar rusak / kosong (naturalWidth/Height = 0)
    const naturalWidth = image.naturalWidth || image.width
    const naturalHeight = image.naturalHeight || image.height
    if (!naturalWidth || !naturalHeight) {
      throw new Error('Berkas gambar tidak memiliki dimensi valid atau mengalami kerusakan.')
    }

    let bestBase64 = ''

    // 3. Eksekusi tahapan kompresi berurutan sesuai konfigurasi deklaratif
    for (const step of COMPRESSION_STEPS) {
      const targetMaxDim = Math.max(1, Math.round(maxDimension * step.scale))
      const { width, height } = calculateDimensions(naturalWidth, naturalHeight, targetMaxDim)

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, width)
      canvas.height = Math.max(1, height)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Browser gagal menginisialisasi kanvas grafis untuk pemrosesan gambar.')
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      // Coba kompresi WebP (mendukung lossy + transparansi)
      bestBase64 = canvas.toDataURL('image/webp', step.quality)

      // Fallback jika browser lawas tidak mendukung export webp
      if (!bestBase64.startsWith('data:image/webp')) {
        const fallbackMime = isPng ? 'image/png' : 'image/jpeg'
        bestBase64 = canvas.toDataURL(fallbackMime, step.quality)
      }

      // Berhenti dan kembalikan hasil jika sudah memenuhi batas aman
      if (bestBase64.length <= maxBase64Length) {
        return bestBase64
      }
    }

    // 4. Jika setelah seluruh tahapan masih melampaui batas aman
    const finalSizeKb = Math.round((bestBase64.length * 0.75) / 1024)
    throw new Error(
      `Gambar terlalu kompleks (${finalSizeKb} KB > target 225 KB). Silakan pilih gambar dengan resolusi lebih kecil.`
    )
  } finally {
    // 5. Pembersihan alokasi memori browser selalu dijamin berjalan
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat file gambar. Format berkas tidak dapat didekode.'))
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
