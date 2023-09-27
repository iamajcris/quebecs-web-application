import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AddOrderComponent } from './add-order/add-order.component';
import { OrderService } from 'src/services/order.service';
import { PrintOrderComponent } from './print-order/print-order.component';
import { TemplateService } from 'src/services/template.service';
import { DateTime } from "luxon";
import * as _ from 'lodash';
import { CustomersComponent } from '../customers/customers.component';
import { CustomerService } from 'src/services/customer.service';
import { Customer } from 'src/models/customer';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
	orderList: any[];
	isLoading: boolean = false;

	page = 1;
	pageSize = 4;
	collectionSize = 0;
	
	constructor(
		private modalService: NgbModal,
		private orderService: OrderService,
		private templateService: TemplateService,
	) {
	}

	ngOnInit(): void {
		this.loadOrders();
	}

	loadOrders() {
		this.isLoading = true;
		this.orderService.geOrders().subscribe((res) => {
			console.log(res);
			this.orderList = res;
			this.isLoading = false;
		});
	}

	openOrder(order: any = null) {
		const modalRef = this.modalService.open(AddOrderComponent, { fullscreen: true, scrollable: true });
		modalRef.componentInstance.order = order;
		modalRef.closed.subscribe((res) => {
			if (res === 'success') {
				this.loadOrders();
			}
		});
	}

	print(order: any) {
		console.log('print', order);

		const WindowPrt: any = window.open('', '', 'left=0,top=0,width=400,height=750,toolbar=0,scrollbars=0,status=0');

		const template = `<html>
			<head>
				<title>Invoice Template Design</title>
			</head>
			<body>
				<style>
					@import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;400;900&display=swap');

					:root {
						--primary: #0000ff;
						--secondary: #3d3d3d;
						--white: #fff;
					}
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
						font-family: 'Lato', sans-serif;
					}
					body {
						background: var(--secondary);
						color: #00000;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 14px;
					}

					.bold {
						font-weight: 900;
					}

					.light {
						font-weight: 100;
					}

					.wrapper {
						background: var(--white);
						padding: 10px;
					}

					.invoice_wrapper {
						width: 200px;
						max-width: 100%;
					}

					.invoice_wrapper .header .logo_invoice_wrap {
						display: flex;
						justify-content: center;
						padding: 20px 0px;
					}

					.invoice_wrapper .header .bill_total_wrap {
						display: flex;
						justify-content: space-between;
						padding-bottom: 10px;
						border-bottom: 1px dashed #000;
					}

					.invoice_wrapper .header .logo_sec {
						display: flex;
						align-items: center;
						text-align: center;
					}

					.invoice_wrapper .header .logo_sec .title_wrap {
						margin-left: 5px;
					}

					.invoice_wrapper .header .logo_sec .title_wrap .title {
						text-transform: uppercase;
						font-size: 26px;
					}

					.invoice_wrapper .header .logo_sec .title_wrap .sub_title {
						text-transform: uppercase;
						font-size: 12px;
					}

					.invoice_wrapper .header .invoice_sec,
					.invoice_wrapper .header .bill_total_wrap .total_wrap {
						text-align: right;
					}

					.invoice_wrapper .header .invoice_sec .invoice {
						font-size: 28px;
						color: var(--primary);
					}

					.invoice_wrapper .header .invoice_sec .invoice_no,
					.invoice_wrapper .header .invoice_sec .date {
						display: flex;
						width: 100%;
					}

					.invoice_wrapper .header .invoice_sec .invoice_no span:first-child,
					.invoice_wrapper .header .invoice_sec .date span:first-child {
						width: 70px;
						text-align: left;
					}

					.invoice_wrapper .header .invoice_sec .invoice_no span:last-child,
					.invoice_wrapper .header .invoice_sec .date span:last-child {
						width: calc(100% - 70px);
					}

					.invoice_wrapper .header .bill_total_wrap .total_wrap .price,
					.invoice_wrapper .header .bill_total_wrap .bill_sec .name {
						color: var(--primary);
						font-size: 20px;
					}

					.invoice_wrapper .body .main_table .table_header {}

					.invoice_wrapper .body .main_table .table_header .row {
						font-size: 18px;
						border-bottom: 0px;
					}

					.invoice_wrapper .body .main_table .row {
						display: flex;
						padding-bottom: 10px;
					}

					.invoice_wrapper .body .main_table .row .col {
						padding: 0px;
					}

					.invoice_wrapper .body .main_table .row .col_no {
						width: 10%;
					}

					.invoice_wrapper .body .main_table .row .col_des {
						width: 70%;
					}

					.invoice_wrapper .body .main_table .row .col_price {
						width: 25%;
						text-align: center;
					}

					.invoice_wrapper .body .main_table .row .col_qty {
						width: 10%;
						text-align: center;
					}

					.invoice_wrapper .body .main_table .row .col_total {
						width: 30%;
						text-align: right;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap {
						display: flex;
						justify-content: end;
						padding: 10px 0px;
						align-items: flex-end;
						border-bottom: 1px dashed #000;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .paymethod_sec {
						padding-left: 30px;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec {
						width: 100%;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec p {
						display: flex;
						width: 100%;
						padding-bottom: 5px;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec p span {
						padding: 0 10px;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec p span:first-child {
						width: 60%;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec p span:last-child {
						width: 40%;
						text-align: right;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec p:last-child span {
						padding: 10px;
					}

					.invoice_wrapper .footer {
						padding: 30px;
					}

					.invoice_wrapper .footer>p {
						color: var(--primary);
						text-decoration: underline;
						font-size: 18px;
						padding-bottom: 5px;
					}

					.invoice_wrapper .footer .terms .tc {
						text-align: center;
						font-size: 16px;
					}

					.customer {
						font-weight: bold;
						font-size: 13px;
						padding: 20px 0px;
						line-height: 20px;
						text-transform: uppercase;
					}

					.grandtotal_entry {
						display: flex;
						justify-content: space-between;
					}

					.total_price {
						font-size: 16px;
    				font-weight: bolder;
						padding-top: 10px;
					}

					.table_body {
						border-bottom: 1px dashed #000;
						padding-top: 10px;
					}
				</style>
				<div class="wrapper">
					<div class="invoice_wrapper">
						<div class="header">
							<div class="logo_invoice_wrap">
								<div class="logo_sec">
									<div class="title_wrap">
										<p class="title bold">Quebec's</p>
										<p class="sub_title">Filipino Cuisine</p>
										<p class="sub_title">016 Betterlife Subd, Tanzang Luma III, <br>Imus City, Cavite4103, Philippines</p>
										<p class="sub_title">tel: 09121233123</p>
									</div>
								</div>
							</div>
							<div class="bill_total_wrap">
								<div class="bill_sec">
									<p>ORDER NO: ${order.orderId}</p>
									<p>DELIVERY: ${DateTime.fromISO(order.orderDate).toLocaleString(DateTime.DATETIME_SHORT)}</p>
								</div>
								<div class="total_wrap">
								</div>
							</div>
						</div>
						<div class="body">
							<div class="main_table">
								<div class="table_body">
									${this.printOrderItems(order.items)}
								</div>
							</div>
							<div class="paymethod_grandtotal_wrap">
								<div class="grandtotal_sec">
									<div class="grandtotal_entry">
										<span>SUB TOTAL</span>
										<span>${this.formatToCurrency(order.subTotal)}</span>
									</div>
									${this.printOrderSubItems(order.subItems)}
									<div class="grandtotal_entry total_price">
										<span>Total</span>
										<span>${this.formatToCurrency(order.total)}</span>
									</div>
								</div>
							</div>
						</div>
						<div class="customer">
							<p class="bold">${order.customerName}</p>
							<p class="bold">${order.address}</p>
							<p class="bold">${order.mobileNumber}</p>
						</div>
						<div class="footer">
							<div class="terms">
								<p class="tc bold">THANK YOU FOR YOUR ORDER!</p>
							</div>
						</div>
					</div>
				</div>
			</body>
			</html>
		`;
		WindowPrt.document.write(template);
		WindowPrt.document.close();
	}

	printOrderItems(items: [any]) {
		const template = _.map(items, (item) => {
			return `<div class="row">
				<div class="col col_des">
					<p>${item.name} - ${item.size}</p>
					${_.isEmpty(item.notes) ? '' : `<p>${item.notes}</p>`}
					<p>${item.quantity} x ${this.formatToCurrency(item.menuPrice)}</p>
				</div>
				<div class="col col_total">
					<p>${this.formatToCurrency(item.price)}</p>
				</div>
			</div>`;
		});
		return _.join(template, '');
	}

	printOrderSubItems(subItems: [any]) {
		const template = _.map(subItems, (subItem) => {
			return `<div class="grandtotal_entry">
				<span>${subItem.text}</span>
				<span>${this.formatToCurrency(subItem.price)}</span>
			</div>`;
		});

		return _.join(template, '');
	}

	formatToCurrency(val: number) {
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'PHP',
	 });

	 return formatter.format(val);
	}

	openCustomer() {
		const modalRef = this.modalService.open(CustomersComponent, {scrollable: true });
		modalRef.closed.subscribe((res) => {
			if (res === 'success') {
				this.loadOrders();
			}
		});
	}
}