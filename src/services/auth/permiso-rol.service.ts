import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IPermisoMatriz, IPermisoRol, IPermisoUsuario } from '../../interfaces/auth';

type MatrizListResponse = ApiResponse<IPermisoMatriz[]>;
type PermisoRolResponse = ApiResponse<IPermisoRol>;
type PermisoUsuarioResponse = ApiResponse<IPermisoUsuario>;
type PermisoUsuarioListResponse = ApiResponse<IPermisoUsuario[]>;

@Injectable({
  providedIn: 'root'
})
export class PermisoRolService extends HttpService {

  private readonly endpoints = {
    permisosRol: '/auth/permisos/rol',
    matriz: '/auth/permisos/rol/matriz',
    permisosUsuario: '/auth/permisos/usuario',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  /**
   * Matriz de permisos del rol: trae todos los permisos (filtrados/paginados)
   * marcando cada uno con `asignado` según los tenga el rol.
   * GET /auth/permisos/rol/matriz
   */
  async getMatriz(
    { rolId, codigo = '', modulo = '', accion = '', page = 1, limit = 10, all = false }:
      { rolId: string; codigo?: string; modulo?: string; accion?: string; page?: number; limit?: number; all?: boolean }
  ): Promise<MatrizListResponse | null> {
    try {
      let params: any = { rolId, page, limit };
      if (codigo) params.codigo = codigo;
      if (modulo) params.modulo = modulo;
      if (accion) params.accion = accion;
      if (all) params.todos = true;

      const resp = await firstValueFrom(this.get<MatrizListResponse>(`${this.endpoints.matriz}`, params));
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoRolService ~ getMatriz ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al obtener la matriz de permisos', 'Error');
      return null;
    }
  }

  /**
   * Asigna un permiso a un rol.
   * POST /auth/permisos/rol
   */
  async asignar(rolId: string, permisoId: string): Promise<PermisoRolResponse | null> {
    try {
      const resp = await firstValueFrom(this.post<PermisoRolResponse>(`${this.endpoints.permisosRol}`, {
        rolId,
        permisoId,
      }));
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoRolService ~ asignar ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al asignar el permiso al rol', 'Error');
      return null;
    }
  }

  /**
   * Retira un permiso de un rol.
   * DELETE /auth/permisos/rol/:rolId/:permisoId
   */
  async retirar(rolId: string, permisoId: string): Promise<PermisoRolResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<PermisoRolResponse>(`${this.endpoints.permisosRol}/${rolId}/${permisoId}`)
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log("🚀 ~ PermisoRolService ~ retirar ~ error:", error);
      this.toastr.error(error?.error?.message || 'Error al retirar el permiso del rol', 'Error');
      return null;
    }
  }

  // ========================================================================
  // PERMISOS POR USUARIO (excepciones individuales)
  // ========================================================================

  /**
   * Asigna un permiso directamente a un usuario (excepción por encima del rol).
   * POST /auth/permisos/usuario
   *
   * @param usuarioId UUID del usuario
   * @param permisoId UUID del permiso
   * @param permitido true = concede, false = niega explícitamente
   * @param autoriza si el usuario puede autorizar este permiso
   */
  async asignarPermisoUsuario(
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
        this.toastr.success(resp.body.message || 'Permiso asignado al usuario', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoRolService ~ asignarPermisoUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al asignar permiso al usuario', 'Error');
      return null;
    }
  }

  /**
   * Lista los permisos asignados directamente a un usuario.
   * GET /auth/permisos/usuario
   */
  async getPermisosUsuario(
    { usuarioId, page = 1, limit = 10, busqueda = '', all = false }:
    { usuarioId?: string; page?: number; limit?: number; busqueda?: string; all?: boolean }
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
      console.log('🚀 ~ PermisoRolService ~ getPermisosUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener permisos del usuario', 'Error');
      return null;
    }
  }

  /**
   * Actualiza la asignación de un permiso a un usuario.
   * PUT /auth/permisos/usuario/:usuarioId/:permisoId
   */
  async actualizarPermisoUsuario(
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
        this.toastr.success(resp.body.message || 'Permiso actualizado', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoRolService ~ actualizarPermisoUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al actualizar permiso del usuario', 'Error');
      return null;
    }
  }

  /**
   * Revoca un permiso asignado a un usuario.
   * DELETE /auth/permisos/usuario/:usuarioId/:permisoId
   */
  async revocarPermisoUsuario(
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
        this.toastr.success(resp.body.message || 'Permiso revocado del usuario', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoRolService ~ revocarPermisoUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al revocar permiso del usuario', 'Error');
      return null;
    }
  }

  /**
   * Verifica si un usuario tiene autorización para un permiso específico.
   * POST /auth/permisos/verificar-autorizacion
   *
   * Retorna { tieneAutorizacion: boolean, fuente: 'rol' | 'usuario' | null }
   */
  async verificarAutorizacion(
    usuarioId: string,
    permisoId: string
  ): Promise<ApiResponse<{ tieneAutorizacion: boolean; fuente: string | null }> | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ApiResponse<{ tieneAutorizacion: boolean; fuente: string | null }>>(
          '/auth/permisos/verificar-autorizacion',
          { usuarioId, permisoId }
        )
      );
      if (resp.body?.success) {
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ PermisoRolService ~ verificarAutorizacion ~ error:', error);
      return null;
    }
  }

}
