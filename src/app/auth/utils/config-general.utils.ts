import {
  CampoConfigGeneral,
  ETIQUETAS_CAMPO_CONFIG,
  SnapshotConfigGeneral,
} from '../../../interfaces/config-general';

export interface CambioConfig {
  campo: string;
  etiqueta: string;
  anterior: string;
  nuevo: string;
}

export function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** Tolera payloads con JSON ya parseado o con el string original (defensivo). */
export function normalizarJson<T>(valor: unknown, fallback: T): T {
  if (valor === null || valor === undefined) return fallback;
  if (typeof valor === 'string') {
    try {
      return JSON.parse(valor) as T;
    } catch {
      return fallback;
    }
  }
  return valor as T;
}

export function normalizarCampos(valor: unknown): string[] {
  const parseado = normalizarJson<unknown>(valor, []);
  return Array.isArray(parseado) ? parseado.map((c) => String(c)) : [];
}

/** "YYYY-MM-DD" → "DD/MM/YYYY" sin pasar por Date (evita desfase UTC). */
export function formatearFecha(valor: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const [anio, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function etiquetaCampo(campo: string): string {
  return (ETIQUETAS_CAMPO_CONFIG as Record<string, string>)[campo] ?? campo;
}

/** Convierte un valor de campo a texto legible para el diff. */
export function formatearValorCampo(campo: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '(vacío)';
  if (typeof valor === 'boolean') return valor ? 'Activo' : 'Inactivo';
  if (typeof valor === 'string') {
    if (campo === 'fechaCierre' || campo === 'fechaApertura' || campo === 'cierreMensual') {
      return formatearFecha(valor);
    }
    return valor;
  }
  return String(valor);
}

/** Diferencias entre dos snapshots planos, en el orden de `campos`. */
export function construirDiffs(
  anterior: SnapshotConfigGeneral,
  nuevo: SnapshotConfigGeneral,
  campos: readonly string[]
): CambioConfig[] {
  const base = esObjeto(anterior) ? anterior : {};
  const actual = esObjeto(nuevo) ? nuevo : {};

  return campos
    .filter((campo) => base[campo] !== actual[campo])
    .map((campo) => ({
      campo,
      etiqueta: etiquetaCampo(campo),
      anterior: formatearValorCampo(campo, base[campo]),
      nuevo: formatearValorCampo(campo, actual[campo]),
    }));
}

/** Diff a partir de versionAnterior/versionNueva/camposModificados de la bitácora. */
export function construirDiffsBitacora(evento: {
  versionAnterior: unknown;
  versionNueva: unknown;
  camposModificados: unknown;
}): CambioConfig[] {
  const anterior = normalizarJson<Record<string, unknown>>(evento.versionAnterior, {});
  const nuevo = normalizarJson<Record<string, unknown>>(evento.versionNueva, {});
  const campos = normalizarCampos(evento.camposModificados);

  return campos.map((campo) => ({
    campo,
    etiqueta: etiquetaCampo(campo),
    anterior: formatearValorCampo(campo, anterior[campo]),
    nuevo: formatearValorCampo(campo, nuevo[campo]),
  }));
}

/** Etiqueta de un DominioValor para selects y diffs. */
export function etiquetaDominio(item: { codigo: string; nombre: string } | undefined): string {
  if (!item) return '';
  return `${item.codigo} - ${item.nombre}`;
}

/** Campos editables de la pantalla, en el orden visual del prototipo. */
export const CAMPOS_FORMULARIO: readonly CampoConfigGeneral[] = [
  'codigoInterno',
  'nombreComercial',
  'codigoCasaCentral',
  'pais',
  'monedaPrincipal',
  'fechaCierre',
  'fechaApertura',
  'cierreMensual',
  'nit',
  'codigoSIB',
  'registroMercadoValores',
  'representanteLegal',
  'dpiRepresentante',
  'direccionFiscal',
  'horaInicioOp',
  'horaCierreOp',
];
