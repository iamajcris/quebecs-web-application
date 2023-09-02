import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AddOrderComponent } from './add-order/add-order.component';
import { OrderService } from 'src/services/order.service';
import { PrintOrderComponent } from './print-order/print-order.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
	orderList: any[];

	constructor(
		private modalService: NgbModal,
		private orderService: OrderService,
	) {
	}

	ngOnInit(): void {
		this.orderService.geOrders().subscribe((res) => {
			console.log(res);
			this.orderList = res;
		});
	}

	openAddOrder() {
		this.modalService.open(AddOrderComponent, { fullscreen: true, scrollable: true });
	}

	print(order: any) {
		console.log('print');
		// this.modalService.open(PrintOrderComponent, { fullscreen: true });

		const printContent: any = document.getElementById("print-component");
		const WindowPrt: any = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
		WindowPrt.document.write(printContent.innerHTML);
		WindowPrt.document.close();
		WindowPrt.focus();
		WindowPrt.print();
	}
}