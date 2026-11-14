/**
 * A photo much longer or taller than the square-ish frame of the gallery (a switch or a soundbar
 * from the front, over 2.5:1): in the frame it is a thin strip (audit 14.11 pkt 4).
 */
export function isStripPhoto(image: { width: number; height: number }): boolean {
  if (!image.width || !image.height) return false
  const ratio = image.width / image.height
  return ratio > 2.5 || ratio < 0.4
}
