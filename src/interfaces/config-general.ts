// ============================================================================
// CONFIGURACIÓN GENERAL · Contratos del backend (v1)
// Guía: docs/GUIA-INTEGRACION-CONFIG-GENERAL-WEB.md
// ============================================================================

// ─── Dominios ───────────────────────────────────────────────────────────────

export type CodigoDominioConfig = 'CASA_CENTRAL' | 'PAIS' | 'MONEDA';

/** Ítem devuelto por GET /dominios/:codigo/valores (atributos ya parseado). */
export interface DominioValorItemDto {
  id: string;
  dominioId: string;
  padreId: string | null;
  codigo: string;
  nombre: string;
  valor: string;
  ordenMenu: number;
  atributos: Record<string, unknown> | null;
  activo: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Objeto DominioValor anidado en GET /config-general.
 * Ojo: aquí `atributos` llega como STRING JSON sin parsear.
 */
export interface DominioValorAnidadoDto extends Omit<DominioValorItemDto, 'atributos'> {
  atributos: string | null;
}

// ─── ConfigGeneral ──────────────────────────────────────────────────────────

export interface ConfigGeneralDto {
  id: string;
  codigoInterno: string;
  nombreComercial: string;

  codigoCasaCentral: string;
  casaCentralValor?: DominioValorAnidadoDto | null;

  pais: string;
  paisValor?: DominioValorAnidadoDto | null;

  monedaPrincipal: string;
  monedaValor?: DominioValorAnidadoDto | null;

  /** "YYYY-MM-DD" */
  fechaCierre: string;
  fechaApertura: string;
  cierreMensual: string;

  nit: string;
  codigoSIB: string;
  registroMercadoValores: string;
  representanteLegal: string;
  /** 13 dígitos */
  dpiRepresentante: string;
  direccionFiscal: string;

  /** "HH:MM" */
  horaInicioOp: string;
  horaCierreOp: string;

  activo: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Campos editables aceptados por UpdateConfigGeneralDto (whitelist). */
export type CampoConfigGeneral =
  | 'codigoInterno'
  | 'nombreComercial'
  | 'codigoCasaCentral'
  | 'pais'
  | 'monedaPrincipal'
  | 'fechaCierre'
  | 'fechaApertura'
  | 'cierreMensual'
  | 'nit'
  | 'codigoSIB'
  | 'registroMercadoValores'
  | 'representanteLegal'
  | 'dpiRepresentante'
  | 'direccionFiscal'
  | 'horaInicioOp'
  | 'horaCierreOp';

export interface UpdateConfigGeneralRequest extends Partial<Record<CampoConfigGeneral, string>> {
  /** 10–500 caracteres, obligatoria. */
  justificacion: string;
  /** 1–10; solo si cambian fechas protegidas. */
  auth_code?: string;
}

export interface UpdateConfigGeneralResponse {
  success: boolean;
  statusCode: string;
  path: string;
  timestamp: string;
  message: string;
  data: ConfigGeneralDto;
  metadata: { camposModificados: string[] } | null;
}

// ─── Bitácora ───────────────────────────────────────────────────────────────

export type AccionBitacoraConfig = 'INSERT' | 'UPDATE' | 'SOFT_DELETE';
export type OrigenBitacoraConfig = 'API' | 'PROCESO_CIERRE' | 'MIGRACION_SEED';

/** Snapshot plano del registro (sin relaciones). */
export type SnapshotConfigGeneral = Record<string, unknown> | null;

export interface UsuarioBitacoraDto {
  id: string;
  nombreCompleto: string;
  userName: string;
  correo?: string;
  activo?: boolean;
  rolId?: string;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface BitacoraAutorizacionResumenDto {
  id: string;
  endpoint: string;
  metodo_http: string;
  /** String JSON (nunca contiene auth_code). */
  body_request: string;
  solicitanteId: string;
  autorizadorId: string;
  permisoId: string;
  created_at: string;
}

export interface BitacoraConfigGeneralDto {
  id: string;
  registroId: string;
  accion: AccionBitacoraConfig;
  versionAnterior: SnapshotConfigGeneral | string;
  versionNueva: SnapshotConfigGeneral | string;
  camposModificados: string[] | string | null;
  justificacion: string | null;
  estacionIp: string | null;
  usuarioId: string | null;
  usuario: UsuarioBitacoraDto | null;
  bitacoraAutorizacionId: string | null;
  bitacoraAutorizacion: BitacoraAutorizacionResumenDto | null;
  origen: OrigenBitacoraConfig;
  created_at: string;
}

export interface BitacoraConfigQuery {
  page?: number;
  limit?: number;
  todos?: boolean;
  busqueda?: string;
  usuarioId?: string;
  accion?: AccionBitacoraConfig;
  origen?: OrigenBitacoraConfig;
  /** "YYYY-MM-DD" */
  fechaDesde?: string;
  /** "YYYY-MM-DD" */
  fechaHasta?: string;
  campoModificado?: string;
}

export interface BitacoraConfigMetadata {
  total: number;
  page: number;
  limit: number;
}

export interface BitacoraConfigResponse {
  success: boolean;
  statusCode: string;
  path: string;
  timestamp: string;
  message: string;
  data: BitacoraConfigGeneralDto[];
  metadata: BitacoraConfigMetadata | null;
}

// ─── Autorización por PIN ───────────────────────────────────────────────────

export interface ValidarAutorizacionRequest {
  auth_code: string;
  permisoId: string;
}

export interface ValidarAutorizacionData {
  solicitanteId: string;
  solicitanteNombre: string;
  solicitanteUsuario: string;
  autorizadorId: string;
  autorizadorNombre: string;
  autorizadorUsuario: string;
  permisoId: string;
  permisoCodigo: string;
  permisoModulo: string;
  permisoAccion: string;
  fuenteAutorizacion: 'rol' | 'usuario';
}

export interface ValidarAutorizacionResponse {
  success: boolean;
  statusCode: string;
  path: string;
  timestamp: string;
  message: string;
  data: ValidarAutorizacionData;
  metadata: null;
}

// ─── Permisos de la interfaz ────────────────────────────────────────────────

export interface MisPermisosData {
  usuarioId: string;
  rol: string | null;
  esAdmin: boolean;
  permisos: string[];
}

export const PERMISO_CONFIG_GENERAL_LEER = 'CONFIG_GENERAL_LEER';
export const PERMISO_CONFIG_GENERAL_EDITAR = 'CONFIG_GENERAL_EDITAR';
export const PERMISO_BITACORA_CONFIG_LEER = 'BITACORA_CONFIG_LEER';

/** Fechas que disparan la autorización por PIN. */
export const CAMPOS_FECHA_PROTEGIDA: readonly CampoConfigGeneral[] = [
  'fechaCierre',
  'fechaApertura',
  'cierreMensual',
];

/** Etiquetas para diff, historial y filtros. */
export const ETIQUETAS_CAMPO_CONFIG: Record<CampoConfigGeneral, string> = {
  codigoInterno: 'Código interno',
  nombreComercial: 'Nombre comercial',
  codigoCasaCentral: 'Casa central',
  pais: 'País',
  monedaPrincipal: 'Moneda principal',
  fechaCierre: 'Fecha de cierre',
  fechaApertura: 'Fecha de apertura',
  cierreMensual: 'Cierre mensual',
  nit: 'NIT',
  codigoSIB: 'Código SIB',
  registroMercadoValores: 'Registro mercado de valores',
  representanteLegal: 'Representante legal',
  dpiRepresentante: 'DPI del representante',
  direccionFiscal: 'Dirección fiscal',
  horaInicioOp: 'Hora de inicio',
  horaCierreOp: 'Hora de cierre',
};
