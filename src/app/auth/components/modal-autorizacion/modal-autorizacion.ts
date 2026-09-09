import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';

@Component({
  selector: 'app-modal-autorizacion',
  standalone: true,
  imports: [ReactiveFormsModule, CustomIconComponent],
  templateUrl: './modal-autorizacion.html',
  styleUrls: ['./modal-autorizacion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAutorizacionComponent implements OnDestroy {
  private fb = inject(FormBuilder);

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
  form = signal<FormGroup>(
    this.fb.group({
      auth_code: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Za-z0-9]+$/),  // Solo alfanumérico
        ],
      ],
    })
  );

  @ViewChild('modal', { static: true }) modal!: ElementRef<HTMLDivElement>;

  private subs: Subscription[] = [];

  constructor() {
    // Reconstruir formulario cuando cambian los inputs
    effect(() => {
      const _codigo = this.permisoCodigo();
      const _id = this.permisoId();
      // Resetear el formulario cuando cambia el permiso
      this.form().reset({ auth_code: '' });
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
    if (this.form().invalid) {
      // Marcar todos los campos como touched para mostrar errores
      this.form().markAllAsTouched();
      return;
    }

    const authCode = this.authCodeControl?.value?.trim();
    if (authCode) {
      this.confirm.emit(authCode);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  // ─── Preline Overlay ──────────────────────────────────────────────────
  open(): void {
    const el = this.modal?.nativeElement;
    if (!el) return;

    if ((window as any).HSOverlay) {
      new (window as any).HSOverlay(el).open();
    } else {
      el.classList.remove('hidden');
      el.classList.add('pointer-events-auto');
    }
  }

  close(): void {
    const el = this.modal?.nativeElement;
    if (!el) return;

    if ((window as any).HSOverlay) {
      (window as any).HSOverlay.close(el);
    } else {
      el.classList.add('hidden');
      el.classList.remove('open', 'pointer-events-auto');
    }

    this.form().reset({ auth_code: '' });
  }

  // ─── Ciclo de vida ────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.subs = [];
  }
}
