/**
 * Client-side image compression utility.
 * Resizes large camera photos down to optimized web dimensions (max 1200px)
 * and compresses with high visual fidelity at 80% quality.
 */
export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  savingsPercent: number;
}

export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.74
): Promise<CompressionResult> {
  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D rendering context'));
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp if supported, or jpeg
        const mimeType = 'image/webp';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas image conversion failed'));
              return;
            }

            const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const compressedSizeKb = Math.max(1, Math.round(blob.size / 1024));
            const previewUrl = URL.createObjectURL(blob);
            const savingsPercent = Math.max(0, Math.round((1 - compressedSizeKb / originalSizeKb) * 100));

            resolve({
              file: compressedFile,
              previewUrl,
              originalSizeKb,
              compressedSizeKb,
              width,
              height,
              canvas,
              savingsPercent,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

