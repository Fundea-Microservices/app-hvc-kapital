import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ICarouselSlide } from '../../../../interfaces/config';
import { CarouselImagenComponent } from '../carousel-imagen/carousel-imagen';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';

export type CanalPreview = 'web' | 'app';

/**
 * Simula cómo se verá el carrusel en la web (banner ancho) o en la app
 * (tarjeta dentro de un marco de teléfono). Con más de una diapositiva
 * rota sola y permite navegar con flechas y puntos.
 */
@Component({
  selector: 'app-carousel-preview',
  standalone: true,
  imports: [NgTemplateOutlet, CarouselImagenComponent, CustomIconComponent],
  templateUrl: './carousel-preview.html',
  styleUrl: './carousel-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselPreviewComponent {
  slides = input<ICarouselSlide[]>([]);
  canal = input<CanalPreview>('web');
  autoplay = input<boolean>(true);
  intervaloMs = input<number>(5000);

  indice = signal(0);
  pausado = signal(false);

  total = computed(() => this.slides().length);
  actual = computed(() => this.slides()[Math.min(this.indice(), Math.max(this.total() - 1, 0))] ?? null);

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Si cambia la cantidad de diapositivas, se vuelve a la primera.
    effect(() => {
      this.total();
      this.indice.set(0);
    });

    effect(() => {
      this.detener();
      if (this.autoplay() && this.total() > 1 && !this.pausado()) {
        this.timer = setInterval(() => this.siguiente(), this.intervaloMs());
      }
    });

    inject(DestroyRef).onDestroy(() => this.detener());
  }

  siguiente() {
    if (this.total() < 2) return;
    this.indice.update((i) => (i + 1) % this.total());
  }

  anterior() {
    if (this.total() < 2) return;
    this.indice.update((i) => (i - 1 + this.total()) % this.total());
  }

  irA(i: number) {
    this.indice.set(i);
  }

  private detener() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
