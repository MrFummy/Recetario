/**
 * Reduce una foto antes de subirla: lado mayor de `maxLado` px, JPEG, con la
 * orientación EXIF aplicada. Una foto de móvil pesa varios MB y el Storage del plan
 * gratuito es limitado; a 1600 px y calidad 0,82 salen unos 200–400 KB sin que se
 * note en una galería.
 *
 * Los PNG con transparencia se aplanan sobre blanco (JPEG no tiene alfa). Si el
 * navegador no sabe leer el formato (HEIC fuera de Safari), lanza un error legible.
 */
export async function comprimirImagen(file: File, maxLado = 1600, calidad = 0.82): Promise<Blob> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`No se pudo leer «${file.name}» (¿formato no compatible?). Prueba con un JPG o PNG.`);
  }

  const k = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k));
  const h = Math.max(1, Math.round(bmp.height * k));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bmp.close();
    throw new Error('No se pudo preparar la imagen.');
  }
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen.'))),
      'image/jpeg',
      calidad,
    );
  });
}

/** Tamaño de las fotos de receta: la ficha las pinta a ~900 px, así que 1400 cubre pantallas retina. */
const LADO_FOTO_RECETA = 1400;
const CALIDAD_FOTO_RECETA = 0.8;

/**
 * Prepara la foto de un plato antes de mandarla: JPEG de lado mayor 1400 px, que pasa de
 * varios MB a ~200 KB. Devuelve un `File` con el mismo nombre y extensión `.jpg`, porque
 * n8n lo lee como adjunto del formulario. Si ya es pequeña se manda tal cual: recomprimir
 * un JPEG ya optimizado solo lo empeora.
 */
export async function comprimirFotoReceta(file: File): Promise<File> {
  const blob = await comprimirImagen(file, LADO_FOTO_RECETA, CALIDAD_FOTO_RECETA);
  if (blob.size >= file.size) return file;
  const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
}
