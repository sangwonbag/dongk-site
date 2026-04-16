require('dotenv').config({ path: '.env.local' })

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

function slugifyPath(input) {
  return input
    .replace(/\\/g, '/')
    .split('/')
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        // 대분류
        .replace(/데코타일/g, 'deco_tile')
        .replace(/장판/g, 'jangpan')
        .replace(/마루/g, 'maru')
        .replace(/벽지/g, 'wallpaper')
        .replace(/카페트타일/g, 'carpet_tile')
        // LX 장판 (두께 중심)
        .replace(/lx하우시스_.*_1\.8t/g, 'lx_18t')
        .replace(/lx하우시스_.*_2\.0t/g, 'lx_20t')
        .replace(/lx하우시스_.*_2\.2t/g, 'lx_22t')
        .replace(/lx하우시스_.*_2\.7t/g, 'lx_27t')
        .replace(/lx하우시스_.*_3\.2t/g, 'lx_32t')
        .replace(/lx하우시스_.*_4\.5t/g, 'lx_45t')
        .replace(/lx하우시스_.*_5\.0t/g, 'lx_50t')
        // 브랜드명 치환
        .replace(/동신/g, 'dongshin')
        .replace(/녹수/g, 'noksu')
        .replace(/재영/g, 'jaeyoung')
        .replace(/현대/g, 'hyundai')
        .replace(/동화/g, 'dongwha')
        .replace(/구정/g, 'kujung')
        .replace(/개나리/g, 'gaenari')
        .replace(/서울/g, 'seoul')
        .replace(/제일/g, 'jeil')
        .replace(/디아이디/g, 'did')
        .replace(/신한/g, 'shinhan')
        .replace(/스완/g, 'swan')
        .replace(/아반/g, 'avan')
        // 정규화 (공백 등)
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9가-힣._-]/g, '_') // Allow Korean characters
        .replace(/_+/g, '_')
    )
    .join('/')
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is missing in .env.local')
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE is missing in .env.local')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BUCKET = 'materials'
const ROOT = path.join(
  process.cwd(),
  'public/images/Thumbnail_Image/materials'
)

const stats = {
  uploaded: 0,
  skipped: 0,
  failed: 0,
}

const uploadedSafePaths = new Set()

async function uploadWithRetry(safePath, fileBuffer, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(safePath, fileBuffer, options)

    if (error) {
      const msg = error.message.toLowerCase()
      const isNetworkError =
        msg.includes('timeout') ||
        msg.includes('fetch') ||
        msg.includes('network') ||
        msg.includes('econnreset') ||
        msg.includes('socket') ||
        error.statusCode === 502 ||
        error.statusCode === 503 ||
        error.statusCode === 504

      if (isNetworkError && attempt < maxRetries) {
        console.log(`RETRY ${attempt}/${maxRetries}: ${safePath} (${error.message})`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)) // Exponential-like backoff
        continue
      }
      return { error }
    }
    return { error: null }
  }
}

async function uploadFolder(dir, baseDir = ROOT) {
  const items = fs.readdirSync(dir)

  for (const item of items) {
    if (item === '__MACOSX' || item.startsWith('._')) {
      console.log(`SKIPPED: ${path.join(dir, item).replace(baseDir, '')} (macOS artifact)`)
      stats.skipped++
      continue
    }

    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      await uploadFolder(fullPath, baseDir)
      continue
    }

    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/')
    const safePath = slugifyPath(relativePath)

    // Check if any part of the path is empty or just '_'
    const parts = safePath.split('/')
    if (parts.some((p) => p === '' || p === '_')) {
      console.log(`SKIPPED: ${relativePath} -> ${safePath} (Invalid safePath)`)
      stats.skipped++
      continue
    }

    if (uploadedSafePaths.has(safePath)) {
      console.log(`DUPLICATE: ${relativePath} -> ${safePath} (Already processed)`)
      stats.skipped++
      continue
    }

    uploadedSafePaths.add(safePath)

    const fileBuffer = fs.readFileSync(fullPath)

    const ext = path.extname(fullPath).toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'

    const { error } = await uploadWithRetry(safePath, fileBuffer, {
      contentType,
      upsert: true,
    })

    if (error) {
      console.log(`FAILED: ${safePath} - ${error.message}`)
      stats.failed++
    } else {
      console.log(`UPLOADED: ${safePath}`)
      stats.uploaded++
    }
  }
}

uploadFolder(ROOT)
  .then(() => {
    console.log('\n--- UPLOAD SUMMARY ---')
    console.log(`UPLOADED: ${stats.uploaded}`)
    console.log(`SKIPPED:  ${stats.skipped}`)
    console.log(`FAILED:   ${stats.failed}`)
    console.log('----------------------\nDONE')
  })
  .catch((err) => console.error('ERROR:', err.message))