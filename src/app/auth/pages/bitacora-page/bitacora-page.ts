import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { TimezoneDatePipe } from '../../../shared/pipes/timezone-date.pipe';
import { BitacoraService } from '../../../../services/auth/bitacora.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { IBitacoraAutorizacion } from '../../../../interfaces/authorization';
import type { IPagination } from '../../../../interfaces/shared';
import type { ApiMetadata } from '../../../../interfaces/api-response';

@Component({
  selector: 'app-bitacora-page',
  standalone: true,
  imports: [
    RouterLink,
    CustomIconComponent,
    PaginationComponent,
    TimezoneDatePipe,
  ],
  templateUrl: './bitacora-page.html',
  styleUrl: './bitacora-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BitacoraPageComponent {
  private bitacoraService = inject(BitacoraService);
  private authService = inject(AuthService);

  // ─── Datos ────────────────────────────────────────────────────────────
  registros = signal<IBitacoraAutorizacion[]>([]);

  // ─── Paginación ───────────────────────────────────────────────────────
  pagination = signal<IPagination>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // ─── Búsqueda y filtros ───────────────────────────────────────────────
  buscador = signal('');
  filtroVista = signal<'todos' | 'mis-solicitudes' | 'mis-pendientes'>('todos');

  // ─── Estados ──────────────────────────────────────────────────────────
  isLoading = signal(false);

  // ─── Modal de detalle ─────────────────────────────────────────────────
  registroSeleccionado = signal<IBitacoraAutorizacion | null>(null);
  guardando = signal(false);

  // ─── Computed ─────────────────────────────────────────────────────────
  esAdmin = computed(() => this.authService.getUserStorage()?.rol?.esAdmin ?? false);
  userId = computed(() => this.authService.getUserStorage()?.id ?? '');

  // ─── Referencias a modales ────────────────────────────────────────────
  @ViewChild('detalleModal', { static: true }) detalleModal!: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModal', { static: true }) deleteModal!: ElementRef<HTMLDivElement>;

  // ─── Ciclo de vida ────────────────────────────────────────────────────
  async ngOnInit() {
    this.fetchData();
  }

  ngAfterViewInit() {
    this.initializePreline();
  }

  private initializePreline() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      setTimeout(() => (window as any).HSStaticMethods.autoInit(), 100);
    }
  }

  // ─── Obtener datos ────────────────────────────────────────────────────
  async fetchData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    const { page, pageSize } = this.pagination();
    const userId = this.userId();

    let resp;
    switch (this.filtroVista()) {
      case 'mis-solicitudes':
        resp = await this.bitacoraService.getRegistrosPorSolicitante(userId, {
          page,
          limit: pageSize,
        });
        break;
      case 'mis-pendientes':
        resp = await this.bitacoraService.getPendientesPorAutorizador(userId, {
          page,
          limit: pageSize,
        });
        break;
      default:
        resp = await this.bitacoraService.getRegistros({
          page,
          limit: pageSize,
          busqueda: this.buscador(),
        });
    }

    if (resp?.success) {
      this.registros.set(resp.data || []);
      if (resp.metadata) {
        this.pagination.update((p) => ({
          ...p,
          totalItems: resp.metadata?.total || 0,
        }));
      }
      setTimeout(() => (window as any).HSStaticMethods?.autoInit(), 100);
    }

    this.isLoading.set(false);
  }

  // ─── Búsqueda ─────────────────────────────────────────────────────────
  onSearch(term: string) {
    this.buscador.set(term);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.fetchData();
  }

  // ─── Filtros ──────────────────────────────────────────────────────────
  onFiltroChange(filtro: 'todos' | 'mis-solicitudes' | 'mis-pendientes') {
    this.filtroVista.set(filtro);
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.fetchData();
  }

  // ─── Paginación ───────────────────────────────────────────────────────
  onChangePage(newPagination: IPagination) {
    this.pagination.set(newPagination);
    this.fetchData();
  }

  // ─── Modal de detalle ─────────────────────────────────────────────────
  verDetalle(registro: IBitacoraAutorizacion) {
    this.registroSeleccionado.set(registro);
    const el = this.detalleModal.nativeElement;
    if ((window as any).HSOverlay) {
      new (window as any).HSOverlay(el).open();
    } else {
      el.classList.remove('hidden');
      el.classList.add('pointer-events-auto');
    }
  }

  // ─── Modal de eliminar ────────────────────────────────────────────────
  openDeleteModal(registro: IBitacoraAutorizacion) {
    this.registroSeleccionado.set(registro);
    const el = this.deleteModal.nativeElement;
    if ((window as any).HSOverlay) {
      new (window as any).HSOverlay(el).open();
    } else {
      el.classList.remove('hidden');
      el.classList.add('pointer-events-auto');
    }
  }

  async eliminarRegistro(registro: IBitacoraAutorizacion) {
    this.guardando.set(true);
    const resp = await this.bitacoraService.eliminarRegistro(registro.id);
    if (resp?.success) {
      this.fetchData();
      this.closeAllModals();
    }
    this.guardando.set(false);
  }

  // ─── Cerrar modales ──────────────────────────────────────────────────
  closeAllModals() {
    [this.detalleModal, this.deleteModal].forEach((ref) => {
      if (ref?.nativeElement) {
        if ((window as any).HSOverlay) {
          (window as any).HSOverlay.close(ref.nativeElement);
        } else {
          ref.nativeElement.classList.add('hidden');
          ref.nativeElement.classList.remove('open', 'pointer-events-auto');
        }
      }
    });
    this.registroSeleccionado.set(null);
  }

  // ─── Utilidades para template ─────────────────────────────────────────
  getRowNumber(index: number): number {
    const { page, pageSize } = this.pagination();
    return (page - 1) * pageSize + index + 1;
  }
}
