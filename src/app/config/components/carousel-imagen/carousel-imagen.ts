import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CarouselService } from '../../../../services/config/carousel.service';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';

/**
 * Muestra una imagen del carrusel. Si recibe `src` la usa directamente
 * (ej. objectURL de un archivo recién elegido); si no, resuelve `fotoUrl`
 * descargándola con el token (las imágenes de storage requieren JWT).
 */
@Component({
  selector: 'app-carousel-imagen',
  standalone: true,
  imports: [CustomIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-hidden' },
  template: `
    @if (url()) {
      <img [src]="url()" [alt]="alt()" class="w-full h-full" [class]="ajuste()" />
    } @else {
      <div class="w-full h-full flex flex-col items-center justify-center gap-1 bg-hover text-primary-light">
        @if (cargando()) {
          <span class="size-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin"></span>
        } @else {
          <app-custom-icon [name]="'image-off'" [color]="'var(--hvc-primary-light)'" [size]="iconSize()" />
          @if (textoVacio()) { <span class="text-xs">{{ textoVacio() }}</span> }
        }
      </div>
    }
  `,
})
export class CarouselImagenComponent {
  private carouselService = inject(CarouselService);

  fotoUrl = input<string | null | undefined>(null);
  src = input<string | null | undefined>(null);
  alt = input<string>('Imagen del carrusel');
  /** Clases de ajuste de la imagen (object-cover / object-contain). */
  ajuste = input<string>('object-cover');
  iconSize = input<number>(20);
  textoVacio = input<string>('');

  url = signal<string | null>(null);
  cargando = signal(false);

  constructor() {
    effect(async () => {
      const directa = this.src();
      const ruta = this.fotoUrl();
      if (directa) {
        this.url.set(directa);
        return;
      }
      this.url.set(null);
      if (!ruta) return;
      this.cargando.set(true);
      const resuelta = await this.carouselService.obtenerImagenUrl(ruta);
      // Evita pintar una respuesta vieja si el input cambió mientras se descargaba.
      if (this.fotoUrl() === ruta && !this.src()) this.url.set(resuelta);
      this.cargando.set(false);
    });
  }
}
