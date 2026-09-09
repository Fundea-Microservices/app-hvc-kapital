import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import {
  IBitacoraAutorizacion,
  BitacoraResponse,
  BitacoraListResponse,
  BitacoraQueryParams,
  BitacoraUserQueryParams,
} from '../../interfaces/authorization';

@Injectable({ providedIn: 'root' })
export class BitacoraService extends HttpService {

  private readonly endpoints = {
    bitacora: '/auth/bitacora',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  // ============================================================================
  // LISTAR REGISTROS (paginado con búsqueda)
  // GET /auth/bitacora?page=1&limit=10&busqueda=&todos=false
  // ============================================================================

  async getRegistros({
    page = 1,
    limit = 10,
    busqueda = '',
    todos = false,
  }: BitacoraQueryParams = {}): Promise<BitacoraListResponse | null> {
    try {
      let params: any = { page, limit, busqueda };
      if (todos) params.todos = true;

      const resp = await firstValueFrom(
        this.get<BitacoraListResponse>(`${this.endpoints.bitacora}`, params)
      );

      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ BitacoraService ~ getRegistros ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al obtener registros de bitácora',
        'Error'
      );
      return null;
    }
  }

  // ============================================================================
  // VER UN REGISTRO POR ID
  // GET /auth/bitacora/:id
  // ============================================================================

  async getRegistro(id: string): Promise<BitacoraResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<BitacoraResponse>(`${this.endpoints.bitacora}/${id}`)
      );

      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ BitacoraService ~ getRegistro ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al obtener el registro',
        'Error'
      );
      return null;
    }
  }

  // ============================================================================
  // REGISTROS POR SOLICITANTE
  // GET /auth/bitacora/solicitante/:id?page=1&limit=10
  // ============================================================================

  async getRegistrosPorSolicitante(
    solicitanteId: string,
    { page = 1, limit = 10 }: BitacoraUserQueryParams = {}
  ): Promise<BitacoraListResponse | null> {
    try {
      const params: any = { page, limit };

      const resp = await firstValueFrom(
        this.get<BitacoraListResponse>(
          `${this.endpoints.bitacora}/solicitante/${solicitanteId}`,
          params
        )
      );

      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ BitacoraService ~ getRegistrosPorSolicitante ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al obtener solicitudes del usuario',
        'Error'
      );
      return null;
    }
  }

  // ============================================================================
  // PENDIENTES DE UN AUTORIZADOR
  // GET /auth/bitacora/pendientes/:id?page=1&limit=10
  // ============================================================================

  async getPendientesPorAutorizador(
    autorizadorId: string,
    { page = 1, limit = 10 }: BitacoraUserQueryParams = {}
  ): Promise<BitacoraListResponse | null> {
    try {
      const params: any = { page, limit };

      const resp = await firstValueFrom(
        this.get<BitacoraListResponse>(
          `${this.endpoints.bitacora}/pendientes/${autorizadorId}`,
          params
        )
      );

      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ BitacoraService ~ getPendientesPorAutorizador ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al obtener pendientes del autorizador',
        'Error'
      );
      return null;
    }
  }

  // ============================================================================
  // CREAR REGISTRO (opcional — uso manual)
  // POST /auth/bitacora
  // ============================================================================

  async crearRegistro(dto: {
    endpoint: string;
    body_request: string;
    solicitanteId: string;
    autorizadorId: string;
    permisoId: string;
  }): Promise<BitacoraResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.post<BitacoraResponse>(`${this.endpoints.bitacora}`, dto)
      );

      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ BitacoraService ~ crearRegistro ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al crear registro de bitácora',
        'Error'
      );
      return null;
    }
  }

  // ============================================================================
  // ELIMINAR REGISTRO (solo admin)
  // DELETE /auth/bitacora/:id
  // ============================================================================

  async eliminarRegistro(id: string): Promise<BitacoraResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.delete<BitacoraResponse>(`${this.endpoints.bitacora}/${id}`)
      );

      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ BitacoraService ~ eliminarRegistro ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al eliminar registro de bitácora',
        'Error'
      );
      return null;
    }
  }
}
