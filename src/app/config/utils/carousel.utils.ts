import { EstadoVigencia, ICarousel } from '../../../interfaces/config';

/** Formatos que acepta la categoría `carousel` del storage del API. */
export const CAROUSEL_TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const CAROUSEL_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif';
export const CAROUSEL_MAX_BYTES = 5 * 1024 * 1024;

/** Guatemala es UTC−6 todo el año (sin horario de verano). */
const OFFSET_GUATEMALA_MIN = -6 * 60;

/**
 * ISO del API → valor para <input type="datetime-local"> en hora de Guatemala
 * ("YYYY-MM-DDTHH:mm"), sin depender de la zona horaria del navegador.
 */
export function isoAInputLocal(iso?: string | null): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  const enGuatemala = new Date(fecha.getTime() + OFFSET_GUATEMALA_MIN * 60_000);
  return enGuatemala.toISOString().slice(0, 16);
}

/** Valor de <input type="datetime-local"> (hora de Guatemala) → ISO con offset para el API. */
export function inputLocalAIso(valor?: string | null): string | null {
  if (!valor) return null;
  const conSegundos = valor.length === 16 ? `${valor}:00` : valor;
  return `${conSegundos}-06:00`;
}

/** Calcula si el elemento se muestra hoy según su rango de fechas. */
export function estadoVigencia(item: Pick<ICarousel, 'fechaInicio' | 'fechaFin'>, ahora = new Date()): EstadoVigencia {
  const inicio = item.fechaInicio ? new Date(item.fechaInicio) : null;
  const fin = item.fechaFin ? new Date(item.fechaFin) : null;
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
