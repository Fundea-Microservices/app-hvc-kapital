import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IPermisoUsuario } from '../../interfaces/auth';

type PermisoUsuarioResponse = ApiResponse<IPermisoUsuario>;
type PermisoUsuarioListResponse = ApiResponse<IPermisoUsuario[]>;

/**
 * PermisoUsuarioService — Excepciones de permisos POR USUARIO.
 *
 * Endpoints (docs/api.json):
 *  - GET    /auth/permisos/usuario                      → lista asignaciones (filtrable por usuarioId)
 *  - GET    /auth/permisos/usuario/:usuarioId/:permisoId → consulta una asignación
 *  - POST   /auth/permisos/usuario                      → crea/concede excepción
 *  - PUT    /auth/permisos/usuario/:usuarioId/:permisoId → actualiza excepción (permitido/autoriza)
 *  - DELETE /auth/permisos/usuario/:usuarioId/:permisoId → revoca excepción (vuelve a heredar del rol)
 *  - POST   /auth/permisos/verificar-autorizacion        → verifica si el usuario/rol puede autorizar
 *
 * Los métodos de escritura (POST/PUT/DELETE) RE-LANZAN el error 428 para que la
 * página pueda abrir el modal de autorización (flujo dinámico de auth_code).
 * El resto de errores se notifican por toastr y se retorna null.
 */
@Injectable({
  providedIn: 'root'
})
export class PermisoUsuarioService extends HttpService {

  private readonly endpoints = {
    permisosUsuario: '/auth/permisos/usuario',
    verificarAutorizacion: '/auth/permisos/verificar-autorizacion',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  // ========================================================================
  // LECTURA
  // ========================================================================

  /**
   * Lista las excepciones de permisos asignadas directamente a usuarios.
   * GET /auth/permisos/usuario
   */
  async getPermisosUsuario(
    { usuarioId, page = 1, limit = 10, busqueda = '', all = false }:
      { usuarioId?: string; page?: number; limit?: number; busqueda?: string; all?: boolean } = {}
  ): Promise<PermisoUsuarioListResponse | null> {
    try {
      let params: any = { page, limit, busqueda };
      if (usuarioId) params.usuarioId = usuarioId;
      if (all) params.todos = true;

      const resp = await firstValueFrom(
        this.get<PermisoUsuarioListResponse>(`${this.endpoints.permisosUsuario}`, params)
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoUsuarioService ~ getPermisosUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener los permisos del usuario', 'Error');
      return null;
    }
  }

  /**
   * Consulta una asignación permiso-usuario concreta.
   * GET /auth/permisos/usuario/:usuarioId/:permisoId
   */
  async getPermisoUsuario(
    usuarioId: string,
    permisoId: string
  ): Promise<PermisoUsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<PermisoUsuarioResponse>(`${this.endpoints.permisosUsuario}/${usuarioId}/${permisoId}`)
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoUsuarioService ~ getPermisoUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener la asignación del permiso', 'Error');
      return null;
    }
  }

  /**
   * Verifica si un usuario (o su rol) puede autorizar un permiso específico.
   * POST /auth/permisos/verificar-autorizacion
   * Retorna { tieneAutorizacion: boolean, fuente: 'rol' | 'usuario' | null }
   */
  async verificarAutorizacion(
    usuarioId: string,
    permisoId: string
  ): Promise<ApiResponse<{ tieneAutorizacion: boolean; fuente: string | null }> | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ApiResponse<{ tieneAutorizacion: boolean; fuente: string | null }>>(
          this.endpoints.verificarAutorizacion,
          { usuarioId, permisoId }
        )
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoUsuarioService ~ verificarAutorizacion ~ error:', error);
      return null;
    }
  }

  // ========================================================================
  // ESCRITURA (re-lanzan 428 → flujo de autorización con modal auth_code)
  // ========================================================================

  /**
   * Crea una excepción de permiso para un usuario.
   * POST /auth/permisos/usuario
   *
   * @param permitido true = concede el permiso, false = lo deniega explícitamente
   * @param autoriza  true = el usuario puede autorizar acciones de este permiso
   */
  async asignar(
    usuarioId: string,
    permisoId: string,
    permitido: boolean = true,
    autoriza: boolean = false
  ): Promise<PermisoUsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.post<PermisoUsuarioResponse>(`${this.endpoints.permisosUsuario}`, {
          usuarioId,
          permisoId,
          permitido,
          autoriza,
        })
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      // El 428 (requiere autorización) se propaga para abrir el modal de auth_code
      if (error.status === 428) throw error;
      console.log('🚀 ~ PermisoUsuarioService ~ asignar ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al asignar el permiso al usuario', 'Error');
      return null;
    }
  }

  /**
   * Actualiza una excepción existente (conmuta entre conceder/denegar).
   * PUT /auth/permisos/usuario/:usuarioId/:permisoId
   */
  async actualizar(
    usuarioId: string,
    permisoId: string,
    permitido: boolean,
    autoriza: boolean = false
  ): Promise<PermisoUsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.put<PermisoUsuarioResponse>(
          `${this.endpoints.permisosUsuario}/${usuarioId}/${permisoId}`,
          { permitido, autoriza }
        )
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      // El 428 (requiere autorización) se propaga para abrir el modal de auth_code
      if (error.status === 428) throw error;
      console.log('🚀 ~ PermisoUsuarioService ~ actualizar ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al actualizar el permiso del usuario', 'Error');
      return null;
    }
  }

  /**
   * Revoca una excepción: el permiso vuelve a heredarse del rol.
   * DELETE /auth/permisos/usuario/:usuarioId/:permisoId
   */
  async revocar(
    usuarioId: string,
    permisoId: string
  ): Promise<PermisoUsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<PermisoUsuarioResponse>(
          `${this.endpoints.permisosUsuario}/${usuarioId}/${permisoId}`
        )
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      // El 428 (requiere autorización) se propaga para abrir el modal de auth_code
      if (error.status === 428) throw error;
      console.log('🚀 ~ PermisoUsuarioService ~ revocar ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al revocar el permiso del usuario', 'Error');
      return null;
    }
  }

}
