import { Component } from '@angular/core';
import { PromosComponent } from '../../features/promotions/pages/promos/promos.component';
import { ListarPromocionesComponent } from "../../../admin/components/promociones/listar-promociones/listar-promociones.component";

@Component({
  selector: 'app-promociones',
  imports: [ListarPromocionesComponent],
  templateUrl: './promociones.component.html',
  styleUrl: './promociones.component.css'
})
export class PromocionesComponent {

}
