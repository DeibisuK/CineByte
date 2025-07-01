import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../../services/AuthService';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../../models/users.model';
import { AlertaService } from '../../../../services/alerta.service';
import Swal from 'sweetalert2';
import { getAuth, updateProfile } from 'firebase/auth';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-list-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css'
})
export class ListUsersComponent implements OnInit {
  @ViewChild('createUserModal') modalRef!: ElementRef;
  @ViewChild('editUserModal') modalEdit!: ElementRef;
  selectedUserUid: string | null = null;
  searchControl = new FormControl('');
  registerForm!: FormGroup;
  editForm!: FormGroup;
  loading = false;
  errorMsg = '';
  usuario: UserProfile[] = []
  filtradosAD: UserProfile[] = [];
  filtradosCL: UserProfile[] = [];

  constructor(private usuariosService: AuthService, private alerta: AlertaService) {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.editForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      passwordE: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(texto => {
        this.loading = true;
        this.errorMsg = '';
        // Si texto está vacío, traer todos usuarios (puedes implementar en la API)
        return this.usuariosService.buscarUsuarios(texto?.trim() || '');
      })
    ).subscribe({
      next: (usuarios) => {
        this.usuario = usuarios;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Error al buscar usuarios';
        this.loading = false;
        console.error(err);
      }
    });
  }

  async crearAdmin() {
    try {
      const { email, password, username } = this.registerForm.value;
      // Paso 1: Obtener token del usuario actual (el admin que está haciendo esto)
      const token = await this.usuariosService.getUsuarioActual()?.getIdToken();

      if (!token) {
        throw new Error('Token de autenticación no disponible');
      }

      await this.usuariosService.crearAdmin(email, password, username, token).subscribe({
        next: () => {
          this.alerta.success('Exito', 'Administrador creado correctamente');
          this.registerForm.reset();
          this.closeModal('createUserModal');
          this.obtenerUsuarios();
        },
        error: () => {
          this.alerta.error('Error', 'No se pudo crear el administrador');
        }
      });


    } catch (error) {
      console.error('Error al crear administrador:', error);
      this.alerta.error('Error', 'No se pudo crear el administrador');
    }
  }

  obtenerUsuarios() {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: usuarios => {
        this.usuario = usuarios;
        this.cargarFiltros();
      },
      error: err => {
        this.alerta.error('Error al obtener usuarios:', err);
      }
    });
  }

  elimianrUsuario(uid: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al usuario permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuariosService.eliminarUsuario(uid).subscribe({
          next: (res) => {
            Swal.fire('Eliminado', res.message, 'success');
            this.obtenerUsuarios();
          },
          error: (err) => {
            const mensaje = err.error?.error || 'No se pudo eliminar el usuario.';
            Swal.fire('Error', mensaje, 'error');
          }
        });
      }
    });
  }

  asignarAdminUsuario(uid: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('No hay usuario autenticado');
      return;
    }

    user.getIdToken().then(token => {
      this.usuariosService.asignarAdmin(uid, token).subscribe({
        next: () => {
          this.alerta.autoClose('Administración', 'Usuario asignado como admin correctamente', "success", 100);
          this.obtenerUsuarios();
        },
        error: (err) => {
          this.alerta.error('Error asignando admin:', err);
        }
      });
    });
  }

  quitarAdminUsuario(uid: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      this.alerta.error('Error', 'No hay usuario autenticado');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el rol admin permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        user.getIdToken().then(token => {
          this.usuariosService.removerAdmin(uid, token).subscribe({
            next: () => {
              this.alerta.success('Exito', 'Rol admin removido correctamente');
              this.obtenerUsuarios();
            },
            error: (err) => {
              console.error('Error removiendo admin:', err);
              this.alerta.error('Error', 'Error al remover rol admin');
            }
          });
        });
      }
    });
  }

  cargarFiltros() {
    this.filtradosAD = this.usuario.filter(a => a.customClaims?.role === 'admin');
    this.filtradosCL = this.usuario.filter(a => {
      const claims = a.customClaims;
      return !claims || Object.keys(claims).length === 0;
    });
  }

  openModal(modal: string) {
    if (modal === 'createUserModal') {
      this.modalRef.nativeElement.classList.add('active');
    }
    this.modalEdit.nativeElement.classList.add('active');
  }

  closeModal(modal: string) {
    if (modal === 'createUserModal') {
      this.modalRef.nativeElement.classList.remove('active');
    }
    this.modalEdit.nativeElement.classList.remove('active');

  }
  abrirModalEdicion(user: UserProfile): void {
    this.selectedUserUid = user.uid;
    // Rellenar los campos del formulario con datos actuales
    this.editForm.patchValue({
      username: user.displayName || '',
      email: user.email || '',
      passwordE: '' // No se puede obtener, se deja para que lo ingrese
    });

    this.openModal('editUserModal');
  }
  editarAdmin() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('No hay usuario autenticado');
      return;
    }

    user.getIdToken().then(token => {
      debugger
      if (!this.editForm.valid || !this.selectedUserUid) return;
      const { username, email, passwordE } = this.editForm.value;

      this.usuariosService.actualizarUsuario(this.selectedUserUid, {
        username, email, passwordE
      }, token!).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Usuario actualizado con éxito',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,  // Evita que se cierre al hacer click fuera
            allowEscapeKey: false       // Evita que se cierre con tecla ESC
          }).then(() => {
            this.closeModal('editUserModal');
            this.obtenerUsuarios();
            window.location.reload();
          });
        },
        error: (err) => {
          this.alerta.error('Error', 'Error al actualizar usuario');
          console.error(err);
        }
      });
    });


  }
}
