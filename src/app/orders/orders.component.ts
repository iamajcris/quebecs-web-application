import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AddOrderComponent } from './add-order/add-order.component';
import { OrderService } from 'src/services/order.service';
import { PrintOrderComponent } from './print-order/print-order.component';
import { TemplateService } from 'src/services/template.service';
import { DateTime } from "luxon";

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
		private templateService: TemplateService,
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
		console.log('print', order);

		const WindowPrt: any = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');

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
						padding: 50px;
						color: var(--secondary);
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
						border-bottom: 1px solid var(--secondary);
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
						width: 20%;
						text-align: center;
					}

					.invoice_wrapper .body .main_table .row .col_qty {
						width: 10%;
						text-align: center;
					}

					.invoice_wrapper .body .main_table .row .col_total {
						width: 20%;
						text-align: right;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap {
						display: flex;
						justify-content: end;
						padding: 15px 0 5px;
						align-items: flex-end;
						border-bottom: 1px solid var(--secondary);
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .paymethod_sec {
						padding-left: 30px;
					}

					.invoice_wrapper .body .paymethod_grandtotal_wrap .grandtotal_sec {
						width: 80%;
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
									<div class="row">
										<div class="col col_no">
											<p>01</p>
										</div>
										<div class="col col_des">
											<p>Web Design</p>
											<p>Lorem ipsum dolor sit.</p>
										</div>
										<div class="col col_total">
											<p>₱700</p>
										</div>
									</div>
								</div>
							</div>
							<div class="paymethod_grandtotal_wrap">
								<div class="grandtotal_sec">
									<div class="grandtotal_entry">
										<span>SUB TOTAL</span>
										<span>₱7500</span>
									</div>
									<div class="grandtotal_entry">
										<span>Delivery fee</span>
										<span>₱50</span>
									</div>
									<div class="grandtotal_entry bold">
										<span>Total</span>
										<span>₱7000</span>
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
}