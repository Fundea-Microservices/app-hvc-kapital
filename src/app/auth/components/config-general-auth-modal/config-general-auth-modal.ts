import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';

@Component({
  selector: 'app-config-general-auth-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CustomIconComponent],
  templateUrl: './config-general-auth-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigGeneralAuthModalComponent {
  private readonly fb = inject(FormBuilder);

  visible = input<boolean>(false);
  isLoading = input<boolean>(false);
  errorMessage = input<string>('');
  permisoCodigo = input<string>('CONFIG_GENERAL_EDITAR');

  confirm = output<string>();
  cancel = output<void>();

  showCode = signal(false);

  form = this.fb.group({
    auth_code: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        ConfigGeneralAuthModalComponent.soloAlfanumerico,
      ],
    ],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.form.reset({ auth_code: '' });
        this.showCode.set(false);
      }
    });
  }

  get control(): AbstractControl | null {
    return this.form.get('auth_code');
  }

  get invalido(): boolean {
    const ctrl = this.control;
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  toggleCode(): void {
    this.showCode.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const codigo = String(this.form.value.auth_code ?? '').trim();
    if (codigo) this.confirm.emit(codigo);
  }

  onCancel(): void {
    this.form.reset({ auth_code: '' });
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.onCancel();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.onCancel();
  }

  private static soloAlfanumerico(control: AbstractControl): ValidationErrors | null {
    const valor = String(control.value ?? '');
    return /^[A-Za-z0-9]*$/.test(valor) ? null : { pattern: true };
  }
}
