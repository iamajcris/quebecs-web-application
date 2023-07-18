import { Component } from '@angular/core';
import { NgbModal, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AddOrderComponent } from './add-order/add-order.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
	constructor(
		private modalService: NgbModal,
	) {
	}

	openAddOrder() {
		this.modalService.open(AddOrderComponent);
	}
}