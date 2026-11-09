import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { TimezoneDatePipe } from '../../../shared/pipes/timezone-date.pipe';
import { CarouselImagenComponent } from '../../components/carousel-imagen/carousel-imagen';
import { CanalPreview, CarouselPreviewComponent } from '../../components/carousel-preview/carousel-preview';
import { CarouselService } from '../../../../services/config/carousel.service';
import { ICarousel } from '../../../../interfaces/config';
import { IPagination } from '../../../../interfaces/shared';
import { ETIQUETA_VIGENCIA, estadoVigencia, textoAUsuarios } from '../../utils/carousel.utils';

type CampoSwitch = 'activo' | 'visibleWeb' | 'visibleApp';
type FiltroEstado = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-carousel-page',
  standalone: true,
  imports: [
    RouterLink,
    NgTemplateOutlet,
    PaginationComponent,
    CustomIconComponent,
    TimezoneDatePipe,
    CarouselImagenComponent,
    CarouselPreviewComponent,
  ],
  templateUrl: './carousel-page.html',
  styleUrl: './carousel-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselPageComponent {
  private carouselService = inject(CarouselService);
  private router = inject(Router);

  lista = signal<ICarousel[]>([]);
  isLoading = signal(false);
  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });

  // Filtros
  buscador = signal('');
  filtroEstado = signal<FiltroEstado>('todos');
  soloVigentes = signal(false);

  // Switches que se están guardando ("<id>-<campo>"), para deshabilitarlos.
  guardandoSwitch = signal<Set<string>>(new Set());

  // Eliminar
  seleccionado = signal<ICarousel | null>(null);
  eliminando = signal(false);

  // Vista previa
  previewCanal = signal<CanalPreview>('web');
  previewItems = signal<ICarousel[]>([]);
  previewCargando = signal(false);
  previewSlides = computed(() =>
    this.previewItems().filter((c) => (this.previewCanal() === 'web' ? c.visibleWeb : c.visibleApp)),
  );

  readonly etiquetaVigencia = ETIQUETA_VIGENCIA;

  @ViewChild('deleteModal', { static: true }) deleteModal!: ElementRef<HTMLDivElement>;
  @ViewChild('previewModal', { static: true }) previewModal!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.fetchData();
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      setTimeout(() => (window as any).HSStaticMethods.autoInit(), 100);
    }
  }

  // ─── Datos ────────────────────────────────────────────────────────────────

  async fetchData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    try {
      const estado = this.filtroEstado();
      const resp = await this.carouselService.getCarousels({
        page: this.pagination().page,
        limit: this.pagination().pageSize,
        busqueda: this.buscador().trim(),
        activo: estado === 'todos' ? undefined : estado === 'activos',
        vigente: this.soloVigentes(),
      });
      this.lista.set(resp?.data || []);
      this.pagination.update((p) => ({ ...p, totalItems: resp?.metadata?.total ?? 0 }));
    } finally {
      this.isLoading.set(false);
    }
  }

  buscar() {
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.fetchData();
  }

  onFiltroEstado(valor: string) {
    this.filtroEstado.set(valor as FiltroEstado);
    this.buscar();
  }

  onSoloVigentes(valor: boolean) {
    this.soloVigentes.set(valor);
    this.buscar();
  }

  onChangePage(p: IPagination) {
    this.pagination.set(p);
    this.fetchData();
  }

  // ─── Switches (activo / web / app) ────────────────────────────────────────

  claveSwitch(item: ICarousel, campo: CampoSwitch) {
    return `${item.carouselId}-${campo}`;
  }

  async toggle(item: ICarousel, campo: CampoSwitch, valor: boolean) {
    const clave = this.claveSwitch(item, campo);
    if (this.guardandoSwitch().has(clave)) return;

    // Actualización optimista; si el API falla se revierte.
    this.reemplazar({ ...item, [campo]: valor });
    this.guardandoSwitch.update((s) => new Set(s).add(clave));

    const resp = await this.carouselService.updateCarousel(item.carouselId, { [campo]: valor }, { silencioso: true });
    if (resp?.success) this.reemplazar(resp.data);
    else this.reemplazar(item);

    this.guardandoSwitch.update((s) => {
      const copia = new Set(s);
      copia.delete(clave);
      return copia;
    });
  }

  private reemplazar(item: ICarousel) {
    this.lista.update((l) => l.map((c) => (c.carouselId === item.carouselId ? item : c)));
  }

  // ─── Presentación ─────────────────────────────────────────────────────────

  vigencia(item: ICarousel) {
    return this.etiquetaVigencia[estadoVigencia(item)];
  }

  cantidadUsuarios(item: ICarousel): number {
    return textoAUsuarios(item.usuarios).length;
  }

  numero(i: number) {
    const { page, pageSize } = this.pagination();
    return (page - 1) * pageSize + i + 1;
  }

  // ─── Navegación ───────────────────────────────────────────────────────────

  irANuevo() {
    this.router.navigate(['/dashboard/config/carousel/nuevo']);
  }

  irAEditar(item: ICarousel) {
    this.router.navigate(['/dashboard/config/carousel/editar', item.carouselId]);
  }

  // ─── Eliminar ─────────────────────────────────────────────────────────────

  openDeleteModal(item: ICarousel) {
    this.seleccionado.set(item);
    this.abrir(this.deleteModal);
  }

  async eliminar() {
    const item = this.seleccionado();
    if (!item || this.eliminando()) return;
    this.eliminando.set(true);
    try {
      const resp = await this.carouselService.deleteCarousel(item.carouselId);
      if (resp?.success) {
        this.cerrar(this.deleteModal);
        // Si era el último de la página, retrocede una.
        if (this.lista().length === 1 && this.pagination().page > 1) {
          this.pagination.update((p) => ({ ...p, page: p.page - 1 }));
        }
        await this.fetchData();
      }
    } finally {
      this.eliminando.set(false);
    }
  }

  // ─── Vista previa ─────────────────────────────────────────────────────────

  async abrirPreview() {
    this.abrir(this.previewModal);
    this.previewCargando.set(true);
    try {
      // Lo que vería un usuario hoy: activos y dentro de su rango de fechas.
      const resp = await this.carouselService.getCarousels({ all: true, activo: true, vigente: true });
      this.previewItems.set(resp?.data || []);
    } finally {
      this.previewCargando.set(false);
    }
  }

  // ─── Modales (Preline HSOverlay, mismo patrón que el resto de páginas) ─────

  private abrir(ref: ElementRef<HTMLDivElement>) {
    const el = ref.nativeElement;
    if ((window as any).HSOverlay) new (window as any).HSOverlay(el).open();
    else {
      el.classList.remove('hidden');
      el.classList.add('pointer-events-auto');
    }
  }

  /** Acepta el ElementRef (desde la clase) o la referencia de plantilla (#deleteModal). */
  cerrar(ref: ElementRef<HTMLDivElement> | HTMLElement) {
    const el = ref instanceof ElementRef ? ref.nativeElement : ref;
    if ((window as any).HSOverlay) (window as any).HSOverlay.close(el);
    else {
      el.classList.add('hidden');
      el.classList.remove('open', 'pointer-events-auto');
    }
  }
}
