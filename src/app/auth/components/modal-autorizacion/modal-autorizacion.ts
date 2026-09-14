import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';

@Component({
  selector: 'app-modal-autorizacion',
  standalone: true,
  imports: [ReactiveFormsModule, CustomIconComponent],
  templateUrl: './modal-autorizacion.html',
  styleUrls: ['./modal-autorizacion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAutorizacionComponent {
  private fb = inject(FormBuilder);
  private autorizacionService = inject(AutorizacionService);
  private cdr = inject(ChangeDetectorRef);

  // ─── Inputs ───────────────────────────────────────────────────────────
  /** Código del permiso que requiere autorización (ej. "USR04") */
  permisoCodigo = input<string>('');

  /** UUID del permiso que requiere autorización */
  permisoId = input<string>('');

  /** Indica si se está procesando la autorización */
  isLoading = input<boolean>(false);

  // ─── Outputs ──────────────────────────────────────────────────────────
  /** Emite el auth_code cuando el usuario confirma */
  @Output() confirm = new EventEmitter<string>();

  /** Emite cuando el usuario cancela */
  @Output() cancel = new EventEmitter<void>();

  // ─── Estado interno ───────────────────────────────────────────────────
  /** Visibilidad controlada por el signal del servicio */
  private _visible = signal(false);
  public visible = this._visible.asReadonly();

  form = signal<FormGroup>(
    this.fb.group({
      auth_code: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Za-z0-9]+$/),
        ],
      ],
    })
  );

  constructor() {
    // Escuchar cambios del signal del servicio y sincronizar visibilidad.
    // Este effect es el que dispara la apertura del modal cuando el servicio
    // detecta un 428 y establece modalAbierto=true.
    console.log('🟢 [ModalAutorizacion] constructor: effect created');
    effect(() => {
      const abierto = this.autorizacionService.modalAbierto();
      console.log('🟢 [ModalAutorizacion] effect fired! modalAbierto =', abierto, '_visible was:', this._visible());
      this._visible.set(abierto);
      console.log('🟢 [ModalAutorizacion] _visible set to:', this._visible());
      if (!abierto) {
        this.form().reset({ auth_code: '' });
      }
      this.cdr.markForCheck();
      console.log('🟢 [ModalAutorizacion] markForCheck() called');
    });
  }

  // ─── Getters de validación ────────────────────────────────────────────
  get authCodeControl() {
    return this.form().get('auth_code');
  }

  get authCodeInvalid(): boolean {
    const ctrl = this.authCodeControl;
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ─── Acciones ─────────────────────────────────────────────────────────
  onSubmit(): void {
    console.log('🟡 [ModalAutorizacion] onSubmit called, form valid:', this.form().valid, 'visible:', this.visible());
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    const authCode = this.authCodeControl?.value?.trim();
    if (authCode) {
      this.confirm.emit(authCode);
    }
  }

  onCancel(): void {
    this.form().reset({ auth_code: '' });
    this.cancel.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
