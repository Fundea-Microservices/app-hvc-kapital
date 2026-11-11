import { EstadoVigencia, ICarousel } from '../../../interfaces/config';

/** Formatos que acepta la categoría `carousel` del storage del API. */
export const CAROUSEL_TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const CAROUSEL_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif';
export const CAROUSEL_MAX_BYTES = 5 * 1024 * 1024;

/** Guatemala es UTC−6 todo el año (sin horario de verano). */
const OFFSET_GUATEMALA_MIN = -6 * 60;

/** ISO del API → Date. Si viene sin zona (UTC sin "Z"), se interpreta como UTC. */
function parsearIso(iso?: string | null): Date | null {
  if (!iso) return null;
  const conZona = /Z$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const fecha = new Date(conZona);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * ISO del API → valor para <input type="date"> ("YYYY-MM-DD") con el día
 * de Guatemala, sin depender de la zona horaria del navegador.
 */
export function isoAFechaInput(iso?: string | null): string {
  const fecha = parsearIso(iso);
  if (!fecha) return '';
  const enGuatemala = new Date(fecha.getTime() + OFFSET_GUATEMALA_MIN * 60_000);
  return enGuatemala.toISOString().slice(0, 10);
}

/** Día "Mostrar desde" → inicio de ese día (00:00:00) en hora de Guatemala. */
export function fechaInicioAIso(fecha?: string | null): string | null {
  return fecha ? `${fecha}T00:00:00-06:00` : null;
}

/**
 * Día "Mostrar hasta" → último segundo de ese día (23:59:59) en hora de Guatemala.
 * Sin milisegundos: `datetime` de SQL Server redondea .999 al día siguiente.
 */
export function fechaFinAIso(fecha?: string | null): string | null {
  return fecha ? `${fecha}T23:59:59-06:00` : null;
}

/** Calcula si el elemento se muestra hoy según su rango de fechas. */
export function estadoVigencia(item: Pick<ICarousel, 'fechaInicio' | 'fechaFin'>, ahora = new Date()): EstadoVigencia {
  const inicio = parsearIso(item.fechaInicio);
  const fin = parsearIso(item.fechaFin);
  if (!inicio && !fin) return 'siempre';
  if (inicio && inicio > ahora) return 'programado';
  if (fin && fin < ahora) return 'vencido';
  return 'vigente';
}

export const ETIQUETA_VIGENCIA: Record<EstadoVigencia, { texto: string; clases: string }> = {
  siempre: { texto: 'Siempre', clases: 'bg-blue-50 text-blue-700 border-blue-200' },
  vigente: { texto: 'Vigente', clases: 'bg-green-50 text-green-700 border-green-200' },
  programado: { texto: 'Programado', clases: 'bg-amber-50 text-amber-700 border-amber-200' },
  vencido: { texto: 'Vencido', clases: 'bg-danger-50 text-danger border-danger/30' },
};

/** "admin1, jperez,," → ['admin1', 'jperez'] */
export function usuariosATexto(lista: string[]): string | null {
  const limpia = lista.map((u) => u.trim()).filter(Boolean);
  return limpia.length ? limpia.join(',') : null;
}

export function textoAUsuarios(texto?: string | null): string[] {
  return (texto || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

/** Valida un archivo antes de enviarlo. Devuelve el mensaje de error o null. */
export function validarImagen(file: File): string | null {
  if (!CAROUSEL_TIPOS_IMAGEN.includes(file.type)) {
    return 'Formato no permitido. Use JPG, PNG, WEBP o GIF.';
  }
  if (file.size > CAROUSEL_MAX_BYTES) {
    return 'La imagen supera el máximo de 5MB.';
  }
  return null;
}
