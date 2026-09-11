import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../HttpService';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../interfaces/api-response';
import { IUsuario } from '../../interfaces/auth';
import { StorageService, StorageUploadData } from '../storage.service';

type UsuarioResponse = ApiResponse<IUsuario>;
type UsuarioListResponse = ApiResponse<IUsuario[]>;

@Injectable({ providedIn: 'root' })
export class UsuariosService extends HttpService {
  private readonly endpoints = {
    usuarios: '/auth/usuarios',
    cambiarClave: '/auth/usuarios/cambiar-clave',
    resetClave: '/auth/usuarios/reset-clave',
    porAuthCode: '/auth/usuarios/por-auth-code',
  };

  constructor(http: HttpClient, private toastr: ToastrService, private storage: StorageService) {
    super(http);
  }

  /**
   * Los `<select>` opcionales devuelven '' (y 'undefined' si la opción se pintó
   * sin id). El API valida UUID, así que esos valores deben viajar como undefined.
   */
  private limpiarId(valor?: string | null): string | undefined {
    if (!valor || valor === 'undefined' || valor === 'null') return undefined;
    return valor;
  }

  async getUsuarios({ page = 1, limit = 10, busqueda = '', all = false , puestoNombre = ''} = {}): Promise<UsuarioListResponse | null> {
    try {
      let params: any = { page, limit, busqueda };
      if (all) params = { ...params, todos: all };
      if (puestoNombre) params = { ...params, puestoNombre}
      const resp = await firstValueFrom(this.get<UsuarioListResponse>(`${this.endpoints.usuarios}`, params));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ getUsuarios ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener usuarios', 'Error');
      return null;
    }
  }

  async getUsuario(usuarioId: string): Promise<UsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(this.get<UsuarioResponse>(`${this.endpoints.usuarios}/${usuarioId}`));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ getUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al obtener usuario', 'Error');
      return null;
    }
  }

async createUsuario(usuario: Omit<IUsuario, 'usuarioId' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<UsuarioResponse | null> {
    try {
      const {
        nombre1,
        nombre2,
        nombre3,
        apellido1,
        apellido2,
        apellido3,
        nombreCompleto,
        userName,
        correo,
        clave,
        rolId,
        puestoId,
        sucursal_id,
        sucursalId,
        fotoUrl,
        huella,
        activo,
        documento,
        tipoDocumento,        
        lastPasswordUpdate,
        auth_code,
        autoriza
      } = usuario as any;

      // 1. Calcular nombreCompleto si no se provee
      const calculatedFullName = nombreCompleto && nombreCompleto.trim() !== ''
        ? nombreCompleto
        : [nombre1, nombre2, nombre3, apellido1, apellido2, apellido3]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

      // 2. Resolver IDs obligatorios y opcionales
      const finalRolId = rolId ?? (usuario as any)?.rol?.id ?? (usuario as any)?.rol?.rolId;
      const finalSucursalId = sucursalId ?? sucursal_id;
      const finalPuestoId = puestoId && puestoId.trim() !== '' ? puestoId : undefined;

      // 3. Payload base con los campos requeridos por el DTO
      const rawPayload: Record<string, any> = {
        nombreCompleto: calculatedFullName,
        nombre1: nombre1 || '',
        apellido1: apellido1 || '',
        userName: userName || '',
        correo: correo || '',
        rolId: finalRolId,
        activo: activo ?? true,        
      };

      // 4. Agregar opcionales solo si tienen valor real
      if (clave && clave.trim() !== '') rawPayload['clave'] = clave;
      if (nombre2 && nombre2.trim() !== '') rawPayload['nombre2'] = nombre2;
      if (nombre3 && nombre3.trim() !== '') rawPayload['nombre3'] = nombre3;
      if (apellido2 && apellido2.trim() !== '') rawPayload['apellido2'] = apellido2;
      if (apellido3 && apellido3.trim() !== '') rawPayload['apellido3'] = apellido3;
      if (documento && documento.trim() !== '') rawPayload['documento'] = documento;
      if (tipoDocumento && tipoDocumento.trim() !== '') rawPayload['tipoDocumento'] = tipoDocumento;

      if (finalPuestoId) rawPayload['puestoId'] = finalPuestoId;
      if (finalSucursalId && finalSucursalId.trim() !== '') rawPayload['sucursalId'] = finalSucursalId;
      if (fotoUrl && fotoUrl.trim() !== '') rawPayload['fotoUrl'] = fotoUrl;
      if (huella && huella.trim() !== '') rawPayload['huella'] = huella;
      if (auth_code && auth_code.trim() !== '') rawPayload['auth_code'] = auth_code;
      if (autoriza !== undefined && autoriza !== null) rawPayload['autoriza'] = autoriza;

      // NOTA: Si el backend ya tiene @Type(() => Date) en el DTO, puedes descomentar la siguiente línea:
      // if (lastPasswordUpdate) rawPayload['lastPasswordUpdate'] = new Date(lastPasswordUpdate).toISOString();

      console.log('📤 [createUsuario] Payload final enviado:', rawPayload);

      const resp = await firstValueFrom(
        this.post<UsuarioResponse>(`${this.endpoints.usuarios}`, rawPayload)
      );

      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;

    } catch (error: any) {
      if (error.status === 428) throw error;
      console.error('🚀 ~ UsuariosService ~ createUsuario ~ error:', error);

      const apiMessage = Array.isArray(error?.error?.message)
        ? error.error.message.join(' | ')
        : error?.error?.message;

      this.toastr.error(apiMessage || 'Error al crear usuario', 'Error de Validación');
      return null;
    }
  }

  async updateUsuario(usuario: IUsuario): Promise<UsuarioResponse | null> {
    try {
      const { id, nombre1, nombre2, nombre3, apellido1, apellido2, apellido3, userName, correo, rolId, puestoId, sucursalId, activo, auth_code, autoriza } = usuario as any;

      // Calcular nombreCompleto igual que en createUsuario
      const nombreCompleto = [nombre1, nombre2, nombre3, apellido1, apellido2, apellido3]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      const payload: Record<string, any> = {
        nombreCompleto,
        nombre1, nombre2, nombre3, apellido1, apellido2, apellido3,
        userName, correo, rolId,
        puestoId: this.limpiarId(puestoId),
        sucursalId: this.limpiarId(sucursalId),
        activo,
      };

      // Agregar auth_code y autoriza solo si tienen valor
      if (auth_code && auth_code.trim() !== '') payload['auth_code'] = auth_code;
      if (autoriza !== undefined && autoriza !== null) payload['autoriza'] = autoriza;

      const resp = await firstValueFrom(this.put<UsuarioResponse>(`${this.endpoints.usuarios}/${id}`, payload));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      console.log('🚀 ~ UsuariosService ~ updateUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al actualizar usuario', 'Error');
      return null;
    }
  }

  async deleteUsuario(usuarioId: string): Promise<UsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(this.delete<UsuarioResponse>(`${this.endpoints.usuarios}/${usuarioId}`));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      if (error.status === 428) throw error;
      console.log('🚀 ~ UsuariosService ~ deleteUsuario ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al eliminar usuario', 'Error');
      return null;
    }
  }

  async cambiarClave(usuarioId: string, claveAnterior: string, claveNueva: string): Promise<ApiResponse | null> {
    try {
      const resp = await firstValueFrom(this.post<ApiResponse>(`${this.endpoints.cambiarClave}`, { usuarioId, claveAnterior, claveNueva }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Contraseña actualizada', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ cambiarClave ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al cambiar contraseña', 'Error');
      return null;
    }
  }

  async resetClave(usuarioId: string, claveNueva: string): Promise<ApiResponse | null> {
    try {
      const resp = await firstValueFrom(this.post<ApiResponse>(this.endpoints.resetClave, { usuarioId, claveNueva }));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message || 'Contraseña restablecida', 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ UsuariosService ~ resetClave ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al restablecer contraseña', 'Error');
      return null;
    }
  }

  /**
   * Busca un usuario por su auth_code.
   * GET /auth/usuarios/por-auth-code/:auth_code
   *
   * Retorna el usuario si:
   * - El auth_code existe
   * - El usuario está activo
   * - El usuario tiene autoriza = true
   *
   * Retorna null si no se encuentra o hay error.
   * Útil para validar unicidad de auth_code al crear/editar usuarios.
   */
  async getUsuarioByAuthCode(authCode: string): Promise<UsuarioResponse | null> {
    try {
      const resp = await firstValueFrom(
        this.get<UsuarioResponse>(`${this.endpoints.porAuthCode}/${encodeURIComponent(authCode)}`)
      );
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      // 400 con AUTH-19-02 significa que no existe usuario con ese auth_code
      // Esto es un resultado válido (no es error para nosotros)
      if (error?.status === 400) return null;
      console.log('🚀 ~ UsuariosService ~ getUsuarioByAuthCode ~ error:', error);
      this.toastr.error(error?.error?.message || 'Error al buscar usuario por auth_code', 'Error');
      return null;
    }
  }

  /**
   * Sube la imagen de perfil usando el nuevo endpoint POST /v1/storage/upload/perfil.
   * Delega a StorageService.uploadPerfil.
   */
  async uploadPerfil(file: File, userName: string): Promise<ApiResponse<StorageUploadData> | null> {
    return this.storage.uploadPerfil(file, userName);
  }
}
