import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ConfigPoliticaPayload,
  IConfigModulo,
  IConfigPolitica,
} from '../../../../interfaces/config';

export const CONFIG_POLITICA_CODIGO_PATTERN = /^[A-Z0-9_]+$/;

@Component({
  selector: 'app-upsert-config-politica',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './upsert-config-politica.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertConfigPoliticaComponent {
  private readonly fb = inject(FormBuilder);

  /** Política a editar; null cuando se crea una nueva. */
  politica = input<IConfigPolitica | null>(null);
  nuevo = input<boolean>(true);
  isLoading = input<boolean>(false);
  /** Módulos disponibles para asignar la política. */
  modulos = input<IConfigModulo[]>([]);
  /** Todas las políticas; permiten calcular el siguiente orden del módulo. */
  politicas = input<IConfigPolitica[]>([]);
  /** Módulo preseleccionado al crear desde el panel derecho. */
  moduloIdInicial = input<string>('');
  /** Cambia en cada apertura para reiniciar el formulario. */
  formKey = input<number>(0);

  @Output() save = new EventEmitter<ConfigPoliticaPayload>();
  @Output() cancel = new EventEmitter<void>();

  form = signal<FormGroup>(this.fb.group({}));

  private lastFormKey = -1;

  constructor() {
    effect(() => {
      const key = this.formKey();
      if (key === this.lastFormKey) return;
      this.lastFormKey = key;

      const politica = this.politica();
      const moduloId = politica?.moduloId || this.moduloIdInicial();
      this.form.set(this.fb.group({
        moduloId: [moduloId, [Validators.required]],
        codigo: [
          politica?.codigo ?? '',
          [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(CONFIG_POLITICA_CODIGO_PATTERN),
          ],
        ],
        nombre: [
          politica?.nombre ?? '',
          [Validators.required, Validators.maxLength(100)],
        ],
        descripcion: [
          politica?.descripcion ?? '',
          [Validators.maxLength(255)],
        ],
        orden: [
          politica?.orden ?? this.siguienteOrden(moduloId),
          [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)],
        ],
        activo: [politica?.activo ?? true],
      }));
    });
  }

  get btnText(): string {
    return this.nuevo() ? 'Crear política' : 'Guardar cambios';
  }

  /** Al cambiar de módulo se reasigna al final del módulo destino. */
  onModuloChange(moduloId: string): void {
    const original = this.politica();
    const orden = !this.nuevo() && original?.moduloId === moduloId
      ? original.orden
      : this.siguienteOrden(moduloId);

    this.form().get('orden')?.setValue(orden);
  }

  onCodigoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    if (input.value === upper) return;
    input.value = upper;
    this.form().get('codigo')?.setValue(upper);
  }

  onSubmit(): void {
    const form = this.form();

    // Normaliza antes de validar para aceptar minúsculas escritas por error.
    const codigo = String(form.get('codigo')?.value ?? '').trim().toUpperCase();
    form.get('codigo')?.setValue(codigo);

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const payload: ConfigPoliticaPayload = {
      moduloId: String(form.get('moduloId')?.value ?? ''),
      codigo,
      nombre: String(form.get('nombre')?.value ?? '').trim(),
      descripcion: String(form.get('descripcion')?.value ?? '').trim(),
      orden: Number(form.get('orden')?.value),
      activo: !!form.get('activo')?.value,
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private siguienteOrden(moduloId: string): number {
    const ordenes = this.politicas()
      .filter((p) => p.moduloId === moduloId)
      .map((p) => p.orden);

    return (ordenes.length ? Math.max(...ordenes) : 0) + 1;
  }
}
