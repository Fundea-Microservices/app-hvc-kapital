import { IUsuario, IPermiso } from './auth';

// ============================================================================
// BITÁCORA DE AUTORIZACIÓN
// ============================================================================

/**
 * Registro de la bitácora de autorización.
 * Cada vez que se ejecuta una acción con autorización, se crea un registro.
 *
 * Backend: GET /auth/bitacora, POST /auth/bitacora, etc.
 */
export interface IBitacoraAutorizacion {
  id: string;                    // UUID del registro
  endpoint: string;              // Ruta del endpoint ejecutado (ej. "auth/usuarios")
  metodo_http?: string;          // Método HTTP (GET, POST, PUT, DELETE)
  body_request: string;          // Body de la petición original (JSON serializado)

  // IDs de las relaciones
  solicitanteId: string;         // UUID del usuario que solicitó la acción
  autorizadorId: string;         // UUID del usuario que autorizó
  permisoId: string;             // UUID del permiso requerido

  // Relaciones (incluidas en consultas con join del backend)
  solicitante?: IUsuario;        // Objeto completo del solicitante
  autorizador?: IUsuario;        // Objeto completo del autorizador
  permiso?: IPermiso;            // Objeto completo del permiso

  // Auditoría
  created_at: Date;
}

// ============================================================================
// EJECUTAR CON AUTORIZACIÓN
// ============================================================================

/**
 * Request body para el endpoint POST /auth/usuarios/ejecutar-con-autorizacion.
 *
 * El frontend envía toda la información necesaria para que el backend:
 * 1. Valide el código de autorización (auth_code)
 * 2. Valide que el autorizador tenga permisos
 * 3. Ejecute la acción original
 * 4. Registre en la bitácora
 */
export interface EjecutarConAutorizacionRequest {
  endpoint: string;              // Ruta del endpoint a ejecutar (ej. "auth/usuarios")
  metodoHttp: string;            // Método HTTP (GET, POST, PUT, DELETE)
  body?: any;                    // Body de la petición original (para POST/PUT)
  params?: Record<string, string>;  // Parámetros de ruta (para PUT/DELETE con :id)
  permisoId: string;             // UUID del permiso requerido
  auth_code: string;             // Código de autorización del autorizador
}

/**
 * Response exitoso del endpoint ejecutar-con-autorizacion.
 * Contiene tanto el resultado de la ejecución como los datos de la autorización.
 */
export interface EjecutarConAutorizacionResponse {
  ejecucion: {
    success: boolean;
    data: any;
    message: string;
  };
  autorizacion: IBitacoraAutorizacion;
}

// ============================================================================
// RESPUESTA 428 — REQUIERE AUTORIZACIÓN
// ============================================================================

/**
 * Response HTTP 428 del backend cuando una acción requiere autorización.
 *
 * El backend retorna esto cuando:
 * - El permiso de la acción tiene requires_auth = true
 * - El usuario tiene el permiso pero necesita aprobación de un autorizador
 *
 * El frontend debe mostrar un modal para ingresar auth_code.
 */
export interface RequiereAutorizacionResponse {
  requiresAuth: true;            // Flag que indica que se requiere autorización
  permisoId: string;             // UUID del permiso que requiere autorización
  permisoCodigo: string;         // Código legible del permiso (ej. "USR04")
}

// ============================================================================
// TIPOS DE RESPUESTA PARA SERVICIOS
// ============================================================================

import { ApiResponse } from './api-response';

/** Respuesta de un solo registro de bitácora */
export type BitacoraResponse = ApiResponse<IBitacoraAutorizacion>;

/** Respuesta de listado de bitácora */
export type BitacoraListResponse = ApiResponse<IBitacoraAutorizacion[]>;

/** Respuesta de ejecutar con autorización */
export type EjecutarResponse = ApiResponse<EjecutarConAutorizacionResponse>;

// ============================================================================
// PARÁMETROS DE CONSULTA
// ============================================================================

/**
 * Parámetros para listar registros de bitácora.
 * Se usa en GET /auth/bitacora
 */
export interface BitacoraQueryParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  todos?: boolean;
}

/**
 * Parámetros para listar registros por solicitante o autorizador.
 * Se usa en GET /auth/bitacora/solicitante/:id y /auth/bitacora/pendientes/:id
 */
export interface BitacoraUserQueryParams {
  page?: number;
  limit?: number;
}

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Métodos HTTP soportados por el endpoint ejecutar-con-autorizacion.
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
