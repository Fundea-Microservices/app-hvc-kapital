import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import { EstadoTipoUsuarioFiltro, ITipoUsuario } from '../../interfaces/auth';

type TipoUsuarioListResponse = ApiResponse<ITipoUsuario[]>;

export interface GetTiposUsuarioParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  /** true → envía `todos` e ignora la paginación. */
  all?: boolean;
  /** todos (por defecto) · activos · inactivos */
  estado?: EstadoTipoUsuarioFiltro;
}

/** Catálogo /auth/tipos-usuario (INVERSOR, EMPLEADO, ...). */
@Injectable({ providedIn: 'root' })
export class TipoUsuarioService extends HttpService {
  private readonly endpoint = '/auth/tipos-usuario';

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  async getTiposUsuario(params: GetTiposUsuarioParams = {}): Promise<TipoUsuarioListResponse | null> {
    try {
      const { page = 1, limit = 10, busqueda = '', all, estado } = params;
      const query: Record<string, string | number | boolean> = { page, limit };
      if (busqueda) query['busqueda'] = busqueda;
      if (all) query['todos'] = true;
      if (estado) query['estado'] = estado;

      const resp = await firstValueFrom(this.get<TipoUsuarioListResponse>(this.endpoint, query));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ TipoUsuarioService ~ getTiposUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener tipos de usuario', 'Error');
      return null;
    }
  }
}
