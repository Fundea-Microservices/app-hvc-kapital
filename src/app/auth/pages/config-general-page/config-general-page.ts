import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { ConfigGeneralAuthModalComponent } from '../../components/config-general-auth-modal/config-general-auth-modal';
import { ConfigGeneralAuditModalComponent } from '../../components/config-general-audit-modal/config-general-audit-modal';
import { ConfigGeneralHistorialModalComponent } from '../../components/config-general-historial-modal/config-general-historial-modal';
import { ConfigGeneralService } from '../../../../services/auth/config-general.service';
import { ConfigGeneralAuthService } from '../../../../services/auth/config-general-auth.service';
import { DominioService } from '../../../../services/auth/dominio.service';
import { PermisoService } from '../../../../services/auth/permiso.service';
import { AuthService } from '../../../../services/auth/auth.service';
import {
  CAMPOS_FECHA_PROTEGIDA,
  ConfigGeneralDto,
  DominioValorItemDto,
  MisPermisosData,
  PERMISO_BITACORA_CONFIG_LEER,
  PERMISO_CONFIG_GENERAL_EDITAR,
  PERMISO_CONFIG_GENERAL_LEER,
  SnapshotConfigGeneral,
  UpdateConfigGeneralRequest,
  ValidarAutorizacionData,
} from '../../../../interfaces/config-general';
import {
  CAMPOS_FORMULARIO,
  construirDiffs,
  etiquetaDominio,
} from '../../utils/config-general.utils';

@Component({
  selector: 'app-config-general-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CustomIconComponent,
    ConfigGeneralAuthModalComponent,
    ConfigGeneralAuditModalComponent,
    ConfigGeneralHistorialModalComponent,
  ],
  templateUrl: './config-general-page.html',
  styleUrl: './config-general-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfigGeneralPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastr = inject(ToastrService);
  private readonly configService = inject(ConfigGeneralService);
  private readonly configAuthService = inject(ConfigGeneralAuthService);
  private readonly dominioService = inject(DominioService);
  private readonly permisoService = inject(PermisoService);
  private readonly authService = inject(AuthService);

  // ── Estado de datos ──────────────────────────────────────────────────
  config = signal<ConfigGeneralDto | null>(null);
  loading = signal(true);
  loadError = signal(false);
  saving = signal(false);

  casasCentrales = signal<DominioValorItemDto[]>([]);
  paises = signal<DominioValorItemDto[]>([]);
  monedas = signal<DominioValorItemDto[]>([]);

  // ── Permisos ─────────────────────────────────────────────────────────
  misPermisos = signal<MisPermisosData | null>(null);

  puedeVer = computed(() => {
    const p = this.misPermisos();
    return !!p && (p.esAdmin || p.permisos.includes(PERMISO_CONFIG_GENERAL_LEER));
  });

  puedeEditar = computed(() => {
    const p = this.misPermisos();
    return !!p && p.esAdmin && p.permisos.includes(PERMISO_CONFIG_GENERAL_EDITAR);
  });

  puedeBitacora = computed(() => {
    const p = this.misPermisos();
    return !!p && (p.esAdmin || p.permisos.includes(PERMISO_BITACORA_CONFIG_LEER));
  });

  // ── Fechas protegidas / PIN ──────────────────────────────────────────
  fechasDesbloqueadas = signal(false);
  authModalVisible = signal(false);
  authLoading = signal(false);
  authError = signal('');
  autorizacion = signal<ValidarAutorizacionData | null>(null);
  private authCode = signal<string | null>(null);

  // ── Modales de guardado / historial ──────────────────────────────────
  auditModalVisible = signal(false);
  historyModalVisible = signal(false);

  // ── Formulario ───────────────────────────────────────────────────────
  form = this.fb.group({
    codigoInterno: ['', [Validators.required, Validators.maxLength(50)]],
    nombreComercial: ['', [Validators.required, Validators.maxLength(150)]],
    codigoCasaCentral: ['', [Validators.required]],
    pais: ['', [Validators.required]],
    monedaPrincipal: ['', [Validators.required]],
    fechaCierre: ['', [Validators.required]],
    fechaApertura: ['', [Validators.required]],
    cierreMensual: ['', [Validators.required]],
    nit: ['', [Validators.required, Validators.maxLength(20)]],
    codigoSIB: ['', [Validators.required, Validators.maxLength(40)]],
    registroMercadoValores: ['', [Validators.required, Validators.maxLength(60)]],
    representanteLegal: ['', [Validators.required, Validators.maxLength(150)]],
    dpiRepresentante: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    direccionFiscal: ['', [Validators.required, Validators.maxLength(250)]],
    horaInicioOp: ['', [Validators.required]],
    horaCierreOp: ['', [Validators.required]],
  });

  private snapshot = signal<SnapshotConfigGeneral>(null);
  private formValues = signal<SnapshotConfigGeneral>(null);

  private readonly camposDominio = new Set([
    'codigoCasaCentral',
    'pais',
    'monedaPrincipal',
  ]);

  /** UUID de DominioValor → "código - nombre" para los diffs de auditoría. */
  private readonly etiquetasDominio = computed(() => {
    const mapa = new Map<string, string>();
    for (const item of [
      ...this.casasCentrales(),
      ...this.paises(),
      ...this.monedas(),
    ]) {
      mapa.set(item.id, etiquetaDominio(item));
    }
    return mapa;
  });

  cambios = computed(() => {
    const etiquetas = this.etiquetasDominio();
    return construirDiffs(this.snapshot(), this.formValues(), CAMPOS_FORMULARIO).map(
      (cambio) => {
        if (!this.camposDominio.has(cambio.campo)) return cambio;
        return {
          ...cambio,
          anterior: etiquetas.get(cambio.anterior) ?? cambio.anterior,
          nuevo: etiquetas.get(cambio.nuevo) ?? cambio.nuevo,
        };
      }
    );
  });

  dirty = computed(() => this.cambios().length > 0);

  cambiosEnFechas = computed(() =>
    this.cambios().some((c) => (CAMPOS_FECHA_PROTEGIDA as readonly string[]).includes(c.campo))
  );

  requierePin = computed(() => this.cambiosEnFechas() && !this.authCode());

  horarioInvalido = computed(() => {
    const v = this.formValues() ?? {};
    const inicio = String(v['horaInicioOp'] ?? '');
    const fin = String(v['horaCierreOp'] ?? '');
    return !!inicio && !!fin && fin <= inicio;
  });

  nombreUsuario = computed(() => this.authService.user()?.nombreCompleto ?? '');
  nombreAutorizador = computed(() => this.autorizacion()?.autorizadorNombre ?? '');
  timestampEjecucion = computed(() =>
    new Date().toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' })
  );

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valores) => this.formValues.set(valores as SnapshotConfigGeneral));
  }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);

    const [config, casas, paises, monedas, permisos] = await Promise.all([
      this.configService.getConfigGeneral(),
      this.dominioService.getValoresPorCodigo('CASA_CENTRAL'),
      this.dominioService.getValoresPorCodigo('PAIS'),
      this.dominioService.getValoresPorCodigo('MONEDA'),
      this.permisoService.getMisPermisos(),
    ]);

    this.casasCentrales.set(casas ?? []);
    this.paises.set(paises ?? []);
    this.monedas.set(monedas ?? []);
    this.misPermisos.set(permisos);

    if (config) {
      this.config.set(config);
      this.rellenarFormulario(config);
    } else {
      this.loadError.set(true);
    }

    this.loading.set(false);
  }

  // ── Autorización de fechas ───────────────────────────────────────────
  abrirAutorizacion(): void {
    if (!this.puedeEditar()) return;
    this.authError.set('');
    this.authModalVisible.set(true);
  }

  cerrarAutorizacion(): void {
    this.authModalVisible.set(false);
    this.authError.set('');
  }

  async confirmarAutorizacion(codigo: string): Promise<void> {
    if (this.authLoading()) return;

    this.authLoading.set(true);
    this.authError.set('');

    const permisoId = await this.configAuthService.obtenerPermisoId();
    if (!permisoId) {
      this.authLoading.set(false);
      this.authError.set('No se pudo resolver el permiso requerido en el servidor.');
      return;
    }

    const data = await this.configAuthService.validarCodigo(codigo, permisoId);
    this.authLoading.set(false);

    if (!data) {
      this.authError.set('Código inválido o vencido. Verifique e intente nuevamente.');
      return;
    }

    this.autorizacion.set(data);
    this.authCode.set(codigo);
    this.fechasDesbloqueadas.set(true);
    this.authModalVisible.set(false);
    this.toastr.success(
      `Autorización otorgada por ${data.autorizadorNombre}.`,
      'Fechas y Cierre desbloqueados'
    );
  }

  bloquearFechas(): void {
    this.fechasDesbloqueadas.set(false);
    this.autorizacion.set(null);
    this.authCode.set(null);
    this.toastr.info('Los campos de Fechas y Cierre volvieron a bloquearse.', 'Bloqueo restaurado');
  }

  // ── Guardado ─────────────────────────────────────────────────────────
  solicitarGuardado(): void {
    if (!this.puedeEditar() || this.saving()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Revise los campos marcados en rojo.', 'Formulario incompleto');
      return;
    }

    if (this.horarioInvalido()) {
      this.toastr.error(
        'La hora de cierre debe ser posterior a la hora de inicio de operaciones.',
        'Horario inválido'
      );
      return;
    }

    if (!this.dirty()) {
      this.toastr.info('No hay cambios pendientes de guardar.', 'Sin cambios');
      return;
    }

    if (this.requierePin()) {
      this.toastr.warning(
        'Desbloquee Fechas y Cierre con un código de autorización antes de guardar.',
        'Autorización requerida'
      );
      this.abrirAutorizacion();
      return;
    }

    this.auditModalVisible.set(true);
  }

  cerrarConfirmacion(): void {
    if (this.saving()) return;
    this.auditModalVisible.set(false);
  }

  async confirmarGuardado(justificacion: string): Promise<void> {
    if (this.saving()) return;

    const cambios = this.cambios();
    if (cambios.length === 0) {
      this.auditModalVisible.set(false);
      return;
    }

    const valores = (this.formValues() ?? {}) as Record<string, unknown>;
    const payload: UpdateConfigGeneralRequest = { justificacion };

    for (const cambio of cambios) {
      const valor = valores[cambio.campo];
      if (typeof valor === 'string') {
        payload[cambio.campo as keyof UpdateConfigGeneralRequest] = valor.trim();
      }
    }

    const authCode = this.authCode();
    if (this.cambiosEnFechas() && authCode) {
      payload.auth_code = authCode;
    }

    this.saving.set(true);
    const resp = await this.configService.updateConfigGeneral(payload);
    this.saving.set(false);

    if (!resp) return;

    this.config.set(resp.data);
    this.rellenarFormulario(resp.data);
    this.auditModalVisible.set(false);

    const modificados = resp.metadata?.camposModificados ?? [];
    this.toastr.success(
      resp.message ||
        `Configuración actualizada (${modificados.length || cambios.length} campo(s)).`,
      'Guardado exitoso'
    );
  }

  descartarCambios(): void {
    if (this.saving()) return;
    const actual = this.config();
    if (!actual) return;

    this.rellenarFormulario(actual);
    this.toastr.info('Se descartaron los cambios no guardados.', 'Cambios descartados');
  }

  abrirHistorial(): void {
    if (!this.puedeBitacora()) return;
    this.historyModalVisible.set(true);
  }

  cerrarHistorial(): void {
    this.historyModalVisible.set(false);
  }

  // ── Utilidades de plantilla ──────────────────────────────────────────
  invalido(campo: string): boolean {
    const ctrl = this.form.get(campo);
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }

  onDpiInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, 13);
    if (input.value !== limpio) {
      input.value = limpio;
      this.form.get('dpiRepresentante')?.setValue(limpio);
    }
  }

  private rellenarFormulario(config: ConfigGeneralDto): void {
    this.form.reset({
      codigoInterno: config.codigoInterno ?? '',
      nombreComercial: config.nombreComercial ?? '',
      codigoCasaCentral: config.codigoCasaCentral ?? '',
      pais: config.pais ?? '',
      monedaPrincipal: config.monedaPrincipal ?? '',
      fechaCierre: config.fechaCierre ?? '',
      fechaApertura: config.fechaApertura ?? '',
      cierreMensual: config.cierreMensual ?? '',
      nit: config.nit ?? '',
      codigoSIB: config.codigoSIB ?? '',
      registroMercadoValores: config.registroMercadoValores ?? '',
      representanteLegal: config.representanteLegal ?? '',
      dpiRepresentante: config.dpiRepresentante ?? '',
      direccionFiscal: config.direccionFiscal ?? '',
      horaInicioOp: config.horaInicioOp ?? '',
      horaCierreOp: config.horaCierreOp ?? '',
    });

    const valores = this.form.getRawValue() as SnapshotConfigGeneral;
    this.snapshot.set(valores);
    this.formValues.set(valores);

    this.fechasDesbloqueadas.set(false);
    this.autorizacion.set(null);
    this.authCode.set(null);
    this.authModalVisible.set(false);
    this.auditModalVisible.set(false);
    this.form.markAsPristine();
  }
}
