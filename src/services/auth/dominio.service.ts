import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import { CodigoDominioConfig, DominioValorItemDto } from '../../interfaces/config-general';

type DominioValoresResponse = ApiResponse<DominioValorItemDto[]>;

export interface GetValoresDominioParams {
  busqueda?: string;
}

/**
 * Valores de los dominios institucionales usados por Configuración General.
 * GET /dominios/:codigo/valores ya filtra activos y ordena por ordenMenu/nombre.
 */
@Injectable({ providedIn: 'root' })
export class DominioService extends HttpService {
  private readonly endpoints = {
    valoresPorCodigo: (codigo: CodigoDominioConfig) => `/dominios/${codigo}/valores`,
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  async getValoresPorCodigo(
    codigo: CodigoDominioConfig,
    { busqueda }: GetValoresDominioParams = {}
  ): Promise<DominioValorItemDto[] | null> {
    try {
      const params: Record<string, string | boolean> = { todos: true, activo: true };
      if (busqueda) params['busqueda'] = busqueda;

      const resp = await firstValueFrom(
        this.get<DominioValoresResponse>(this.endpoints.valoresPorCodigo(codigo), params)
      );
      if (resp.body?.success) return resp.body.data ?? [];
      return null;
    } catch (error: any) {
      console.log(`🚀 ~ DominioService ~ getValoresPorCodigo(${codigo}) ~ error:`, error);
      this.toastr.error(
        error?.error?.message || `Error al obtener los valores del dominio ${codigo}`,
        'Error'
      );
      return null;
    }
  }
}
