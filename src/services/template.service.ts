import { Injectable } from '@angular/core';
import { ORDER_TYPES } from 'src/app/contants/order-type.constant';
import { DateTime } from "luxon";
import { formatToCurrency } from "src/helpers/util";
import * as _ from 'lodash';

const SIZE_TABLE = {
	'Regular': ''
};

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  constructor() {}

	generateOrderForm(order: any) {
		const {
			orderDate,
			customer,
		} = order

		let template = `${DateTime.fromISO(orderDate).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}`
		template +=	`\nName: ${customer.firstName} ${customer.lastName}`;
		template +=	`\nAddress: ${customer.address}`;
		template +=	`\nContact Number: ${customer.mobileNumber}`;
		template +=	`\nOrders:`;
		
		_.forEach(order.items, (item) => {
			template += this.formatOrderItems(item);
		});

		template +=	`\nSub total: ${formatToCurrency(order.subTotal)}`;

		_.forEach(order.subItems, (subItem) => {
			template += this.formatSubItems(subItem);
		});

		template +=	`\nTotal: ${formatToCurrency(order.total)}`;

		return template;
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