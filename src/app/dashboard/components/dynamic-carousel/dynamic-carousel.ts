import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { CarouselBannersService } from './carousel-banners.service';
import { BannerCarrusel } from './carousel.models';

const INTERVALO_AUTOPLAY_MS = 5_000;
const ESPERA_FIN_SCROLL_MS = 150;

/**
 * Carrusel de banners del dashboard. Una tarjeta por vista, desplazamiento con
 * scroll-snap, autoplay pausable, flechas circulares y puntos navegables.
 * Sin datos o con error no renderiza nada (degradación silenciosa).
 */
@Component({
  selector: 'app-dynamic-carousel',
  standalone: true,
  imports: [CustomIconComponent, RouterModule],
  templateUrl: './dynamic-carousel.html',
  styleUrl: './dynamic-carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicCarouselComponent {
  private readonly servicio = inject(CarouselBannersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documento = inject(DOCUMENT);
  private readonly pista = viewChild<ElementRef<HTMLElement>>('pista');

  readonly banners = signal<BannerCarrusel[]>([]);
  readonly cargando = signal(true);
  readonly indice = signal(0);
  /** Banners cuya imagen no cargó: se pinta el placeholder local. */
  readonly imagenesFallidas = signal<ReadonlySet<string>>(new Set());
  /** Pausa por pestaña oculta. */
  readonly paginaVisible = signal(true);
  /** Pausa temporal por hover, foco o arrastre. */
  readonly interaccionActiva = signal(false);
  readonly movimientoReducido = signal(false);

  readonly hayVarios = computed(() => this.banners().length > 1);

  private esperaFinScroll: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    void this.cargarBanners();

    const win = this.documento.defaultView;
    const preferencia = win?.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (preferencia) {
      this.movimientoReducido.set(preferencia.matches);
      const alCambiar = (evento: MediaQueryListEvent) => this.movimientoReducido.set(evento.matches);
      preferencia.addEventListener('change', alCambiar);
      this.destroyRef.onDestroy(() => preferencia.removeEventListener('change', alCambiar));
    }

    const alCambiarVisibilidad = () => this.paginaVisible.set(!this.documento.hidden);
    this.documento.addEventListener('visibilitychange', alCambiarVisibilidad);

    // Al cambiar el viewport se recalcula el índice con el nuevo ancho de pista.
    const alRedimensionar = () => this.alDesplazar();
    win?.addEventListener('resize', alRedimensionar);

    this.destroyRef.onDestroy(() => {
      this.documento.removeEventListener('visibilitychange', alCambiarVisibilidad);
      win?.removeEventListener('resize', alRedimensionar);
      this.limpiarEsperaScroll();
    });

    // Un único intervalo vivo: se recrea al cambiar de banner (5 s desde la
    // última transición) y se apaga con una sola tarjeta, en pestaña oculta,
    // con interacción activa o con prefers-reduced-motion.
    effect((onCleanup) => {
      const total = this.banners().length;
      const visible = this.paginaVisible();
      const interactuando = this.interaccionActiva();
      const reducido = this.movimientoReducido();
      this.indice(); // dependencia: reinicia el conteo al cambiar de tarjeta

      if (total <= 1 || !visible || interactuando || reducido) return;

      const temporizador = setInterval(() => this.siguiente(), INTERVALO_AUTOPLAY_MS);
      onCleanup(() => clearInterval(temporizador));
    });
  }

  irA(indice: number): void {
    const total = this.banners().length;
    if (!total) return;

    // Circular y tolerante a índices negativos.
    const destino = ((indice % total) + total) % total;
    this.indice.set(destino);

    const pista = this.pista()?.nativeElement;
    if (!pista) return;
    pista.scrollTo({
      left: destino * pista.clientWidth,
      behavior: this.movimientoReducido() ? 'auto' : 'smooth',
    });
  }

  anterior(): void {
    this.irA(this.indice() - 1);
  }

  siguiente(): void {
    this.irA(this.indice() + 1);
  }

  /** El índice siempre se deriva del scroll real (nunca de un contador ciego). */
  alDesplazar(): void {
    this.limpiarEsperaScroll();
    this.esperaFinScroll = setTimeout(() => this.sincronizarIndice(), ESPERA_FIN_SCROLL_MS);
  }

  marcarImagenFallida(carouselId: string): void {
    this.imagenesFallidas.update((previas) => new Set(previas).add(carouselId));
  }

  pausar(): void {
    this.interaccionActiva.set(true);
  }

  reanudar(): void {
    this.interaccionActiva.set(false);
  }

  private async cargarBanners(): Promise<void> {
    const lista = await this.servicio.obtenerBanners();
    this.banners.set(lista);
    this.cargando.set(false);
  }

  private sincronizarIndice(): void {
    const pista = this.pista()?.nativeElement;
    if (!pista || !pista.clientWidth) return;
    const nuevo = Math.round(pista.scrollLeft / pista.clientWidth);
    if (nuevo !== this.indice()) this.indice.set(nuevo);
  }

  private limpiarEsperaScroll(): void {
    if (this.esperaFinScroll) {
      clearTimeout(this.esperaFinScroll);
      this.esperaFinScroll = null;
    }
  }
}
