/*
 * GUÍA DE USO - NUEVA ESTRUCTURA DE SERVICIOS
 * 
 * Ejemplos de cómo importar servicios desde la nueva estructura organizada:
 */

// ✅ SERVICIOS CORE (Autenticación y utilidades)
import { AuthService, AlertaService, ExportService } from '@core/services';

// ✅ SERVICIOS DE PELÍCULAS
import { PeliculaService, FuncionesService, ActoresService } from '@features/movies';

// ✅ SERVICIOS DE PROMOCIONES
import { PromocionService } from '@features/promotions';

// ✅ SERVICIOS DE SEDES Y SALAS
import { SedeService, SalasService, SedeSalasService } from '@features/venues';

// ✅ SERVICIOS DE CATÁLOGO
import { GenerosService, EtiquetasService, IdiomasService } from '@features/catalog';

// ✅ SERVICIOS DE PAGOS
import { MetodosPagoService } from '@features/payments';

// ✅ MODELOS CENTRALIZADOS
import { 
  Pelicula, 
  Promocion, 
  Usuario, 
  Sala, 
  SedeSala 
} from '@core/models';

/*
 * NOTA: Para que estos imports funcionen, necesitas configurar los path mappings
 * en tu tsconfig.json de la siguiente manera:
 * 
 * "paths": {
 *   "@core/*": ["src/app/core/*"],
 *   "@features/*": ["src/app/features/*"],
 *   "@admin/*": ["src/app/admin/*"],
 *   "@cliente/*": ["src/app/cliente/*"],
 *   "@shared/*": ["src/app/shared/*"]
 * }
 */
