/**
 * Shrink large profile images before upload so a 4–5MB pick stays under
 * production gateway/parser limits (often ~4.5–5MB for the whole request).
 */
const MAX_DIMENSION = 1920
const TARGET_BYTES = Math.floor(3.5 * 1024 * 1024)

export async function prepareProfileImageForUpload(file: File): Promise<File> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        return file
    }
    if (file.size <= TARGET_BYTES) {
        return file
    }

    try {
        const bitmap = await createImageBitmap(file)
        let width = bitmap.width
        let height = bitmap.height
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
            width = Math.round(width * scale)
            height = Math.round(height * scale)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            bitmap.close()
            return file
        }
        ctx.drawImage(bitmap, 0, 0, width, height)
        bitmap.close()

        let blob: Blob | null = null
        for (let quality = 0.85; quality >= 0.5; quality -= 0.1) {
            blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/jpeg', quality)
            })
            if (blob && blob.size <= TARGET_BYTES) {
                break
            }
        }

        if (!blob || blob.size >= file.size) {
            return file
        }

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'profile'
        return new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        })
    } catch {
        return file
    }
}
