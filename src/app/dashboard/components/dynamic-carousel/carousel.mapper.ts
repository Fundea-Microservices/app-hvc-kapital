import { ICarousel } from '../../../../interfaces/config';
import { BannerCarrusel } from './carousel.models';

const esTexto = (valor: unknown): valor is string => typeof valor === 'string' && valor.trim().length > 0;
const textoONull = (valor: unknown): string | null => (esTexto(valor) ? valor.trim() : null);

/** Destino ya clasificado según su origen. */
export interface DestinoBanner {
  urlExterna: string | null;
  rutaInterna: string | null;
}

const SIN_DESTINO: DestinoBanner = { urlExterna: null, rutaInterna: null };

/**
 * Sólo http/https. En web un `javascript:` en redireccionUrl sería XSS;
 * cualquier otro esquema (mailto:, data:, file:) se descarta.
 *
 * `esExterno` (bandera del API) decide el modo de apertura:
 * - true  → URL absoluta para abrir en pestaña nueva (`target="_blank"`).
 * - false → ruta de este origen para navegar con `routerLink`.
 *
 * Excepción: si `esExterno` es false pero el enlace apunta a otro dominio, el
 * Router no puede resolverlo; se devuelve como externo para no romper el
 * destino. Las rutas relativas se resuelven contra el origen actual.
 */
export function resolverDestino(valor: unknown, esExterno = false): DestinoBanner {
  if (!esTexto(valor)) return SIN_DESTINO;
  try {
    const url = new URL(valor.trim(), window.location.origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return SIN_DESTINO;
    if (esExterno || url.origin !== window.location.origin) {
      return { urlExterna: url.href, rutaInterna: null };
    }
    return { urlExterna: null, rutaInterna: url.pathname + url.search + url.hash };
  } catch {
    return SIN_DESTINO;
  }
}

/** Orden numérico ascendente; los valores inválidos van al final sin romper el sort. */
const ordenSeguro = (valor: unknown): number =>
  typeof valor === 'number' && Number.isFinite(valor) ? valor : Number.MAX_SAFE_INTEGER;

/**
 * Normaliza la respuesta de `GET /config/carrusel/obtener`:
 * descarta elementos sin id/título y los no visibles en web, deduplica por
 * `carouselId` y ordena por `orden` con desempate estable por id.
 *
 * `resolverImagen` desacopla este mapper de `environment` y del endpoint de imagen.
 */
export function mapearBanners(
  items: unknown,
  resolverImagen: (fotoUrl: string | null) => string | null,
): BannerCarrusel[] {
  if (!Array.isArray(items)) return [];

  const vistos = new Set<string>();
  const ordenados: { orden: number; banner: BannerCarrusel }[] = [];

  for (const item of items as Partial<ICarousel>[]) {
    if (!item || typeof item !== 'object') continue;

    const carouselId = item.carouselId;
    const titulo = item.titulo;
    if (!esTexto(carouselId) || !esTexto(titulo)) continue;
    // `obtener` no filtra por canal: el cliente decide; aquí sólo la web.
    if (item.visibleWeb !== true) continue;
    if (vistos.has(carouselId)) continue;
    vistos.add(carouselId);

    const subtitulo = textoONull(item.subtitulo);
    const esExterno = item.esExterno === true;
    const destino = resolverDestino(item.redireccionUrl, esExterno);
    ordenados.push({
      orden: ordenSeguro(item.orden),
      banner: {
        carouselId,
        titulo: titulo.trim(),
        subtitulo,
        descripcion: textoONull(item.descripcion),
        textoBoton: textoONull(item.textoBoton),
        esExterno,
        urlExterna: destino.urlExterna,
        rutaInterna: destino.rutaInterna,
        imagenUrl: resolverImagen(textoONull(item.fotoUrl)),
      },
    });
  }

  return ordenados
    .sort((a, b) => a.orden - b.orden || a.banner.carouselId.localeCompare(b.banner.carouselId))
    .map(({ banner }) => banner);
}
