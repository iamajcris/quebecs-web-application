import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbModal, NgbPaginationModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AddOrderComponent } from './add-order/add-order.component';
import { OrderService } from 'src/services/order.service';
import { PrintOrderComponent } from './print-order/print-order.component';
import { ReceiptService } from 'src/services/receipt.service';
import { DateTime } from "luxon";
import * as _ from 'lodash';
import { Types } from 'src/services/types.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { convertToDateStruct } from 'src/helpers/util';
import { combineLatest, forkJoin, merge } from 'rxjs';
import { ORDER_TYPES } from '../contants/order-type.constant';
import { Menu, MenuService } from 'src/services/menu.service';
import { TemplateService } from 'src/services/template.service';
import { ToastService } from 'src/services/toast.service';
import { CustomerService } from 'src/services/customer.service';
import settings from 'app.config.json';
import { Item } from 'firebase/analytics';

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

	hoveredDate: NgbDate | null = null;

	filterGroup: FormGroup;

	// fromDate: NgbDate | null;
	// toDate: NgbDate | null;

	filterDateOptions: Types[] = [
		{
			id: 'most-recent',
			text: 'Most Recent',
			ext: {}
		},
		{
			id: 'today',
			text: 'Today',
			ext: {
				frequency: 'days',
				value: 0
			}
		},
		{
			id: 'last-7-days',
			text: 'Last 7 days',
			ext: {
				frequency: 'days',
				value: 7
			}
		},
		{
			id: 'last-2-weeks',
			text: 'Last 2 weeks',
			ext: {
				frequency: 'weeks',
				value: 2
			}
		},
		{
			id: 'this-month',
			text: 'This month',
			ext: {
				frequency: 'months',
				value: 1
			}
		},
		{
			id: 'custom',
			text: 'Custom',
			ext: {
				frequency: 'custom',
				value: 0
			}
		},
	];

	orderTypeFilter = settings.default.orderTypeFilter;
	menu: Menu;

	constructor(
		private modalService: NgbModal,
		private orderService: OrderService,
		private menuService: MenuService,
		private receiptService: ReceiptService,
		private templateService: TemplateService,
		private toastService: ToastService,
		private customerService: CustomerService,
		private calendar: NgbCalendar,
		public formatter: NgbDateParserFormatter,
		public fb: FormBuilder,
	) { }

	ngOnInit(): void {
		this.setupFilters();
		this.menuService.getMenuList().subscribe((menus) => {
			this.menu = _.find(menus, (m) => m.store === this.orderTypeFilter) || menus[0];

			if (this.menu) {
				const dt = new Date(this.menu.scheduleDate);
				this.filterGroup.patchValue({
					dateRange: this.filterDateOptions.find((f) => f.id === 'custom')?.text,
					fromDate: convertToDateStruct(dt),
					toDate: convertToDateStruct(dt),
				});
			} else {
				// set default to today
				this.filterGroup.patchValue({ dateRange: this.filterDateOptions[0].text });
			}
		});
	}

	setupFilters() {
		this.filterDateOptions = this.filterDateOptions.map((opt) => {
			const {
				frequency,
				value,
			} = opt.ext;

			const [
				startDate,
				endDate,
			] = this.calculateDateRange(frequency, value);

			_.assign(opt.ext, { startDate, endDate });
			return opt;
		});

		console.log(this.filterDateOptions);

		this.filterGroup = this.fb.group({
			search: [''],
			dateRange: [''],
			fromDate: [''],
			toDate: [''],
		});

		const {
			dateRange,
			fromDate,
			toDate,
		} = this.filterGroup.controls;

		dateRange.valueChanges.subscribe((val) => {
			if (val === 'Custom') return;

			if (val === 'Most Recent') {
				this.loadRecentOrders();
			} else {
				const opt = this.filterDateOptions.find((x) => x.text === val);

				if (opt) {
					const {
						startDate,
						endDate,
					} = opt.ext;

					this.filterGroup.patchValue({
						fromDate: convertToDateStruct(startDate),
						toDate: convertToDateStruct(endDate),
					});
				}
			}
		});

		combineLatest([
			fromDate.valueChanges,
			toDate.valueChanges
		]).subscribe((val: any) => {
			console.log(val)
			this.loadOrders();
		})
	}

	loadRecentOrders() {
		this.isLoading = true;
		this.orderService.listOrders().subscribe((res) => {

			this.orderList = res;
			this.isLoading = false;
		});
	}

	loadOrders() {
		this.isLoading = true;

		const query = {
			start: this.formatter.format(this.fromDate.value),
			end: this.formatter.format(this.toDate.value)
		};
		console.log(query);

		this.orderService.getOrdersByField(query).subscribe((res) => {
			console.log(res);
			this.orderList = res;
			this.isLoading = false;
		});
		// store customer list in session storage
		this.customerService.getCustomerList(false).subscribe((res) => { });
	}



	openOrder(order: any = null) {
		const modalRef = this.modalService.open(AddOrderComponent, { fullscreen: true, scrollable: true });
		modalRef.componentInstance.order = order;
		modalRef.componentInstance.orderType = ORDER_TYPES.TURO_TURO;
		modalRef.closed.subscribe((res) => {
			if (res === 'success') {
				this.loadOrders();
			}
		});
	}

	print(order: any) {
		this.receiptService.openPrintWindow(order);
	}
	copy(order: any) {
		const orderFormTemplate = this.templateService.generateOrderForm(order);
		navigator.clipboard.writeText(orderFormTemplate);
		this.toastService.show('The order form has been copied to the clipboard', { classname: 'bg-primary text-light', delay: 10000 });
	}

	onDateSelection(date: NgbDate) {
		this.dateRange.setValue(this.filterDateOptions.find((x) => (x.id === 'custom'))?.text);

		if (!this.fromDate.value && !this.toDate.value) {
			this.fromDate.setValue(date);
		} else if (this.fromDate.value && !this.toDate.value && date && date.after(this.fromDate.value)) {
			this.toDate.setValue(date);
		} else {
			this.toDate.setValue(null);
			this.fromDate.setValue(date);
		}
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate.value && !this.toDate.value && this.hoveredDate && date.after(this.fromDate.value) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate.value && date.after(this.fromDate.value) && date.before(this.toDate.value);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate.value) ||
			(this.toDate.value && date.equals(this.toDate.value)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}

	calculateDateRange(frequency: string, val: number) {
		// Get the current date
		const today = new Date();

		// Calculate the start and end dates of the range
		let startDate, endDate;
		switch (frequency) {
			case "days":
				startDate = new Date(today.getTime() - (val * 24 * 60 * 60 * 1000));
				endDate = today;
				break;
			case "weeks":
				startDate = new Date(today.getTime() - ((val * 2) * 24 * 60 * 60 * 1000));
				endDate = today;
				break;
			case "months":
				startDate = new Date(today.getFullYear(), today.getMonth(), val);
				endDate = today;
				break;
			default:
				break;
		}

		// Return the start and end dates of the range
		return [startDate, endDate];
	}

	get dateRange() {
		return this.filterGroup.controls['dateRange'] as any;
	}

	get fromDate() {
		return this.filterGroup.controls['fromDate'] as any;
	}

	get toDate() {
		return this.filterGroup.controls['toDate'] as any;
	}

	async tallyOrder() {

		let createdOrders: any[] = [];
		let tallyOrder: any[] = [];
		var promises: any[] = [];
		var orderListClone: any[] = _.cloneDeep(this.orderList);

		orderListClone.forEach((order) => {
			if (order.statusType == "created") {
				createdOrders.push(order);
			}
		})

		createdOrders.forEach(async (order) => {
			
			promises.push(this.orderService.saveOrUpdateOrder({statusType:"Tallied"}, order.id).toPromise());
			order.items.forEach((items: Item) => {
				tallyOrder.push(items)
			})
		})

		await Promise.all(promises);

		let combinedOrders: Item[] = tallyOrder.reduce((accumulator: Item[], currentOrder: Item) => {
			// Check if there is already an order with the same id in the accumulator
			let existingOrder = accumulator.find(item => item.id === currentOrder.id);

			if (existingOrder) {
				// If the order already exists, update its quantity
				existingOrder.quantity ??= 0;
				existingOrder.quantity += currentOrder.quantity || 0;
			} else {
				// If the order doesn't exist, add it to the accumulator
				accumulator.push(currentOrder);
			}

			return accumulator;
		},
			[]);

		this.receiptService.openTallyPrintWindow(combinedOrders);
		this.loadRecentOrders(); 
	}

	async massDelivery() {

		let massDeliveryList: any[] = []; 
		let printMassDelivery = ""; 
		var orderListClone: any[] = _.cloneDeep(this.orderList);

		orderListClone.forEach((order) => { 
			for(let subItem of order.subItems){ 
				if(subItem.text == "Mass Delivery"){
					massDeliveryList.push(order);
				}
			} 
		})

		
		var massDeliveryTotal = 0;
		var cashPayments = 0;
		var deliveryDeduction = massDeliveryList.length * 5;

		for(var i = 0; massDeliveryList.length > i; i++){

			var massDelivery = massDeliveryList[i];
			printMassDelivery = printMassDelivery + "<br>" + (i+1)+". " + massDelivery.customer.firstName;
			console.log((i+1)+". " + massDelivery.customer.firstName);
			if(massDelivery.modeOfPayment == "COD"){
				printMassDelivery = printMassDelivery +" - " + (massDelivery.total + massDelivery.paymentChange);
				console.log(" - " + (massDelivery.total + massDelivery.paymentChange));
				cashPayments = cashPayments + (massDelivery.total + massDelivery.paymentChange);
			}
			for(let subItem of massDelivery.subItems){ 
				if(subItem.text == "Mass Delivery"){
					massDeliveryTotal = massDeliveryTotal + subItem.price;
				}
			} 
			
		} 
		console.log(printMassDelivery);
		printMassDelivery = printMassDelivery + "<br>" + "Cash Payments : " + cashPayments;
		printMassDelivery = printMassDelivery + "<br>" + "Delivery fee: " + massDeliveryTotal;
		printMassDelivery = printMassDelivery + "<br>" + "Deduction : " + deliveryDeduction;
		printMassDelivery = printMassDelivery + "<br>" + "Delivery Amount:" + (massDeliveryTotal-deliveryDeduction);
		
		this.receiptService.OpenPrintMassDelivery(printMassDelivery);
		this.loadRecentOrders(); 
	}



}