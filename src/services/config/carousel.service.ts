import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from '../HttpService';
import { ApiResponse } from '../../interfaces/api-response';
import { ICarousel, ICarouselPayload } from '../../interfaces/config';
import { environment } from '../../environments/environment';

export interface GetCarouselsParams {
  page?: number;
  limit?: number;
  busqueda?: string;
  all?: boolean;
  activo?: boolean;
  visibleWeb?: boolean;
  visibleApp?: boolean;
  /** Solo los que se muestran hoy según fechaInicio / fechaFin. */
  vigente?: boolean;
}

export type CarouselResponse = ApiResponse<ICarousel>;
export type CarouselListResponse = ApiResponse<ICarousel[]>;

/**
 * CRUD de /config/carousel y manejo de sus imágenes.
 * Las imágenes se sirven por GET /storage/carousel/:fileName, que exige JWT,
 * por eso se descargan como Blob y se exponen como objectURL.
 */
@Injectable({ providedIn: 'root' })
export class CarouselService extends HttpService {
  private readonly endpoint = '/config/carousel';
  private readonly cliente = inject(HttpClient);
  private readonly toastr = inject(ToastrService);

  /** fotoUrl → objectURL. Se guarda la promesa para no repetir descargas en paralelo. */
  private readonly cacheImagenes = new Map<string, Promise<string | null>>();

  constructor() {
    super(inject(HttpClient));
  }

  async getCarousels(params: GetCarouselsParams = {}): Promise<CarouselListResponse | null> {
    try {
      const { page = 1, limit = 10, busqueda = '', all, activo, visibleWeb, visibleApp, vigente } = params;
      const query: Record<string, string | number | boolean> = { page, limit };
      if (busqueda) query['busqueda'] = busqueda;
      if (all) query['todos'] = true;
      if (activo !== undefined) query['activo'] = activo;
      if (visibleWeb !== undefined) query['visibleWeb'] = visibleWeb;
      if (visibleApp !== undefined) query['visibleApp'] = visibleApp;
      if (vigente) query['vigente'] = true;

      const resp = await firstValueFrom(this.get<CarouselListResponse>(this.endpoint, query));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ CarouselService ~ getCarousels ~ error:', error);
      this.toastr.error(this.mensajeError(error, 'Error al obtener el carrusel'), 'Error');
      return null;
    }
  }

  async getCarousel(carouselId: string): Promise<CarouselResponse | null> {
    try {
      const resp = await firstValueFrom(this.get<CarouselResponse>(`${this.endpoint}/${carouselId}`));
      if (resp.body?.success) return resp.body;
      return null;
    } catch (error: any) {
      console.log('🚀 ~ CarouselService ~ getCarousel ~ error:', error);
      this.toastr.error(this.mensajeError(error, 'Error al obtener el elemento'), 'Error');
      return null;
    }
  }

  /**
   * Crea un elemento. Con `imagen` se envía como multipart (el API la sube y
   * llena fotoUrl); sin ella se envía JSON y payload.fotoUrl es obligatorio.
   */
  async createCarousel(payload: ICarouselPayload, imagen?: File | null): Promise<CarouselResponse | null> {
    try {
      const resp = imagen
        ? await firstValueFrom(this.postMultipart<CarouselResponse>(this.endpoint, this.aFormData(payload, imagen)))
        : await firstValueFrom(this.post<CarouselResponse>(this.endpoint, payload));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ CarouselService ~ createCarousel ~ error:', error);
      this.toastr.error(this.mensajeError(error, 'Error al crear el elemento'), 'Error');
      return null;
    }
  }

  /** Actualización parcial: solo se envían los campos indicados. */
  async updateCarousel(
    carouselId: string,
    payload: Partial<ICarouselPayload>,
    { silencioso = false }: { silencioso?: boolean } = {},
  ): Promise<CarouselResponse | null> {
    try {
      const resp = await firstValueFrom(this.put<CarouselResponse>(`${this.endpoint}/${carouselId}`, payload));
      if (resp.body?.success) {
        if (!silencioso) this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ CarouselService ~ updateCarousel ~ error:', error);
      this.toastr.error(this.mensajeError(error, 'Error al actualizar el elemento'), 'Error');
      return null;
    }
  }

  /** Carga o reemplaza la imagen: PUT /config/carousel/:id/imagen (multipart). */
  async cambiarImagen(carouselId: string, imagen: File): Promise<CarouselResponse | null> {
    try {
      const form = new FormData();
      form.append('file', imagen);
      const resp = await firstValueFrom(
        this.putMultipart<CarouselResponse>(`${this.endpoint}/${carouselId}/imagen`, form),
      );
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ CarouselService ~ cambiarImagen ~ error:', error);
      this.toastr.error(this.mensajeError(error, 'Error al cambiar la imagen'), 'Error');
      return null;
    }
  }

  async deleteCarousel(carouselId: string): Promise<CarouselResponse | null> {
    try {
      const resp = await firstValueFrom(this.delete<CarouselResponse>(`${this.endpoint}/${carouselId}`));
      if (resp.body?.success) {
        this.toastr.success(resp.body.message, 'Éxito');
        return resp.body;
      }
      return null;
    } catch (error: any) {
      console.log('🚀 ~ CarouselService ~ deleteCarousel ~ error:', error);
      this.toastr.error(this.mensajeError(error, 'Error al eliminar el elemento'), 'Error');
      return null;
    }
  }

  /**
   * Devuelve una URL usable en <img src> para una fotoUrl del API.
   * - URL absoluta (http/https/data/blob): se usa tal cual.
   * - Ruta relativa (storage/carousel/x.jpg): se descarga con el token y se
   *   cachea como objectURL durante la sesión.
   */
  obtenerImagenUrl(fotoUrl?: string | null): Promise<string | null> {
    const ruta = (fotoUrl || '').trim();
    if (!ruta) return Promise.resolve(null);
    if (/^(https?:|data:|blob:)/i.test(ruta)) return Promise.resolve(ruta);

    const enCache = this.cacheImagenes.get(ruta);
    if (enCache) return enCache;

    const promesa = this.descargarImagen(ruta);
    this.cacheImagenes.set(ruta, promesa);
    // Si falla no se deja en caché, para reintentar en el próximo render.
    promesa.then((url) => { if (!url) this.cacheImagenes.delete(ruta); });
    return promesa;
  }

  private async descargarImagen(ruta: string): Promise<string | null> {
    try {
      const relativa = ruta.startsWith('/') ? ruta : `/${ruta}`;
      const token = localStorage.getItem('token') || '';
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
      const blob = await firstValueFrom(
        this.cliente.get(`${environment.apiPath}${relativa}`, { headers, responseType: 'blob' }),
      );
      return URL.createObjectURL(blob);
    } catch (error) {
      console.log('🚀 ~ CarouselService ~ descargarImagen ~ error:', error);
      return null;
    }
  }

  /** Arma el multipart con los campos del DTO (omite vacíos) más el archivo. */
  private aFormData(payload: ICarouselPayload, imagen: File): FormData {
    const form = new FormData();
    for (const [llave, valor] of Object.entries(payload)) {
      if (valor === null || valor === undefined || valor === '') continue;
      form.append(llave, String(valor));
    }
    form.append('file', imagen);
    return form;
  }

  /** class-validator devuelve `message` como arreglo; se unen en un solo texto. */
  private mensajeError(error: any, porDefecto: string): string {
    const mensaje = error?.error?.message;
    if (Array.isArray(mensaje)) return mensaje.join('. ');
    if (error?.status === 413) return 'La imagen supera el máximo de 5MB.';
    return mensaje || porDefecto;
  }
}

export type { ICarousel, ICarouselPayload };
