import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import {
  ConfigPoliticaPayload,
  IConfigPolitica,
  IConfigPoliticaModulo,
  ReorderConfigDto,
} from '../../interfaces/config';

export interface GetConfigPoliticasParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  activo?: boolean;
  moduloId?: string;
  /** true → `todos=true`, ignora paginación. */
  todos?: boolean;
}

export type ConfigPoliticaResponse = ApiResponse<IConfigPolitica>;
export type ConfigPoliticaListResponse = ApiResponse<IConfigPolitica[]>;
export type ConfigPoliticaModuloResponse = ApiResponse<IConfigPoliticaModulo>;

/**
 * Catálogo de políticas de configuración (`/config/politicas`).
 * Las escrituras re-lanzan el 428 para que la página abra el modal de PIN.
 */
@Injectable({ providedIn: 'root' })
export class ConfigPoliticaService extends HttpService {
  private readonly endpoints = {
    base: '/config/politicas',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  async getPoliticas(params: GetConfigPoliticasParams = {}): Promise<ConfigPoliticaListResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ConfigPoliticaListResponse>(this.endpoints.base, this.toParams(params))
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      this.showError(error, 'Error al obtener las políticas de configuración');
      return null;
    }
  }

  async getPolitica(id: string): Promise<ConfigPoliticaResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ConfigPoliticaResponse>(`${this.endpoints.base}/${id}`)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      this.showError(error, 'Error al obtener la política');
      return null;
    }
  }

  async createPolitica(payload: ConfigPoliticaPayload): Promise<ConfigPoliticaResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.post<ConfigPoliticaResponse>(this.endpoints.base, payload)
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Política creada', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al crear la política');
      return null;
    }
  }

  async updatePolitica(id: string, payload: Partial<ConfigPoliticaPayload>): Promise<ConfigPoliticaResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.patch<ConfigPoliticaResponse>(`${this.endpoints.base}/${id}`, payload)
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Política actualizada', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al actualizar la política');
      return null;
    }
  }

  async deletePolitica(id: string): Promise<ConfigPoliticaResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<ConfigPoliticaResponse>(`${this.endpoints.base}/${id}`)
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Política eliminada', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al eliminar la política');
      return null;
    }
  }

  /**
   * PATCH /config/politicas/reorder
   * Mueve la política dentro de su módulo y desplaza a las hermanas.
   */
  async reorderPolitica(payload: ReorderConfigDto): Promise<ConfigPoliticaResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.patch<ConfigPoliticaResponse>(`${this.endpoints.base}/reorder`, payload)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      this.showError(error, 'Error al reordenar la política');
      return null;
    }
  }

  /** GET /config/politicas/:politicaId/modulo */
  async getModuloDePolitica(politicaId: string): Promise<ConfigPoliticaModuloResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ConfigPoliticaModuloResponse>(`${this.endpoints.base}/${politicaId}/modulo`)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      this.showError(error, 'Error al obtener el módulo de la política');
      return null;
    }
  }

  private toParams(params: GetConfigPoliticasParams): Record<string, any> {
    const result: Record<string, any> = {};
    if (params.page !== undefined) result['page'] = params.page;
    if (params.limit !== undefined) result['limit'] = params.limit;
    if (params.busqueda) result['busqueda'] = params.busqueda;
    if (params.activo !== undefined) result['activo'] = params.activo;
    if (params.moduloId) result['moduloId'] = params.moduloId;
    if (params.todos) result['todos'] = true;
    return result;
  }

  private showError(error: any, fallback: string): void {
    console.log('🚀 ~ ConfigPoliticaService ~ error:', error);
    const raw = error?.error?.message;
    const message = Array.isArray(raw) ? raw.join('\n') : raw || fallback;
    this.toastr.error(message, 'Error');
  }
}
