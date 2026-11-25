import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { TimezoneDatePipe } from '../../../shared/pipes/timezone-date.pipe';
import { ConfigGeneralService } from '../../../../services/auth/config-general.service';
import { DominioService } from '../../../../services/auth/dominio.service';
import {
  AccionBitacoraConfig,
  BitacoraConfigGeneralDto,
  ETIQUETAS_CAMPO_CONFIG,
  OrigenBitacoraConfig,
} from '../../../../interfaces/config-general';
import { IPagination } from '../../../../interfaces/shared';
import {
  CambioConfig,
  construirDiffsBitacora,
  etiquetaDominio,
  normalizarCampos,
} from '../../utils/config-general.utils';

@Component({
  selector: 'app-config-general-historial-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CustomIconComponent, PaginationComponent, TimezoneDatePipe],
  templateUrl: './config-general-historial-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigGeneralHistorialModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(ConfigGeneralService);
  private readonly dominioService = inject(DominioService);

  visible = input<boolean>(false);
  close = output<void>();

  loading = signal(false);
  eventos = signal<BitacoraConfigGeneralDto[]>([]);
  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });

  /** id y código de cada valor de dominio → "código - nombre" para los diffs. */
  private readonly etiquetasDominio = signal<Record<string, string>>({});
  private etiquetasCargadas = false;

  readonly acciones: AccionBitacoraConfig[] = ['INSERT', 'UPDATE', 'SOFT_DELETE'];
  readonly origenes: OrigenBitacoraConfig[] = ['API', 'PROCESO_CIERRE', 'MIGRACION_SEED'];
  readonly campos = Object.entries(ETIQUETAS_CAMPO_CONFIG).map(([campo, etiqueta]) => ({
    campo,
    etiqueta,
  }));

  filtros = this.fb.group({
    busqueda: [''],
    accion: [''],
    origen: [''],
    campoModificado: [''],
    fechaDesde: [''],
    fechaHasta: [''],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        // `cargar` escribe señales (loading/paginación): se ejecuta fuera del
        // seguimiento para evitar re-disparos del efecto.
        untracked(() => {
          void this.cargar(1);
          void this.cargarEtiquetasDominio();
        });
      }
    });
  }

  async cargar(page?: number): Promise<void> {
    if (this.loading()) return;

    const { page: actual, pageSize } = this.pagination();
    this.loading.set(true);
    try {
      const f = this.filtros.getRawValue();
      const resp = await this.configService.getBitacora({
        page: page ?? actual,
        limit: pageSize,
        busqueda: (f.busqueda ?? '').trim() || undefined,
        accion: (f.accion as AccionBitacoraConfig) || undefined,
        origen: (f.origen as OrigenBitacoraConfig) || undefined,
        campoModificado: f.campoModificado || undefined,
        fechaDesde: f.fechaDesde || undefined,
        fechaHasta: f.fechaHasta || undefined,
      });

      if (!resp) return;

      this.eventos.set(resp.data ?? []);
      this.pagination.set({
        page: resp.metadata?.page ?? page ?? actual,
        pageSize: resp.metadata?.limit ?? pageSize,
        totalItems: resp.metadata?.total ?? (resp.data?.length ?? 0),
      });
    } finally {
      this.loading.set(false);
    }
  }

  aplicar(): void {
    this.cargar(1);
  }

  limpiar(): void {
    this.filtros.reset({
      busqueda: '',
      accion: '',
      origen: '',
      campoModificado: '',
      fechaDesde: '',
      fechaHasta: '',
    });
    this.cargar(1);
  }

  onChangePage(p: IPagination): void {
    this.pagination.set({ ...p });
    this.cargar(p.page);
  }

  cerrar(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cerrar();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.cerrar();
  }

  private async cargarEtiquetasDominio(): Promise<void> {
    if (this.etiquetasCargadas) return;
    this.etiquetasCargadas = true;

    const [casas, paises, monedas] = await Promise.all([
      this.dominioService.getValoresPorCodigo('CASA_CENTRAL'),
      this.dominioService.getValoresPorCodigo('PAIS'),
      this.dominioService.getValoresPorCodigo('MONEDA'),
    ]);
    const items = [...(casas ?? []), ...(paises ?? []), ...(monedas ?? [])];
    if (items.length === 0) {
      // Permite reintentar en la próxima apertura si falló la carga.
      this.etiquetasCargadas = false;
      return;
    }

    const mapa: Record<string, string> = {};
    for (const item of items) {
      const etiqueta = etiquetaDominio(item);
      mapa[item.id] = etiqueta;
      mapa[item.codigo] = etiqueta;
    }
    this.etiquetasDominio.set(mapa);
  }

  private readonly camposDominio = new Set(['codigoCasaCentral', 'pais', 'monedaPrincipal']);

  diffsDe(evento: BitacoraConfigGeneralDto): CambioConfig[] {
    const etiquetas = this.etiquetasDominio();
    return construirDiffsBitacora(evento).map((d) => {
      if (!this.camposDominio.has(d.campo)) return d;
      return {
        ...d,
        anterior: etiquetas[d.anterior] ?? d.anterior,
        nuevo: etiquetas[d.nuevo] ?? d.nuevo,
      };
    });
  }

  camposDe(evento: BitacoraConfigGeneralDto): string[] {
    return normalizarCampos(evento.camposModificados);
  }

  etiquetaAccion(accion: AccionBitacoraConfig): string {
    switch (accion) {
      case 'INSERT':
        return 'Creación';
      case 'UPDATE':
        return 'Actualización';
      case 'SOFT_DELETE':
        return 'Eliminación';
      default:
        return accion;
    }
  }

  claseAccion(accion: AccionBitacoraConfig): string {
    switch (accion) {
      case 'INSERT':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SOFT_DELETE':
        return 'bg-danger-50 text-danger border-danger/30';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  etiquetaOrigen(origen: OrigenBitacoraConfig): string {
    switch (origen) {
      case 'API':
        return 'API';
      case 'PROCESO_CIERRE':
        return 'Proceso de cierre';
      case 'MIGRACION_SEED':
        return 'Migración / seed';
      default:
        return origen;
    }
  }

}
