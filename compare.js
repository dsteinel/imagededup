import fg from 'fast-glob'
import fs from 'fs/promises'
import { imageHash } from 'image-hash'
import path from 'path'

const FRAME_DIR = './images' // folder to check
const DUPLICATE_DIR = '/duplicates' // folder to move duplicates
const HASH_SIZE = 16
const DUPLICATE_THRESHOLD = 9

function hammingDistance(hash1, hash2) {
  let dist = 0
  for (let i = 0; i < hash1.length; i++) {
    const v1 = parseInt(hash1[i], 16)
    const v2 = parseInt(hash2[i], 16)
    let xor = v1 ^ v2
    while (xor > 0) {
      dist += xor & 1
      xor >>= 1
    }
  }
  return dist
}

async function computeHash(imagePath) {
  return new Promise((resolve, reject) => {
    imageHash(imagePath, HASH_SIZE, true, (err, hash) => {
      if (err) reject(err)
      else resolve(hash)
    })
  })
}

async function getFileSize(filePath) {
  const stat = await fs.stat(filePath)
  return stat.size
}

async function main() {
  await fs.mkdir(DUPLICATE_DIR, { recursive: true })

  const images = await fg(['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.HEIC'], {
    cwd: FRAME_DIR,
    absolute: true,
  })

  if (images.length === 0) {
    console.log('No images to compare.')
    return
  }

  const results = []
  for (const img of images) {
    try {
      const hash = await computeHash(img)
      const size = await getFileSize(img)
      results.push({ path: img, hash, size })
      console.log(`Hashed: ${path.basename(img)} → ${hash}`)
    } catch (e) {
      console.error('Error hashing:', img, e)
    }
  }

  const duplicates = []
  const grouped = new Set()

  for (let i = 0; i < results.length; i++) {
    if (grouped.has(results[i].path)) continue

    const group = [results[i]]

    for (let j = i + 1; j < results.length; j++) {
      if (grouped.has(results[j].path)) continue

      const dist = hammingDistance(results[i].hash, results[j].hash)
      if (dist <= DUPLICATE_THRESHOLD) {
        group.push(results[j])
      }
    }

    if (group.length > 1) {
      group.forEach((item) => grouped.add(item.path))
      duplicates.push(group)
    }
  }

  if (duplicates.length === 0) {
    console.log('🎉 No duplicates found.')
    return
  }

  console.log('\nDuplicate groups:')
  for (const [idx, group] of duplicates.entries()) {
    console.log(`Group ${idx + 1}:`)
    // Sort group by size ascending, smallest first
    group.sort((a, b) => a.size - b.size)

    // Keep the largest file (last in sorted), others to move
    const toKeep = group[group.length - 1]
    console.log(`  Keep: ${toKeep.path} (${toKeep.size} bytes)`)

    for (let i = 0; i < group.length - 1; i++) {
      const dup = group[i]
      const filename = path.basename(dup.path)
      const dest = path.join(DUPLICATE_DIR, filename)
      try {
        await fs.rename(dup.path, dest)
        console.log(`  Moved duplicate: ${dup.path} → ${dest}`)
      } catch (e) {
        console.error(`Error moving file ${dup.path} to duplicates folder`, e)
      }
    }
  }
}

main()
