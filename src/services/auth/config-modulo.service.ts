import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import {
  ConfigModuloPayload,
  IConfigModulo,
  ReorderConfigDto,
} from '../../interfaces/config';

export interface GetConfigModulosParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  activo?: boolean;
  /** true → `todos=true`, ignora paginación. */
  todos?: boolean;
}

export type ConfigModuloResponse = ApiResponse<IConfigModulo>;
export type ConfigModuloListResponse = ApiResponse<IConfigModulo[]>;

/**
 * Catálogo de módulos de configuración (`/config/modulos`).
 * Las escrituras re-lanzan el 428 para que la página abra el modal de PIN.
 */
@Injectable({ providedIn: 'root' })
export class ConfigModuloService extends HttpService {
  private readonly endpoints = {
    base: '/config/modulos',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  async getModulos(params: GetConfigModulosParams = {}): Promise<ConfigModuloListResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ConfigModuloListResponse>(this.endpoints.base, this.toParams(params))
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      this.showError(error, 'Error al obtener los módulos de configuración');
      return null;
    }
  }

  async getModulo(id: string): Promise<ConfigModuloResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ConfigModuloResponse>(`${this.endpoints.base}/${id}`)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      this.showError(error, 'Error al obtener el módulo');
      return null;
    }
  }

  async createModulo(payload: ConfigModuloPayload): Promise<ConfigModuloResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ConfigModuloResponse>(this.endpoints.base, payload)
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Módulo creado', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al crear el módulo');
      return null;
    }
  }

  async updateModulo(id: string, payload: Partial<ConfigModuloPayload>): Promise<ConfigModuloResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.patch<ConfigModuloResponse>(`${this.endpoints.base}/${id}`, payload)
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Módulo actualizado', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al actualizar el módulo');
      return null;
    }
  }

  async deleteModulo(id: string): Promise<ConfigModuloResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<ConfigModuloResponse>(`${this.endpoints.base}/${id}`)
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Módulo eliminado', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al eliminar el módulo');
      return null;
    }
  }

  /**
   * PATCH /config/modulos/reorder
   * El backend desplaza transaccionalmente a los demás módulos vivos.
   */
  async reorderModulo(payload: ReorderConfigDto): Promise<ConfigModuloResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.patch<ConfigModuloResponse>(`${this.endpoints.base}/reorder`, payload)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al reordenar el módulo');
      return null;
    }
  }

  private toParams(params: GetConfigModulosParams): Record<string, any> {
    const result: Record<string, any> = {};
    if (params.page !== undefined) result['page'] = params.page;
    if (params.limit !== undefined) result['limit'] = params.limit;
    if (params.busqueda) result['busqueda'] = params.busqueda;
    if (params.activo !== undefined) result['activo'] = params.activo;
    if (params.todos) result['todos'] = true;
    return result;
  }

  private showError(error: any, fallback: string): void {
    console.log('🚀 ~ ConfigModuloService ~ error:', error);
    const raw = error?.error?.message;
    const message = Array.isArray(raw) ? raw.join('\n') : raw || fallback;
    this.toastr.error(message, 'Error');
  }
}
