import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { HttpService } from '../../../../services/HttpService';
import { ApiResponse } from '../../../../interfaces/api-response';
import { ICarousel } from '../../../../interfaces/config';
import { environment } from '../../../../environments/environment';
import { BannerCarrusel } from './carousel.models';
import { mapearBanners } from './carousel.mapper';

/** Banners vigentes del usuario del token (JWT adjuntado por HttpService). */
const ENDPOINT_BANNERS = '/config/carrusel/obtener';
/** Sirve la imagen por nombre de archivo; es público, no exige JWT. */
const ENDPOINT_IMAGEN = '/config/carrusel/imagen';
const TIEMPO_LIMITE_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class CarouselBannersService extends HttpService {
  constructor() {
    super(inject(HttpClient));
  }

  /**
   * Devuelve los banners normalizados. Cualquier fallo (red, 401, envoltura
   * inválida, timeout) se resuelve con `[]`: el dashboard nunca se rompe.
   */
  async obtenerBanners(): Promise<BannerCarrusel[]> {
    try {
      const resp = await firstValueFrom(
        this.get<ApiResponse<ICarousel[]>>(ENDPOINT_BANNERS).pipe(timeout(TIEMPO_LIMITE_MS)),
      );
      // Contrato BaseService: sólo `success === true` es una respuesta válida.
      if (resp.body?.success !== true) return [];
      return mapearBanners(resp.body.data, (fotoUrl) => this.resolverImagen(fotoUrl));
    } catch (error) {
      console.warn('[CARRUSEL] No se pudieron cargar los banners.', error);
      return [];
    }
  }

  /**
   * URL usable en `<img src>`:
   * - absoluta (http/https): se respeta tal cual.
   * - ruta relativa (`storage/carrusel/x.jpg`): se reduce a su nombre de archivo
   *   y se sirve por el endpoint público de imagen del carrusel.
   */
  resolverImagen(fotoUrl: string | null): string | null {
    const ruta = (fotoUrl || '').trim();
    if (!ruta) return null;
    if (/^https?:\/\//i.test(ruta)) return ruta;

    const archivo = ruta.split(/[?#]/)[0].split('/').filter(Boolean).pop();
    if (!archivo) return null;

    return `${environment.apiPath}${ENDPOINT_IMAGEN}/${encodeURIComponent(archivo)}`;
  }
}
