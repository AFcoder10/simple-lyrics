export type RGBColor = [number, number, number];

export interface ColorPaletteResult {
  mainColor: RGBColor;
  palette: RGBColor[];
}

export function rgbArrayToString(rgb: RGBColor): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function calculateDistance(c1: RGBColor, c2: RGBColor): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];

  return dr * dr + dg * dg + db * db;
}

export function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex color
  let match = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (match) {
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
    };
  }
  // Handle rgb color
  match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  return null;
}

// Helper function to determine if text should be black or white based on background color
export function getContrastingTextColor(backgroundColor: string): string {
  const rgb = parseColor(backgroundColor);
  if (!rgb) {
    return '#FFFFFF'; // Default to white if color parsing fails
  }
  // Calculate luminance using the YIQ formula
  const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return luminance >= 128 ? '#000000' : '#FFFFFF';
}

export async function extractColorsWithKMeans(image: HTMLImageElement, k: number): Promise<ColorPaletteResult> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not get Canvas 2D context');
  }

  const MAX_WIDTH = 100;
  const scale = MAX_WIDTH / image.width;
  canvas.width = MAX_WIDTH;
  canvas.height = image.height * scale;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixels: RGBColor[] = [];

  const PIXEL_SAMPLE_RATE = 5;
  for (let i = 0; i < imageData.length; i += 4 * PIXEL_SAMPLE_RATE) {
    if (imageData[i + 3] > 128) {
      pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
    }
  }

  if (pixels.length === 0) {
    // Fallback when the image is transparent or empty.
    return { mainColor: [18, 18, 18], palette: [[50, 50, 50], [50, 50, 50], [50, 50, 50]] };
  }

  // K-Means

  let centroids: RGBColor[] = [];
  const usedIndices = new Set<number>();
  while (centroids.length < k && centroids.length < pixels.length) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (!usedIndices.has(idx)) {
      centroids.push(pixels[idx]);
      usedIndices.add(idx);
    }
  }

  const MAX_ITERATIONS = 20;
  let clusters: RGBColor[][] = [];

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    clusters = Array.from({ length: k }, () => []);
    for (const pixel of pixels) {
      let minDistance = Infinity;
      let closestCentroidIdx = 0;
      for (let i = 0; i < centroids.length; i++) {
        const distance = calculateDistance(pixel, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIdx = i;
        }
      }
      clusters[closestCentroidIdx].push(pixel);
    }

    let converged = true;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) {
        continue;
      }

      const center: RGBColor = [0, 0, 0];
      for (const pixel of clusters[i]) {
        center[0] += pixel[0];
        center[1] += pixel[1];
        center[2] += pixel[2];
      }
      
      const clusterSize = clusters[i].length;
      const newCentroid: RGBColor = [
        Math.round(center[0] / clusterSize),
        Math.round(center[1] / clusterSize),
        Math.round(center[2] / clusterSize),
      ];

      if (calculateDistance(newCentroid, centroids[i]) > 0.1) {
        converged = false;
      }
      centroids[i] = newCentroid;
    }

    if (converged) {
      break;
    }
  }

  const result = centroids.map((centroid, i) => ({
    color: centroid,
    size: clusters[i].length,
  }));

  result.sort((a, b) => b.size - a.size);

  const mainColor = result[0]?.color || [18, 18, 18];
  const palette = result.slice(1).map((p) => p.color);

  return { mainColor, palette };
}