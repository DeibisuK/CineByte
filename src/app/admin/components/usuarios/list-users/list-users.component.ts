import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { UserManagementService } from '@core/services/user-management.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserProfile } from '@core/models/users.model';
import { AlertaService } from '@core/services';
import Swal from 'sweetalert2';
import { getAuth } from 'firebase/auth';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { PermissionService } from '@core/services/permission/permission.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-list-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css',
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
  usuario: UserProfile[] = [];
  filtradosAD: UserProfile[] = [];
  filtradosEM: UserProfile[] = []; // Nueva propiedad para empleados
  filtradosCL: UserProfile[] = [];

  // Control para dropdowns mejorados
  activeDropdown: string | null = null;

  // Observables de permisos
  canEditUsers$: Observable<boolean>;
  canDeleteUsers$: Observable<boolean>;
  canCreateAdmins$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private alerta: AlertaService,
    private permissionService: PermissionService
  ) {
    this.registerForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.editForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      passwordE: new FormControl(''), // Opcional
    });

    // Inicializar observables de permisos
    this.canEditUsers$ = this.permissionService.canEditUsers();
    this.canDeleteUsers$ = this.permissionService.canDeleteUsers();
    this.canCreateAdmins$ = this.permissionService.canCreateAdmins();
  }

  handleImageError(event: any) {
    event.target.style.display = 'none';
  }

  // === MÉTODOS PARA DROPDOWN MEJORADO ===
  
  toggleDropdown(dropdownId: string) {
    if (this.activeDropdown === dropdownId) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdownId;
    }
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((texto) => {
          this.loading = true;
          this.errorMsg = '';
          // Si texto está vacío, traer todos usuarios (puedes implementar en la API)
          return this.userManagementService.buscarUsuarios(texto?.trim() || '');
        })
      )
      .subscribe({
        next: (usuarios: UserProfile[]) => {
          this.usuario = usuarios;
          this.cargarFiltros();
          this.loading = false;
        },
        error: (err: any) => {
          this.errorMsg = 'Error al buscar usuarios';
          this.loading = false;
          console.error(err);
        },
      });

    // Listener para cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-improved')) {
        this.activeDropdown = null;
      }
    });
  }

  async crearAdmin() {
    try {
      const { email, password, username } = this.registerForm.value;
      // Paso 1: Obtener token del usuario actual (el admin que está haciendo esto)
      const token = await this.userManagementService.getUsuarioActual()?.getIdToken();

      if (!token) {
        throw new Error('Token de autenticación no disponible');
      }

      await this.userManagementService
        .crearAdmin(email, password, username, token)
        .subscribe({
          next: () => {
            this.alerta.success('Exito', 'Administrador creado correctamente');
            this.registerForm.reset();
            this.closeModal('createUserModal');
            this.obtenerUsuarios();
          },
          error: () => {
            this.alerta.error('Error', 'No se pudo crear el administrador');
          },
        });
    } catch (error) {
      console.error('Error al crear administrador:', error);
      this.alerta.error('Error', 'No se pudo crear el administrador');
    }
  }

  obtenerUsuarios() {
    this.loading = true;
    this.errorMsg = '';
    
    this.userManagementService.obtenerUsuarios().subscribe({
      next: (usuarios: UserProfile[]) => {
        this.usuario = usuarios;
        this.cargarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = 'Error al cargar los usuarios. Por favor, intenta de nuevo.';
        console.error('Error al obtener usuarios:', err);
      },
    });
  }

  elimianrUsuario(uid: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al usuario permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userManagementService.eliminarUsuario(uid).subscribe({
          next: (res: any) => {
            Swal.fire('Eliminado', res.message, 'success');
            this.obtenerUsuarios();
          },
          error: (err: any) => {
            const mensaje =
              err.error?.error || 'No se pudo eliminar el usuario.';
            Swal.fire('Error', mensaje, 'error');
          },
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

    user.getIdToken().then((token) => {
      this.userManagementService.asignarAdmin(uid, token).subscribe({
        next: () => {
          this.alerta.success(
            'Administración',
            'Usuario asignado como admin correctamente'
          );
          this.obtenerUsuarios();
        },
        error: (err: any) => {
          this.alerta.error('Error asignando admin:', err);
        },
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        user.getIdToken().then((token) => {
          this.userManagementService.removerAdmin(uid, token).subscribe({
            next: () => {
              this.alerta.success('Exito', 'Rol admin removido correctamente');
              this.obtenerUsuarios();
            },
            error: (err: any) => {
              console.error('Error removiendo admin:', err);
              this.alerta.error('Error', 'Error al remover rol admin');
            },
          });
        });
      }
    });
  }

  // Nuevas funciones para el rol empleado
  asignarEmpleadoUsuario(uid: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('No hay usuario autenticado');
      return;
    }

    user.getIdToken().then((token) => {
      this.userManagementService.asignarEmpleado(uid, token).subscribe({
        next: () => {
          this.alerta.success(
            'Empleados',
            'Usuario asignado como empleado correctamente'
          );
          this.obtenerUsuarios();
        },
        error: (err: any) => {
          this.alerta.error('Error asignando empleado:', err);
        },
      });
    });
  }

  quitarEmpleadoUsuario(uid: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      this.alerta.error('Error', 'No hay usuario autenticado');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el rol empleado permanentemente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        user.getIdToken().then((token) => {
          this.userManagementService.removerEmpleado(uid, token).subscribe({
            next: () => {
              this.alerta.success('Exito', 'Rol empleado removido correctamente');
              this.obtenerUsuarios();
            },
            error: (err: any) => {
              console.error('Error removiendo empleado:', err);
              this.alerta.error('Error', 'Error al remover rol empleado');
            },
          });
        });
      }
    });
  }

  cargarFiltros() {
    this.filtradosAD = this.usuario.filter(
      (a) => a.customClaims?.role === 'admin' || a.customClaims?.isAdmin === true
    );
    this.filtradosEM = this.usuario.filter(
      (a) => a.customClaims?.role === 'employee' || 
             a.customClaims?.role === 'empleado' || 
             a.customClaims?.isEmployee === true
    );
    this.filtradosCL = this.usuario.filter((a) => {
      const claims = a.customClaims;
      if (!claims || Object.keys(claims).length === 0) return true;
      
      const isAdmin = claims.role === 'admin' || claims.isAdmin === true;
      const isEmployee = claims.role === 'employee' || claims.role === 'empleado' || claims.isEmployee === true;
      
      return !isAdmin && !isEmployee;
    });
  }

  openModal(modal: string) {
    try {
      if (modal === 'createUserModal' && this.modalRef?.nativeElement) {
        this.modalRef.nativeElement.classList.add('active');
      } else if (this.modalEdit?.nativeElement) {
        this.modalEdit.nativeElement.classList.add('active');
      }
    } catch (error) {
      console.error('Error al abrir el modal:', error);
    }
  }

  closeModal(modal: string) {
    if (modal === 'createUserModal') {
      return this.modalRef.nativeElement.classList.remove('active');
    }
    return this.modalEdit.nativeElement.classList.remove('active');
  }

  abrirModalEdicion(user: UserProfile): void {
    if (!this.modalEdit) {
      console.error('Modal de edición no encontrado');
      return;
    }

    this.selectedUserUid = user.uid;
    this.editForm.reset(); // Limpia el formulario primero

    this.editForm.patchValue({
      username: user.displayName || '',
      email: user.email || '',
      passwordE: ''
    });

    // Forzar la detección de cambios (por si acaso)
    setTimeout(() => {
      this.openModal('editUserModal');
    }, 0);
  }

  async editarAdmin() {
    try {
      if (!this.selectedUserUid) {
        this.alerta.error('Error', 'No se seleccionó ningún usuario');
        return;
      }

      if (this.editForm.invalid) {
        this.alerta.error('Error', 'Por favor complete todos los campos requeridos');
        return;
      }

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        this.alerta.error('Error', 'No hay usuario autenticado');
        return;
      }

      const token = await currentUser.getIdToken();
      const { username, email, passwordE } = this.editForm.value;

      this.loading = true;

      const updateData: any = {
        username,
        email
      };

      if (passwordE && passwordE.length >= 6) {
        updateData.password = passwordE;
      }

      this.userManagementService.actualizarUsuario(
        this.selectedUserUid,
        updateData,
        token
      ).subscribe({
        next: () => {
          this.alerta.autoClose('Éxito', 'Usuario actualizado', 'success', 1500);
          this.closeModal('editUserModal');
          this.obtenerUsuarios();
        },
        error: (err: any) => {
          this.loading = false;
          const errorMsg = err.error?.message || 'Error al actualizar usuario';
          this.alerta.error('Error', errorMsg);
        }
      });
    } catch (error) {
      this.loading = false;
      this.alerta.error('Error', 'Error inesperado');
      console.error(error);
    }
  }

  // Nuevas funcionalidades

  /**
   * Revocar todos los tokens de un usuario (forzar re-login)
   */
  revocarTokensUsuario(uid: string, displayName?: string) {
    const userName = displayName || 'usuario';
    
    Swal.fire({
      title: '¿Revocar tokens?',
      text: `Esto forzará a ${userName} a iniciar sesión nuevamente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, revocar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userManagementService.revocarTokensUsuario(uid).subscribe({
          next: (response: any) => {
            this.alerta.success('Éxito', response.message || 'Tokens revocados correctamente');
          },
          error: (err: any) => {
            const errorMsg = err.error?.error || 'Error al revocar tokens';
            this.alerta.error('Error', errorMsg);
          }
        });
      }
    });
  }

  /**
   * Cambiar estado del usuario (habilitar/deshabilitar)
   */
  cambiarEstadoUsuario(uid: string, disabled: boolean, displayName?: string) {
    const userName = displayName || 'usuario';
    const accion = disabled ? 'deshabilitar' : 'habilitar';
    
    Swal.fire({
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
      text: `Esto ${accion}á la cuenta de ${userName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userManagementService.cambiarEstadoUsuario(uid, disabled).subscribe({
          next: (response: any) => {
            this.alerta.success('Éxito', response.message || `Usuario ${disabled ? 'deshabilitado' : 'habilitado'} correctamente`);
            this.obtenerUsuarios(); // Recargar la lista
          },
          error: (err: any) => {
            const errorMsg = err.error?.error || `Error al ${accion} usuario`;
            this.alerta.error('Error', errorMsg);
          }
        });
      }
    });
  }

  /**
   * Ver detalles completos de un usuario
   */
  verDetallesUsuario(uid: string) {
    this.userManagementService.obtenerDetalleUsuario(uid).subscribe({
      next: (usuario: UserProfile) => {
        // Formatear la información para mostrar
        const info = `
          <div style="text-align: left;">
            <p><strong>UID:</strong> ${usuario.uid}</p>
            <p><strong>Email:</strong> ${usuario.email || 'No disponible'}</p>
            <p><strong>Nombre:</strong> ${usuario.displayName || 'No disponible'}</p>
            <p><strong>Email verificado:</strong> ${usuario.emailVerified ? 'Sí' : 'No'}</p>
            <p><strong>Estado:</strong> ${usuario.disabled ? 'Deshabilitado' : 'Activo'}</p>
            <p><strong>Rol:</strong> ${usuario.customClaims?.role || 'user'}</p>
            <p><strong>Admin:</strong> ${usuario.customClaims?.isAdmin ? 'Sí' : 'No'}</p>
            <p><strong>Empleado:</strong> ${usuario.customClaims?.isEmployee ? 'Sí' : 'No'}</p>
            <p><strong>Creado:</strong> ${usuario.creationTime ? new Date(usuario.creationTime).toLocaleString() : 'No disponible'}</p>
            <p><strong>Último acceso:</strong> ${usuario.lastSignInTime ? new Date(usuario.lastSignInTime).toLocaleString() : 'Nunca'}</p>
          </div>
        `;

        Swal.fire({
          title: 'Detalles del Usuario',
          html: info,
          icon: 'info',
          width: '600px',
          confirmButtonText: 'Cerrar'
        });
      },
      error: (err: any) => {
        const errorMsg = err.error?.error || 'Error al obtener detalles del usuario';
        this.alerta.error('Error', errorMsg);
      }
    });
  }

  /**
   * Verificar si un usuario está deshabilitado
   */
  estaDeshabilitado(usuario: UserProfile): boolean {
    return usuario.disabled === true;
  }

  /**
   * Obtener el texto del estado del usuario
   */
  obtenerEstadoUsuario(usuario: UserProfile): string {
    if (usuario.disabled === true) {
      return 'Deshabilitado';
    }
    return 'Activo';
  }

  /**
   * Obtener la clase CSS para el estado del usuario
   */
  obtenerClaseEstado(usuario: UserProfile): string {
    if (usuario.disabled === true) {
      return 'badge-danger';
    }
    return 'badge-success';
  }

  /**
   * Refrescar automáticamente el rol del usuario actual después de cambios
   */
  private async refrescarRolActual() {
    try {
      await this.authService.refreshRole();
    } catch (error) {
      console.error('Error al refrescar rol:', error);
    }
  }
}
