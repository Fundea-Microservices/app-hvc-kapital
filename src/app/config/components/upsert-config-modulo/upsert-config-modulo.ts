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
import { ConfigModuloPayload, IConfigModulo } from '../../../../interfaces/config';

export const CONFIG_MODULO_CODIGO_PATTERN = /^[A-Z0-9_]+$/;

@Component({
  selector: 'app-upsert-config-modulo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './upsert-config-modulo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertConfigModuloComponent {
  private readonly fb = inject(FormBuilder);

  /** Módulo a editar; null cuando se crea uno nuevo. */
  modulo = input<IConfigModulo | null>(null);
  nuevo = input<boolean>(true);
  isLoading = input<boolean>(false);
  /** Orden sugerido (max + 1) para un módulo nuevo. */
  ordenSugerido = input<number>(1);
  /** Cambia en cada apertura para reiniciar el formulario. */
  formKey = input<number>(0);

  @Output() save = new EventEmitter<ConfigModuloPayload>();
  @Output() cancel = new EventEmitter<void>();

  form = signal<FormGroup>(this.fb.group({}));

  private lastFormKey = -1;

  constructor() {
    effect(() => {
      const key = this.formKey();
      if (key === this.lastFormKey) return;
      this.lastFormKey = key;

      const modulo = this.modulo();
      this.form.set(this.fb.group({
        codigo: [
          modulo?.codigo ?? '',
          [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(CONFIG_MODULO_CODIGO_PATTERN),
          ],
        ],
        nombre: [
          modulo?.nombre ?? '',
          [Validators.required, Validators.maxLength(100)],
        ],
        descripcion: [
          modulo?.descripcion ?? '',
          [Validators.maxLength(255)],
        ],
        orden: [
          modulo?.orden ?? this.ordenSugerido(),
          [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)],
        ],
        activo: [modulo?.activo ?? true],
      }));
    });
  }

  get btnText(): string {
    return this.nuevo() ? 'Crear módulo' : 'Guardar cambios';
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

    const payload: ConfigModuloPayload = {
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
}
