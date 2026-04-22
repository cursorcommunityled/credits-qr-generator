import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Generates favicon variants using the official Cursor mark:
 *  - icon-light-32x32.png: dark mark on light background (for light OS theme)
 *  - icon-dark-32x32.png:  light mark on dark background (for dark OS theme)
 *  - apple-icon.png:       180x180 version with dark mark on light background
 */

const CURSOR_MARK_PATH =
  'M129.37 35.5041L69.1266 0.83515C67.1921 -0.278383 64.8051 -0.278383 62.8706 0.83515L2.63021 35.5041C1.00401 36.44 0 38.1709 0 40.0456V109.956C0 111.83 1.00401 113.561 2.63021 114.497L62.8734 149.166C64.8079 150.28 67.1949 150.28 69.1294 149.166L129.373 114.497C130.999 113.561 132.003 111.83 132.003 109.956V40.0456C132.003 38.1709 130.999 36.44 129.373 35.5041H129.37ZM125.586 42.8478L67.4296 143.252C67.0365 143.928 65.9986 143.652 65.9986 142.868V77.1249C65.9986 75.8112 65.2944 74.5962 64.1518 73.9365L7.0337 41.0661C6.35494 40.6743 6.6321 39.6397 7.41834 39.6397H123.73C125.382 39.6397 126.414 41.4241 125.589 42.8506H125.586V42.8478Z'

/**
 * Build an SVG string for the Cursor mark on a rounded-rect background.
 * The mark is rendered on a 180x180 canvas and scaled at export time.
 */
function buildSvg({ size, bg, fg, radiusRatio = 0.205 }) {
  const radius = Math.round(size * radiusRatio)
  // The raw mark is 132x150. Inset it inside the rounded square.
  const markSize = size * 0.6
  const markWidth = markSize
  const markHeight = markSize * (150 / 132)
  const x = (size - markWidth) / 2
  const y = (size - markHeight) / 2
  const scale = markWidth / 132

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bg}"/>
  <g transform="translate(${x} ${y}) scale(${scale})">
    <path d="${CURSOR_MARK_PATH}" fill="${fg}"/>
  </g>
</svg>`
}

async function renderPng(svg, outPath) {
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
  await writeFile(outPath, buffer)
  console.log('[v0] wrote', outPath)
}

async function main() {
  const publicDir = resolve(process.cwd(), 'public')

  // Light OS theme -> dark icon
  await renderPng(
    buildSvg({ size: 32, bg: '#000000', fg: '#ffffff' }),
    resolve(publicDir, 'icon-light-32x32.png'),
  )

  // Dark OS theme -> light icon
  await renderPng(
    buildSvg({ size: 32, bg: '#ffffff', fg: '#000000' }),
    resolve(publicDir, 'icon-dark-32x32.png'),
  )

  // Apple touch icon (180x180, dark background for iOS home screen contrast)
  await renderPng(
    buildSvg({ size: 180, bg: '#000000', fg: '#ffffff' }),
    resolve(publicDir, 'apple-icon.png'),
  )
}

main().catch((err) => {
  console.error('[v0] favicon generation failed:', err)
  process.exit(1)
})
