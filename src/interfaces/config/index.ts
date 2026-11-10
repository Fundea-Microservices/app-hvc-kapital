/**
 * Elemento del carrusel (tabla config.Carousel).
 * Las fechas llegan del API como ISO con offset, ej. "2026-11-01T06:00:00+00:00".
 */
export interface ICarousel {
  carouselId: string;
  titulo: string;
  subtitulo?: string | null;
  codigo?: string | null;
  descripcion?: string | null;
  /** Ruta relativa al API (storage/carrusel/x.jpg) o URL absoluta. */
  fotoUrl: string;
  redireccionUrl?: string | null;
  orden: number;
  visibleWeb: boolean;
  visibleApp: boolean;
  /** Códigos de usuario separados por coma. null = visible para todos. */
  usuarios?: string | null;
  textoBoton?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  /** true: redireccionUrl abre el navegador; false: ruta interna. */
  esExterno: boolean;
  activo: boolean;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

/** Campos editables que acepta el API en POST/PUT /config/carrusel. */
export type ICarouselPayload = Omit<
  ICarousel,
  'carouselId' | 'created_at' | 'updated_at' | 'deleted_at' | 'fotoUrl'
> & { fotoUrl?: string };

/** Estado de vigencia calculado a partir de fechaInicio / fechaFin. */
export type EstadoVigencia = 'siempre' | 'vigente' | 'programado' | 'vencido';

/** Datos mínimos que necesita la vista previa para pintar una diapositiva. */
export interface ICarouselSlide {
  titulo: string;
  subtitulo?: string | null;
  descripcion?: string | null;
  textoBoton?: string | null;
  fotoUrl?: string | null;
  /** Fuente ya resuelta (ej. objectURL de un archivo local). Tiene prioridad sobre fotoUrl. */
  imagenSrc?: string | null;
}
