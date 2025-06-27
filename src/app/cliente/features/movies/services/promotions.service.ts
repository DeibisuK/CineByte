import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Promotions } from '../../../../core/models/promotions.model';
@Injectable({
  providedIn: 'root'
})

export class PromotionsService {
private promociones: Promotions[] = [
  {
    id: 1,
    img: 'Promociones/Promo-Cumpleanos.jpg',
    etiqueta: ['CUMPLEAÑOS'],
    titulo: '¡Celebra tu Cumpleaños con CineByte!',
    descripcion: 'Disfruta un 20% de descuento en tus boletos durante  tu cumpleaños. Presenta tu cédula en taquilla o canjea tu código digital.',
    img_dsc: [''],
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2030-12-31')
  },
  {
    id: 2,
    img: 'Promociones/Promo-Codigo.jpg',
    etiqueta: ['CÓDIGO'],
    titulo: '2x1 en Boletos con Código Secreto',
    descripcion: 'Usa el código UTMACH al comprar online y lleva a tu acompañante gratis.',
    img_dsc: [''],
    fechaInicio: new Date('2025-04-01'),
    fechaFin: new Date('2025-06-30')
  },
  {
    id: 3,
    img: 'Promociones/Promo-Estudiante.jpg',
    etiqueta: ['DESCUENTO', 'VIERNES'],
    titulo: 'Viernes de Estudiante - 30% OFF',
    descripcion: 'Presenta tu carnet estudiantil y disfruta de un 30% de descuento todos los viernes. Válido en todas nuestras salas.',
    img_dsc: [''],
    fechaInicio: new Date('2025-03-01'),
    fechaFin: new Date('2025-12-19')
  },
  {
    id: 4,
    img: 'Promociones/Promo-Navidad.jpg',
    etiqueta: ['FESTIVIDAD', 'EVENTOS'],
    titulo: 'Especial Navideño: Películas Clásicas',
    descripcion: 'Revive los clásicos navideños del 20 al 28 de diciembre. Combo familiar: 4 boletos + 2 palomitas gigantes por solo $25.',
    img_dsc: [''],
    fechaInicio: new Date('2025-12-20'),
    fechaFin: new Date('2025-12-28')
  },
  {
    id: 5,
    img: 'Promociones/Promo-Lilo-Stitch.jpg',
    etiqueta: ['ESTRENO'],
    titulo: 'Estreno Exclusivo: Lilo & Stitch (4K)',
    descripcion: 'Disfruta del estreno remasterizado con un 15% de descuento en funciones pre-estreno. Sesiones especiales para niños con actividades temáticas.',
    img_dsc: [''],
    fechaInicio: new Date('2025-07-10'),
    fechaFin: new Date('2025-07-30')
  },
  {
    id: 6,
    img: 'Promociones/Promo-Superman.jpg',
    etiqueta: ['PRÓXIMAMENTE', 'DC'],
    titulo: 'Próximamente: El Nuevo Superman',
    descripcion: 'Reserva tus boletos con 1 mes de anticipación. Pre-venta disponible desde el 15 de agosto.',
    img_dsc: [''],
    fechaInicio: new Date('2025-08-15'),
    fechaFin: new Date('2025-09-15')
  }
]
  getAllPromotions(): Observable<Promotions[]> {
    return of(this.promociones);
  }

}