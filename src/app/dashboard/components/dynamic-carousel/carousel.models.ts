/**
 * Banner listo para pintar. Todos los campos dudosos del API ya están
 * resueltos aquí: sin nulos en la plantilla y URLs validadas.
 */
export interface BannerCarrusel {
  carouselId: string;
  titulo: string;
  /** Línea superior de la tarjeta; se pinta en dorado sobre la imagen. */
  subtitulo: string | null;
  descripcion: string | null;
  /**
   * Destino absoluto hacia otro dominio (sólo http/https) o null. Se abre en
   * pestaña nueva con un `<a href>` normal.
   */
  urlExterna: string | null;
  /**
   * Ruta interna de esta aplicación (`/dashboard/...`) o null. Se navega con
   * `routerLink` dentro de la misma pestaña.
   */
  rutaInterna: string | null;
  /** URL absoluta de la imagen o null si no hay foto utilizable. */
  imagenUrl: string | null;
}
