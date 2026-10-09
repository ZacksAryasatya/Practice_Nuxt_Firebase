import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const filePath = resolve(process.cwd(), 'version.json')
    const rawData = await readFile(filePath, 'utf-8')
    const versionData = JSON.parse(rawData)

    setResponseHeader(event, 'content-type', 'application/json')
    return versionData
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal membaca version.json',
    })
  }
})
