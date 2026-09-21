import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  effect,
  signal
} from '@angular/core';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { IUsuario, IPuesto, IRol, ISucursal } from '../../../../interfaces/auth';
import { UsuariosService } from '../../../../services/auth/usuarios.service';
import { from, of } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-upsert-usuario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './upsert-usuario.html',
  styleUrls: ['./upsert-usuario.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpsertUsuarioComponent {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);


  usuario = input.required<IUsuario>();
  roles = input<IRol[]>([]);
  puestos = input<IPuesto[]>([]);
  sucursales = input<ISucursal[]>([]);
  nuevo = input<boolean>(true);
  isLoading = input<boolean>(false);
  key = input<number>(0);
  autoEdit = input<boolean>(false);

  @Output() save = new EventEmitter<IUsuario>();
  @Output() cancel = new EventEmitter<void>();

  form = signal<FormGroup>(this.fb.group({}));

  constructor() {
    effect(() => {
      const isNuevo = this.nuevo();
      const u = this.usuario();
      const _ = this.key();

      const newForm = this.fb.group({
        nombre1: [u?.nombre1 ?? '', [Validators.required, Validators.minLength(2)]],
        nombre2: [u?.nombre2 ?? ''],
        nombre3: [u?.nombre3 ?? ''],
        apellido1: [u?.apellido1 ?? '', [Validators.required, Validators.minLength(2)]],
        apellido2: [u?.apellido2 ?? ''],
        apellido3: [u?.apellido3 ?? ''],
        documento: [u?.documento ?? '', [Validators.maxLength(20)]],
        tipoDocumento: [u?.tipoDocumento ?? ''],
        userName: [u?.userName ?? '', [Validators.required, Validators.minLength(4)]],
        correo: [u?.correo ?? '', [Validators.required, Validators.email]],
        telefono: [u?.telefono ?? '', [Validators.maxLength(20)]],
        metodoAutenticacion: [u?.metodoAutenticacion ?? 'Local'],
        rolId: [u?.rolId ?? '', [Validators.required]],
        puestoId: [u?.puestoId ?? ''],
        sucursalId: [u?.sucursalId ?? ''],
        activo: [u?.activo ?? true],
        clave: [''], // solo requerido al crear
        auth_code: this.fb.control(
          u?.auth_code ?? '',
          {
            validators: [Validators.minLength(3), Validators.maxLength(20)],
            asyncValidators: this.crearValidadorUnicidadAuthCode(u?.id),
            updateOn: 'blur',
          }
        ),
        autoriza: [u?.autoriza ?? false],
      });

      if (isNuevo) {
        newForm.get('clave')?.addValidators([Validators.required, Validators.minLength(6)]);
        newForm.reset({
          nombre1: '',
          nombre2: '',
          nombre3: '',
          apellido1: '',
          apellido2: '',
          apellido3: '',
          documento: '',
          tipoDocumento: '',
          userName: '',
          correo: '',
          telefono: '',
          metodoAutenticacion: 'Local',
          rolId: '',
          puestoId: '',
          sucursalId: '',
          activo: true,
          clave: '',
          auth_code: '',
          autoriza: false,
        });
      }

      this.form.set(newForm);
    });
  }

  get btnText(): string {
    return this.nuevo() ? 'Crear Usuario' : 'Actualizar Usuario';
  }

  get mostrarAuthCode(): boolean {
    const v = this.form().get('autoriza')?.value;
    return v === true;
  }

  onSubmit() {
    if (this.form().valid) {
      const raw = this.form().value;
      const value: IUsuario = {
        ...this.usuario(),
        ...raw,
        telefono: typeof raw.telefono === 'string' && raw.telefono.trim() !== '' ? raw.telefono.trim() : null,
        metodoAutenticacion: raw.metodoAutenticacion || 'Local',
        documento: typeof raw.documento === 'string' && raw.documento.trim() !== '' ? raw.documento.trim() : null,
        tipoDocumento: typeof raw.tipoDocumento === 'string' && raw.tipoDocumento.trim() !== '' ? raw.tipoDocumento.trim() : null,
        puestoId: raw.puestoId || undefined,
        sucursalId: raw.sucursalId || undefined,
        auth_code: typeof raw.auth_code === 'string' && raw.auth_code.trim() !== '' ? raw.auth_code.trim() : null,
        autoriza: raw.autoriza ?? false,
      } as IUsuario;
      this.save.emit(value);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  /**
   * Crea un validador asíncrono que verifica si el auth_code ya existe
   * en otro usuario. Se ejecuta al perder el foco (blur) del campo.
   *
   * @param excludeUserId ID del usuario que se está editando (se excluye de la validación)
   */
  private crearValidadorUnicidadAuthCode(excludeUserId?: string): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const authCode = (control.value || '').toString().trim();

      // Si está vacío, no validar (el campo es opcional)
      if (!authCode) return of(null);

      return from(this.usuariosService.getUsuarioByAuthCode(authCode)).pipe(
        first(),
        map(resp => {
          // Si encontró un usuario con ese auth_code:
          if (resp?.data) {
            const usuario = resp.data as IUsuario;
            // Si es el mismo usuario que se está editando, es válido (su propio auth_code)
            if (excludeUserId && usuario.id === excludeUserId) {
              return null;
            }
            // Si es otro usuario, el auth_code está duplicado
            return { authCodeDuplicado: { authCode, usuarioExistente: usuario.userName } };
          }
          // No se encontró ningún usuario con ese auth_code → válido
          return null;
        })
      );
    };
  }
}
