import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { CambioConfig } from '../../utils/config-general.utils';

@Component({
  selector: 'app-config-general-audit-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CustomIconComponent],
  templateUrl: './config-general-audit-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigGeneralAuditModalComponent {
  private readonly fb = inject(FormBuilder);

  visible = input<boolean>(false);
  saving = input<boolean>(false);
  diffs = input<CambioConfig[]>([]);
  usuarioNombre = input<string>('');
  autorizadorNombre = input<string>('');
  timestamp = input<string>('');
  requiereAutorizacion = input<boolean>(false);

  confirm = output<string>();
  cancel = output<void>();

  form = this.fb.group({
    justificacion: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
    ],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.form.reset({ justificacion: '' });
      }
    });
  }

  get control(): AbstractControl | null {
    return this.form.get('justificacion');
  }

  get invalido(): boolean {
    const ctrl = this.control;
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get longitud(): number {
    return String(this.form.value.justificacion ?? '').length;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirm.emit(String(this.form.value.justificacion ?? '').trim());
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.saving()) this.onCancel();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.saving()) this.onCancel();
  }
}
