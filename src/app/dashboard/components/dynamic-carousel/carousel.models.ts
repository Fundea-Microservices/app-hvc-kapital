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
  /** Destino validado (sólo http/https) o null si no debe ser clicable. */
  destinoSeguro: string | null;
  /** URL absoluta de la imagen o null si no hay foto utilizable. */
  imagenUrl: string | null;
}
