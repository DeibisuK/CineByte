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
    img: 'https://static.vecteezy.com/system/resources/previews/007/469/167/non_2x/illustration-of-happy-birthday-background-for-party-holiday-birthday-promotion-card-poster-free-vector.jpg',
    etiqueta: ['EXPRESS'],
    titulo: 'Prueba de Cumpleaños',
    descripcion: 'Prueba de de promocion de cumpleaños que hace nose.',
    img_dsc: [''],
    fechaInicio: new Date('2019-07-26'),
    fechaFin: new Date('2021-06-30')
  },
  {
    id: 2,
    img: 'https://static.cinepolis.com/img/promociones/15/2023124133014571.jpg',
    etiqueta: ['MIERCOLES'],
    titulo: 'Prueba de 2x1',
    descripcion: 'Prueba de de promocion de compra de entradas 2x1.',
    img_dsc: [''],
    fechaInicio: new Date('2025-04-20'),
    fechaFin: new Date('2025-06-17')
  },
    {
    id: 3,
    img: 'https://lh7-us.googleusercontent.com/docsz/AD_4nXc0mdnWSJDMkg8AnXxeW3ja7xvl_fg427-XFgzNPSTLEWyqGW4Nn6JLgTJC_EsVng2wWY6WZGrJLZw-GttmvHFOBmKl601_4fcwx644aMFSvROYsOxuu3t3U4IrHWcFVJL0hdRMKJUz3yI7pyC9Kgv7VcLt?key=aViLBHe981uqzrfs2Wn2gA',
    etiqueta: ['CÓDIGO', 'FLASH'],
    titulo: 'Prueba de Canjear Código',
    descripcion: 'Prueba de de promocion de canejo de código flash.',
    img_dsc: [''],
    fechaInicio: new Date('2025-06-17'),
    fechaFin: new Date('2025-06-19')
  }
]
  getAllPromotions(): Observable<Promotions[]> {
    return of(this.promociones);
  }

}