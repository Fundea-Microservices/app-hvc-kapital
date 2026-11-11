import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { CarouselImagenComponent } from '../../components/carousel-imagen/carousel-imagen';
import { CanalPreview, CarouselPreviewComponent } from '../../components/carousel-preview/carousel-preview';
import { CarouselService } from '../../../../services/config/carousel.service';
import { UsuariosService } from '../../../../services/auth/usuarios.service';
import { TipoUsuarioService } from '../../../../services/auth/tipo-usuario.service';
import { ICarousel, ICarouselPayload, ICarouselSlide } from '../../../../interfaces/config';
import { ITipoUsuario } from '../../../../interfaces/auth';
import {
  CAROUSEL_ACCEPT,
  ETIQUETA_VIGENCIA,
  estadoVigencia,
  fechaFinAIso,
  fechaInicioAIso,
  isoAFechaInput,
  textoAUsuarios,
  usuariosATexto,
  validarImagen,
} from '../../utils/carousel.utils';

/** fechaFin no puede ser anterior a fechaInicio (mismo criterio que el API). */
function rangoFechasValido(group: AbstractControl): ValidationErrors | null {
  const inicio = group.get('fechaInicio')?.value;
  const fin = group.get('fechaFin')?.value;
  if (inicio && fin && fin < inicio) return { rangoFechas: true };
  return null;
}

const MAX_USUARIOS = 300;

/** Minúsculas y sin tildes, para buscar "empleado" y encontrar "Empleado". */
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  selector: 'app-carousel-upsert-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CustomIconComponent, CarouselImagenComponent, CarouselPreviewComponent],
  templateUrl: './carousel-upsert-page.html',
  styleUrl: './carousel-upsert-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselUpsertPageComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carouselService = inject(CarouselService);
  private usuariosService = inject(UsuariosService);
  private tipoUsuarioService = inject(TipoUsuarioService);

  readonly accept = CAROUSEL_ACCEPT;

  carouselId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  esNuevo = computed(() => !this.carouselId());

  cargando = signal(false);
  guardando = signal(false);

  form = this.fb.nonNullable.group(
    {
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      subtitulo: ['', [Validators.maxLength(200)]],
      codigo: ['', [Validators.maxLength(20)]],
      descripcion: [''],
      textoBoton: ['', [Validators.maxLength(50)]],
      redireccionUrl: [''],
      esExterno: [false],
      orden: [0, [Validators.required, Validators.min(0)]],
      visibleWeb: [true],
      visibleApp: [true],
      activo: [true],
      fechaInicio: [''],
      fechaFin: [''],
    },
    { validators: rangoFechasValido },
  );

  /** Valores del formulario como signal, para la vista previa en vivo. */
  valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  // ─── Imagen ───────────────────────────────────────────────────────────────
  archivo = signal<File | null>(null);
  archivoUrl = signal<string | null>(null);
  fotoUrlActual = signal<string | null>(null);
  imagenError = signal<string>('');
  arrastrando = signal(false);
  tieneImagen = computed(() => !!this.archivo() || !!this.fotoUrlActual());

  // ─── Usuarios (lista de códigos) ──────────────────────────────────────────
  usuarios = signal<string[]>([]);
  sugerenciasUsuarios = signal<string[]>([]);
  usuarioError = signal('');
  usuariosTexto = computed(() => usuariosATexto(this.usuarios()) ?? '');

  // ─── Tipos de usuario (códigos de auth.TipoUsuario) ───────────────────────
  /** Catálogo completo (activos e inactivos) para poder mostrar el nombre de lo ya asignado. */
  catalogoTipos = signal<ITipoUsuario[]>([]);
  tiposSeleccionados = signal<string[]>([]);
  busquedaTipo = signal('');
  mostrarTipos = signal(false);
  /** Índice resaltado en la lista desplegable (teclado). */
  tipoResaltado = signal(0);

  /** Opciones del autocompletado: activos, no elegidos, que coinciden por nombre (o código). */
  tiposFiltrados = computed(() => {
    const q = normalizar(this.busquedaTipo());
    const elegidos = new Set(this.tiposSeleccionados());
    return this.catalogoTipos().filter(
      (t) =>
        t.activo &&
        !elegidos.has(t.codigo) &&
        (!q || normalizar(t.nombre).includes(q) || normalizar(t.codigo).includes(q)),
    );
  });

  private tiposPorCodigo = computed(() => new Map(this.catalogoTipos().map((t) => [t.codigo, t])));

  // ─── Vista previa ─────────────────────────────────────────────────────────
  canalPreview = signal<CanalPreview>('web');

  slidePreview = computed<ICarouselSlide[]>(() => {
    const v = this.valores();
    return [
      {
        titulo: v.titulo ?? '',
        subtitulo: v.subtitulo,
        descripcion: v.descripcion,
        textoBoton: v.textoBoton,
        fotoUrl: this.fotoUrlActual(),
        imagenSrc: this.archivoUrl(),
      },
    ];
  });

  /** Avisos de por qué el elemento no se vería aunque se guarde. */
  avisosPreview = computed(() => {
    const v = this.valores();
    const avisos: string[] = [];
    if (!v.activo) avisos.push('Está inactivo: no se mostrará en ningún canal.');
    if (this.canalPreview() === 'web' && !v.visibleWeb) avisos.push('No está marcado como visible en la web.');
    if (this.canalPreview() === 'app' && !v.visibleApp) avisos.push('No está marcado como visible en la app.');
    const estado = estadoVigencia({
      fechaInicio: fechaInicioAIso(v.fechaInicio),
      fechaFin: fechaFinAIso(v.fechaFin),
    });
    if (estado === 'programado') avisos.push('Aún no inicia su vigencia.');
    if (estado === 'vencido') avisos.push('Su vigencia ya terminó.');
    const tipos = this.tiposSeleccionados();
    const usuarios = this.usuarios();
    if (usuarios.length && tipos.length) {
      avisos.push(
        `Solo lo verán los usuarios de tipo ${this.nombresTipos(tipos)} y ${usuarios.length} usuario(s) específicos.`,
      );
    } else if (usuarios.length) {
      avisos.push(`Solo lo verán ${usuarios.length} usuario(s) específicos.`);
    } else if (tipos.length) {
      avisos.push(`Solo lo verán los usuarios de tipo ${this.nombresTipos(tipos)}.`);
    }
    return avisos;
  });

  vigencia = computed(() => {
    const v = this.valores();
    return ETIQUETA_VIGENCIA[
      estadoVigencia({ fechaInicio: fechaInicioAIso(v.fechaInicio), fechaFin: fechaFinAIso(v.fechaFin) })
    ];
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.liberarArchivoUrl());
  }

  async ngOnInit() {
    this.cargarSugerenciasUsuarios();
    this.cargarTiposUsuario();
    const id = this.carouselId();
    if (id) await this.cargar(id);
  }

  private async cargar(id: string) {
    this.cargando.set(true);
    try {
      const resp = await this.carouselService.getCarousel(id);
      if (!resp?.success || !resp.data) {
        this.volver();
        return;
      }
      this.aplicar(resp.data);
    } finally {
      this.cargando.set(false);
    }
  }

  private aplicar(c: ICarousel) {
    this.form.reset({
      titulo: c.titulo ?? '',
      subtitulo: c.subtitulo ?? '',
      codigo: c.codigo ?? '',
      descripcion: c.descripcion ?? '',
      textoBoton: c.textoBoton ?? '',
      redireccionUrl: c.redireccionUrl ?? '',
      esExterno: !!c.esExterno,
      orden: c.orden ?? 0,
      visibleWeb: !!c.visibleWeb,
      visibleApp: !!c.visibleApp,
      activo: !!c.activo,
      fechaInicio: isoAFechaInput(c.fechaInicio),
      fechaFin: isoAFechaInput(c.fechaFin),
    });
    this.usuarios.set(textoAUsuarios(c.usuarios));
    this.tiposSeleccionados.set(textoAUsuarios(c.tiposUsuario).map((t) => t.toUpperCase()));
    this.fotoUrlActual.set(c.fotoUrl || null);
  }

  private async cargarTiposUsuario() {
    // Todos (activos e inactivos): los inactivos solo sirven para mostrar el
    // nombre de lo ya asignado; el autocompletado ofrece únicamente activos.
    const resp = await this.tipoUsuarioService.getTiposUsuario({ all: true, estado: 'todos' });
    if (resp?.success) this.catalogoTipos.set(resp.data || []);
  }

  private async cargarSugerenciasUsuarios() {
    // Solo para autocompletar; si falla, el campo sigue funcionando a mano.
    const resp = await this.usuariosService.getUsuarios({ all: true });
    if (resp?.success) {
      this.sugerenciasUsuarios.set((resp.data || []).map((u: any) => u.userName).filter(Boolean));
    }
  }

  // ─── Imagen ───────────────────────────────────────────────────────────────

  onArchivoSeleccionado(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.usarArchivo(file);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.arrastrando.set(false);
    const file = ev.dataTransfer?.files?.[0];
    if (file) this.usarArchivo(file);
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    this.arrastrando.set(true);
  }

  private usarArchivo(file: File) {
    const error = validarImagen(file);
    if (error) {
      this.imagenError.set(error);
      return;
    }
    this.imagenError.set('');
    this.liberarArchivoUrl();
    this.archivo.set(file);
    this.archivoUrl.set(URL.createObjectURL(file));
  }

  /** Descarta el archivo elegido y vuelve a la imagen guardada (si hay). */
  quitarArchivo() {
    this.liberarArchivoUrl();
    this.archivo.set(null);
  }

  private liberarArchivoUrl() {
    const url = this.archivoUrl();
    if (url) URL.revokeObjectURL(url);
    this.archivoUrl.set(null);
  }

  tamanoLegible(bytes: number): string {
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
  }

  // ─── Usuarios ─────────────────────────────────────────────────────────────

  agregarUsuario(input: HTMLInputElement) {
    const nuevos = input.value
      .split(/[,\s]+/)
      .map((u) => u.trim())
      .filter(Boolean)
      .filter((u) => !this.usuarios().includes(u));
    if (!nuevos.length) {
      input.value = '';
      return;
    }
    const resultado = [...this.usuarios(), ...nuevos];
    if ((usuariosATexto(resultado) ?? '').length > MAX_USUARIOS) {
      this.usuarioError.set(`La lista de usuarios no puede superar ${MAX_USUARIOS} caracteres.`);
      return;
    }
    this.usuarioError.set('');
    this.usuarios.set(resultado);
    input.value = '';
  }

  quitarUsuario(codigo: string) {
    this.usuarios.update((l) => l.filter((u) => u !== codigo));
    this.usuarioError.set('');
  }

  onUsuarioKeydown(ev: KeyboardEvent, input: HTMLInputElement) {
    if (ev.key === 'Enter' || ev.key === ',') {
      ev.preventDefault();
      this.agregarUsuario(input);
    } else if (ev.key === 'Backspace' && !input.value && this.usuarios().length) {
      this.usuarios.update((l) => l.slice(0, -1));
    }
  }

  // ─── Tipos de usuario ─────────────────────────────────────────────────────

  /** Tipo del catálogo para un código asignado (undefined si ya no existe). */
  tipo(codigo: string): ITipoUsuario | undefined {
    return this.tiposPorCodigo().get(codigo);
  }

  private nombresTipos(codigos: string[]): string {
    return codigos.map((c) => this.tipo(c)?.nombre ?? c).join(', ');
  }

  onTipoInput(valor: string) {
    this.busquedaTipo.set(valor);
    this.tipoResaltado.set(0);
    this.mostrarTipos.set(true);
  }

  onTipoBlur() {
    this.mostrarTipos.set(false);
  }

  seleccionarTipo(t: ITipoUsuario, input: HTMLInputElement) {
    if (!this.tiposSeleccionados().includes(t.codigo)) {
      this.tiposSeleccionados.update((l) => [...l, t.codigo]);
    }
    input.value = '';
    this.busquedaTipo.set('');
    this.tipoResaltado.set(0);
    // Se mantiene abierto para poder elegir varios seguidos.
    this.mostrarTipos.set(true);
  }

  quitarTipo(codigo: string) {
    this.tiposSeleccionados.update((l) => l.filter((c) => c !== codigo));
  }

  onTipoKeydown(ev: KeyboardEvent, input: HTMLInputElement) {
    const opciones = this.tiposFiltrados();
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.mostrarTipos.set(true);
        this.tipoResaltado.update((i) => Math.min(i + 1, Math.max(opciones.length - 1, 0)));
        break;
      case 'ArrowUp':
        ev.preventDefault();
        this.tipoResaltado.update((i) => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        ev.preventDefault(); // no enviar el formulario
        const t = opciones[this.tipoResaltado()];
        if (this.mostrarTipos() && t) this.seleccionarTipo(t, input);
        break;
      }
      case 'Escape':
        this.mostrarTipos.set(false);
        break;
      case 'Backspace':
        if (!input.value && this.tiposSeleccionados().length) {
          this.tiposSeleccionados.update((l) => l.slice(0, -1));
        }
        break;
    }
  }

  // ─── Guardar ──────────────────────────────────────────────────────────────

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  largo(campo: string): number {
    return String(this.form.get(campo)?.value ?? '').length;
  }

  private construirPayload(): ICarouselPayload {
    const v = this.form.getRawValue();
    // '' → null: en edición limpia el campo; en creación el API lo ignora.
    const texto = (s: string) => (s.trim() ? s.trim() : null);
    return {
      titulo: v.titulo.trim(),
      subtitulo: texto(v.subtitulo),
      codigo: texto(v.codigo),
      descripcion: texto(v.descripcion),
      textoBoton: texto(v.textoBoton),
      redireccionUrl: texto(v.redireccionUrl),
      esExterno: v.esExterno,
      orden: Number(v.orden) || 0,
      visibleWeb: v.visibleWeb,
      visibleApp: v.visibleApp,
      activo: v.activo,
      fechaInicio: fechaInicioAIso(v.fechaInicio),
      fechaFin: fechaFinAIso(v.fechaFin),
      usuarios: usuariosATexto(this.usuarios()),
      tiposUsuario: usuariosATexto(this.tiposSeleccionados()),
    };
  }

  async guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.esNuevo() && !this.archivo()) {
      this.imagenError.set('Seleccione la imagen del elemento.');
      return;
    }
    if (this.guardando()) return;

    this.guardando.set(true);
    try {
      const payload = this.construirPayload();
      const id = this.carouselId();

      if (!id) {
        const resp = await this.carouselService.createCarousel(payload, this.archivo());
        if (resp?.success) this.volver();
        return;
      }

      const resp = await this.carouselService.updateCarousel(id, payload);
      if (!resp?.success) return;

      const archivo = this.archivo();
      if (archivo) {
        const respImagen = await this.carouselService.cambiarImagen(id, archivo);
        if (!respImagen?.success) {
          // Los datos ya se guardaron; se queda en la página para reintentar la imagen.
          this.aplicar(resp.data);
          return;
        }
      }
      this.volver();
    } finally {
      this.guardando.set(false);
    }
  }

  volver() {
    this.router.navigate(['/dashboard/config/carousel']);
  }
}
