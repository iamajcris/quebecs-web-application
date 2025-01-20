import { Injectable } from '@angular/core';
import { ORDER_TYPES } from 'src/app/contants/order-type.constant';
import { DateTime } from "luxon";
import { formatDateTime, formatToCurrency } from "src/helpers/util";
import * as _ from 'lodash';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  constructor(private toastService: ToastService) {}

	generateOrderForm(order: any) {
		const {
			orderDate,
			customer,
		} = order

		let template = `${formatDateTime(orderDate)}`
		template +=	`\nName: ${customer.firstName} ${customer.lastName}`;
		template +=	`\nAddress: ${customer.address}`;
		template +=	`\nContact Number: ${customer.mobileNumber}`;
		template +=	`\nOrders:`;
		
		if(order.groupItems){
			_.forEach(order.groupItems, (groupItem) => {
				template += "\n"+ groupItem.text + " ₱" + groupItem.price;
			});
		}
		if(!order.groupItems || order.groupItems.length == ''){
			_.forEach(order.items, (item) => {
				template += this.formatOrderItems(item);
			});
	
			template +=	`\nSub total: ${formatToCurrency(order.subTotal)}`;
		}
		_.forEach(order.subItems, (subItem) => {
			template += this.formatSubItems(subItem);
		}); 
		template +=	`\nTotal: ${formatToCurrency(order.total)}`;

		if ((order.paymentAmount || 0) > 0) {
			template +=	'\n';
			template +=	`\n${order.modeOfPayment}: ${formatToCurrency(order.paymentAmount)}`;
			template +=	`\nChange: ${formatToCurrency(order.paymentChange)}`;
		}

		return template;
	}

	copyOrderForm(order: any) {
		const orderFormTemplate = this.generateOrderForm(order);
		navigator.clipboard.writeText(orderFormTemplate);
		this.toastService.show('The order form has been copied to the clipboard', { classname: 'bg-primary text-light', delay: 2000 });
	}

	private formatOrderItems(item: any) {
		return `\n${this.formatQuantitySize(item.quantity, item.size)} ${item.name} - ${formatToCurrency(item.price)}`;
	}

	private formatQuantitySize(quantity: string, size: string) {
		size = size === 'Regular' ? '' : size;
		return _.trim(`${quantity} ${size}`);
	}

	private formatSubItems(subItem: any) {
		return `\n${subItem.text} - ${formatToCurrency(subItem.price)}`;
	}
}