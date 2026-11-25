import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import { IPermiso } from '../../interfaces/auth';
import {
  PERMISO_CONFIG_GENERAL_EDITAR,
  ValidarAutorizacionData,
  ValidarAutorizacionResponse,
} from '../../interfaces/config-general';

type PermisoListResponse = ApiResponse<IPermiso[]>;

/**
 * Flujo de autorización de Configuración General.
 *
 * Importante: NO se usa `POST /auth/usuarios/ejecutar-con-autorizacion`
 * (no propaga @GetUser/@Req en esta ruta). El `auth_code` se pre-valida aquí
 * y luego viaja en el mismo PATCH /config-general.
 */
@Injectable({ providedIn: 'root' })
export class ConfigGeneralAuthService extends HttpService {
  private readonly endpoints = {
    validar: '/auth/usuarios/validar-autorizacion',
    permisos: '/auth/permisos',
  };

  /** Cache del UUID del permiso durante la sesión de la página. */
  private permisoIdCache: string | null = null;

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  /** Resuelve el UUID de CONFIG_GENERAL_EDITAR (necesario para validar el PIN). */
  async obtenerPermisoId(): Promise<string | null> {
    if (this.permisoIdCache) return this.permisoIdCache;

    try {
      const resp = await firstValueFrom(
        this.get<PermisoListResponse>(this.endpoints.permisos, {
          todos: true,
          busqueda: PERMISO_CONFIG_GENERAL_EDITAR,
        })
      );
      if (!resp.body?.success) return null;

      const permiso = (resp.body.data ?? []).find(
        (p) => (p.codigo ?? '').toUpperCase() === PERMISO_CONFIG_GENERAL_EDITAR
      );
      if (!permiso?.id) {
        this.toastr.error(
          `No está configurado el permiso ${PERMISO_CONFIG_GENERAL_EDITAR}.`,
          'Permiso no encontrado'
        );
        return null;
      }

      this.permisoIdCache = permiso.id;
      return permiso.id;
    } catch (error: any) {
      console.log('🚀 ~ ConfigGeneralAuthService ~ obtenerPermisoId ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al obtener el permiso de configuración general',
        'Error'
      );
      return null;
    }
  }

  /** POST /auth/usuarios/validar-autorizacion — valida el PIN sin ejecutar nada. */
  async validarCodigo(
    auth_code: string,
    permisoId: string
  ): Promise<ValidarAutorizacionData | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ValidarAutorizacionResponse>(this.endpoints.validar, {
          auth_code: auth_code.trim(),
          permisoId,
        })
      );
      if (resp.body?.success) return resp.body.data;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ ConfigGeneralAuthService ~ validarCodigo ~ error:', error);
      const mensaje = error?.error?.message;
      this.toastr.error(
        Array.isArray(mensaje)
          ? mensaje.join(' · ')
          : mensaje || 'Código de autorización inválido',
        'Autorización rechazada'
      );
      return null;
    }
  }
}
