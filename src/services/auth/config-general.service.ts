import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import {
  BitacoraConfigQuery,
  BitacoraConfigResponse,
  CampoConfigGeneral,
  ConfigGeneralDto,
  UpdateConfigGeneralRequest,
  UpdateConfigGeneralResponse,
} from '../../interfaces/config-general';

type ConfigGeneralResponse = ApiResponse<ConfigGeneralDto>;

/** Orden estable de los campos editables (mismo que usa el backend en su delta). */
const CAMPOS_ENVIABLES: readonly CampoConfigGeneral[] = [
  'codigoInterno',
  'nombreComercial',
  'codigoCasaCentral',
  'pais',
  'monedaPrincipal',
  'fechaCierre',
  'fechaApertura',
  'cierreMensual',
  'nit',
  'codigoSIB',
  'registroMercadoValores',
  'representanteLegal',
  'dpiRepresentante',
  'direccionFiscal',
  'horaInicioOp',
  'horaCierreOp',
];

@Injectable({ providedIn: 'root' })
export class ConfigGeneralService extends HttpService {
  private readonly endpoints = {
    configGeneral: '/config-general',
    bitacora: '/config-general/bitacora',
  };

  constructor(http: HttpClient, private toastr: ToastrService) {
    super(http);
  }

  /** GET /config-general — singleton con relaciones de dominio expandidas. */
  async getConfigGeneral(): Promise<ConfigGeneralDto | null> {
    try {
      const resp = await firstValueFrom(
        this.get<ConfigGeneralResponse>(this.endpoints.configGeneral)
      );
      if (resp.body?.success) return resp.body.data;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ ConfigGeneralService ~ getConfigGeneral ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al obtener la configuración general',
        'Error'
      );
      return null;
    }
  }

  /**
   * PATCH /config-general — actualización parcial.
   * Sanea el body: solo campos de la whitelist, sin vacíos, `justificacion`
   * obligatoria y `auth_code` únicamente cuando el flujo lo provee.
   */
  async updateConfigGeneral(
    request: UpdateConfigGeneralRequest
  ): Promise<UpdateConfigGeneralResponse | null> {
    try {
      const body = this.construirPayload(request);

      const resp = await firstValueFrom(
        this.patch<UpdateConfigGeneralResponse>(this.endpoints.configGeneral, body)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      // 428 no aplica en esta ruta; el mensaje real (CFG-12/13, 403, validación)
      // se muestra tal cual llega del backend, sea string o arreglo.
      console.log('🚀 ~ ConfigGeneralService ~ updateConfigGeneral ~ error:', error);
      const mensaje = error?.error?.message;
      this.toastr.error(
        Array.isArray(mensaje)
          ? mensaje.join(' · ')
          : mensaje || 'Error al actualizar la configuración general',
        error?.status === 403 ? 'Acceso denegado' : 'Error'
      );
      return null;
    }
  }

  /** GET /config-general/bitacora — paginada y filtrable. */
  async getBitacora(query: BitacoraConfigQuery = {}): Promise<BitacoraConfigResponse | null> {
    try {
      const params: Record<string, string | number | boolean> = {
        page: query.page ?? 1,
        limit: query.limit ?? 10,
      };
      if (query.todos) params['todos'] = true;
      if (query.busqueda) params['busqueda'] = query.busqueda;
      if (query.usuarioId) params['usuarioId'] = query.usuarioId;
      if (query.accion) params['accion'] = query.accion;
      if (query.origen) params['origen'] = query.origen;
      if (query.fechaDesde) params['fechaDesde'] = query.fechaDesde;
      if (query.fechaHasta) params['fechaHasta'] = query.fechaHasta;
      if (query.campoModificado) params['campoModificado'] = query.campoModificado;

      const resp = await firstValueFrom(
        this.get<BitacoraConfigResponse>(this.endpoints.bitacora, params)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ ConfigGeneralService ~ getBitacora ~ error:', error);
      this.toastr.error(
        error?.error?.message || 'Error al consultar la bitácora de configuración',
        'Error'
      );
      return null;
    }
  }

  /** Cuerpo limpio para evitar 400 por `forbidNonWhitelisted`. */
  private construirPayload(request: UpdateConfigGeneralRequest): Record<string, string> {
    const origen = request as unknown as Record<string, unknown>;
    const body: Record<string, string> = {};

    for (const campo of CAMPOS_ENVIABLES) {
      const valor = origen[campo];
      if (typeof valor !== 'string') continue;
      const limpio = valor.trim();
      if (!limpio) continue;
      body[campo] = limpio;
    }

    body['justificacion'] = (request.justificacion ?? '').trim();

    const authCode = (request.auth_code ?? '').trim();
    if (authCode) body['auth_code'] = authCode;

    return body;
  }
}
