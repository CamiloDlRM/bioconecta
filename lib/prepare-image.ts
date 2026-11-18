/**
 * Prepara una foto en el navegador antes de subirla:
 * - la reduce (lado mayor ≤ 2000 px) para que las fotos de celular, que suelen pasar
 *   de 5 MB, se puedan subir sin errores y carguen rápido en la galería;
 * - la vuelve a codificar como JPEG, lo que además borra los metadatos EXIF
 *   (incluida la ubicación GPS que guardan muchos celulares).
 * Solo se usa en componentes de cliente.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
/** Tamaño máximo del archivo original que aceptamos procesar */
export const MAX_SOURCE_BYTES = 40 * 1024 * 1024

const SERVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ATTEMPTS = [
  { side: 2000, quality: 0.82 },
  { side: 1600, quality: 0.72 },
  { side: 1200, quality: 0.65 },
]

export class PrepareImageError extends Error {}

type Source = { image: CanvasImageSource; width: number; height: number; release: () => void }

async function decode(file: File): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { image: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() }
    } catch {
      // Algunos navegadores no decodifican ciertos formatos con createImageBitmap; probamos con <img>
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return { image: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) }
  } catch {
    URL.revokeObjectURL(url)
    throw new PrepareImageError('No pudimos leer esa imagen. Prueba con una foto JPG o PNG.')
  }
}

function toJpeg(src: Source, side: number, quality: number): Promise<Blob | null> {
  const scale = Math.min(1, side / Math.max(src.width, src.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(src.width * scale))
  canvas.height = Math.max(1, Math.round(src.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  // Fondo blanco: las zonas transparentes de un PNG no quedan negras en JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src.image, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

export async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') && file.type !== '') {
    throw new PrepareImageError('El archivo debe ser una imagen.')
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new PrepareImageError('Esa imagen es demasiado grande (más de 40 MB).')
  }

  const src = await decode(file)
  try {
    // PNG o WebP livianos y pequeños se dejan tal cual (conservan transparencia y nitidez)
    const small = Math.max(src.width, src.height) <= ATTEMPTS[0].side
    if (small && file.size <= 1.5 * 1024 * 1024 && (file.type === 'image/png' || file.type === 'image/webp')) {
      return file
    }
    for (const { side, quality } of ATTEMPTS) {
      const blob = await toJpeg(src, side, quality)
      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        const name = (file.name.replace(/\.[^.]+$/, '') || 'foto') + '.jpg'
        return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
      }
    }
  } finally {
    src.release()
  }
  // Último recurso: si el original ya cumple, se envía sin cambios
  if (SERVER_TYPES.includes(file.type) && file.size <= MAX_UPLOAD_BYTES) return file
  throw new PrepareImageError('No pudimos reducir esa imagen. Prueba con otra foto.')
}
