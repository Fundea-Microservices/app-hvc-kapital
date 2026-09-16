import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  EjecutarConAutorizacionRequest,
  EjecutarConAutorizacionResponse,
  RequiereAutorizacionResponse,
} from '../../interfaces/authorization';
import { ApiResponse } from '../../interfaces/api-response';

type EjecutarResponse = ApiResponse<EjecutarConAutorizacionResponse>;

/**
 * Datos pendientes que se guardan cuando el backend retorna 428.
 * Se usan para reintentar la petición después de obtener el auth_code.
 */
interface PendingRequest {
  endpoint: string;
  metodoHttp: string;
  body?: any;
  params?: Record<string, string>;
  /** Callback que se ejecuta si la autorización es exitosa */
  onSuccess?: (data: EjecutarConAutorizacionResponse) => void;
  /** Callback que se ejecuta si la autorización falla */
  onError?: (error: any) => void;
}

@Injectable({ providedIn: 'root' })
export class AutorizacionService extends HttpService {

  private readonly endpoints = {
    ejecutarConAutorizacion: '/auth/usuarios/ejecutar-con-autorizacion',
  };

  // ============================================================================
  // ESTADO DEL MODAL (Signals)
  // ============================================================================

  /** Indica si el modal de autorización está abierto */
  private _modalAbierto = signal<boolean>(false);

  /** Datos del permiso que requiere autorización (viene del 428) */
  private _datosAutorizacion = signal<RequiereAutorizacionResponse | null>(null);

  /** Petición pendiente que se reintentará después de la autorización */
  private _pendingRequest = signal<PendingRequest | null>(null);

  /** Indica si se está procesando la autorización (loading state) */
  private _procesando = signal<boolean>(false);

  // Lectura pública de signals
  public modalAbierto = this._modalAbierto.asReadonly();
  public datosAutorizacion = this._datosAutorizacion.asReadonly();
  public procesando = this._procesando.asReadonly();

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  // ============================================================================
  // EJECUTAR ACCIÓN
  // ============================================================================

  /**
   * Intenta ejecutar una acción a través del endpoint ejecutar-con-autorizacion.
   *
   * Si el backend retorna 428 (requiere autorización):
   * - Guarda la petición pendiente
   * - Abre el modal de autorización
   * - Retorna null (no es error, es flujo normal)
   *
   * Si el backend retorna 200:
   * - Retorna la respuesta con los datos de ejecución y autorización
   */
  async ejecutar(request: EjecutarConAutorizacionRequest): Promise<EjecutarConAutorizacionResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.post<EjecutarResponse>(`${this.endpoints.ejecutarConAutorizacion}`, request)
      );

      if (resp.body?.success) {
        return resp.body.data;
      }
      return null;
    } catch (error: any) {
      // Detectar 428 (requiere autorización) — no es error, es flujo normal
      if (error.status === 428) {        
        this.abrirModal(error.error);
        return null;
      }

      // Otro error: mostrar toastr
      console.log('🚀 ~ AutorizacionService ~ ejecutar ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al ejecutar la acción',
        'Error'
      );
      return null;
    }
  }

  // ============================================================================
  // EJECUTAR CON CALLBACKS (para integración en componentes)
  // ============================================================================

  /**
   * Versión de ejecutar() que acepta callbacks de éxito y error.
   * Útil para integración directa en componentes que necesitan
   * ejecutar lógica adicional al completar la autorización.
   */
  async ejecutarConCallbacks(
    request: Omit<EjecutarConAutorizacionRequest, 'auth_code' | 'permisoId'>,
    callbacks: {
      onSuccess?: (data: EjecutarConAutorizacionResponse) => void;
      onError?: (error: any) => void;
    } = {},
    datos428?: RequiereAutorizacionResponse,
  ): Promise<void> {
    // El 428 ya fue recibido por la petición original del service CRUD (el
    // service lo re-lanza y la página lo captura antes de llamar aquí), así
    // que NO se vuelve a consultar el backend: se guarda la petición pendiente
    // y se abre el modal directamente.
    // NOTA: enviar un "probe" a /ejecutar-con-autorizacion sin permisoId ni
    // auth_code solo produce un 400 de validación (el DTO los exige), por lo
    // que la detección de 428 en esa llamada era código muerto.    
    this._pendingRequest.set({
      endpoint: request.endpoint,
      metodoHttp: request.metodoHttp,
      body: request.body,
      params: request.params,
      onSuccess: callbacks.onSuccess,
      onError: callbacks.onError,
    });    
    this._datosAutorizacion.set(datos428 ?? null);    
    this._modalAbierto.set(true);    
  }

  // ============================================================================
  // GESTIÓN DEL MODAL
  // ============================================================================

  /**
   * Abre el modal de autorización con los datos del permiso.
   * Se llama automáticamente cuando se detecta un 428.
   */
  private abrirModal(datos: RequiereAutorizacionResponse): void {
    this._datosAutorizacion.set(datos);
    this._modalAbierto.set(true);
  }

  /**
   * Abre el modal de autorización manualmente (para uso externo).
   * Permite abrir el modal sin haber recibido un 428 previamente.
   */
  abrirModalManual(
    datos: RequiereAutorizacionResponse,
    pendingRequest: PendingRequest
  ): void {
    this._datosAutorizacion.set(datos);
    this._pendingRequest.set(pendingRequest);
    this._modalAbierto.set(true);
  }

  /**
   * Confirma la autorización con el auth_code ingresado por el usuario.
   * Reintenta la petición pendiente con el código de autorización.
   */
  async confirmarAutorizacion(authCode: string): Promise<void> {
    const pending = this._pendingRequest();
    const datos = this._datosAutorizacion();

    if (!pending || !datos) {
      this.cerrarModal();
      return;
    }

    this._procesando.set(true);

    const request: EjecutarConAutorizacionRequest = {
      endpoint: pending.endpoint,
      metodoHttp: pending.metodoHttp,
      body: pending.body,
      params: pending.params,
      permisoId: datos.permisoId,
      auth_code: authCode,
    };

    try {
      const resp = await firstValueFrom(
        this.post<EjecutarResponse>(`${this.endpoints.ejecutarConAutorizacion}`, request)
      );

      if (resp.body?.success) {
        this.toastr.success(
          resp.body.message || 'Acción ejecutada exitosamente',
          'Autorización Aceptada'
        );
        pending.onSuccess?.(resp.body.data);
      } else {
        // Error en la respuesta (no es error HTTP, es respuesta del backend con success=false)
        const errorMsg = resp.body?.message || 'Error al ejecutar con autorización';
        this.toastr.error(errorMsg, 'Error de Autorización');
        pending.onError?.(resp.body);
      }
    } catch (error: any) {
      // Diferenciar tipos de error según el status HTTP y el mensaje del backend
      const backendMsg = error?.error?.message || '';
      const statusCode = error?.status;

      if (statusCode === 403) {
        // Sin permisos para autorizar o auto-autorización
        if (backendMsg.toLowerCase().includes('propia') || backendMsg.toLowerCase().includes('mismo')) {
          // El usuario intenta autorizar su propia acción
          this.toastr.error(
            'No puede autorizar su propia acción',
            'Error de Autorización'
          );
        } else {
          // No tiene permisos para autorizar este permiso
          this.toastr.error(
            'No tiene permisos para autorizar',
            'Sin Permisos'
          );
        }
      } else if (statusCode === 400 || statusCode === 401) {
        // Código de autorización inválido
        this.toastr.error(
          backendMsg || 'Código de autorización inválido',
          'Error de Autorización'
        );
      } else {
        // Otro error (500, red, etc.)
        this.toastr.error(
          backendMsg || 'Error al procesar la autorización',
          'Error'
        );
      }

      pending.onError?.(error);
    } finally {
      this._procesando.set(false);
      this.cerrarModal();
    }
  }

  /**
   * Cierra el modal de autorización y limpia todo el estado.
   */
  cerrarModal(): void {
    this._modalAbierto.set(false);
    this._datosAutorizacion.set(null);
    this._pendingRequest.set(null);
    this._procesando.set(false);
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Verifica si un error es un 428 (requiere autorización).
   * Útil para que los componentes puedan detectar el caso.
   */
  esError428(error: any): boolean {
    return error?.status === 428;
  }

  /**
   * Extrae los datos de autorización de un error 428.
   * Retorna null si no es un error 428.
   */
  extraerDatosAutorizacion(error: any): RequiereAutorizacionResponse | null {
    if (this.esError428(error)) {
      return error.error;
    }
    return null;
  }
}
