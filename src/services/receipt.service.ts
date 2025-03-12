import { Injectable } from '@angular/core';
import { formatDateTime, formatToCurrency } from "src/helpers/util";
import * as _ from 'lodash';
import * as Handlebars from 'handlebars';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { OrderService } from './order.service';

@Injectable({
	providedIn: 'root'
})
export class ReceiptService {
	public apiBase: string;

	constructor(
		private http: HttpClient,
		private orderService: OrderService,
	) {
		this.registerHelpers();
	}

	printOrderReceipt(order: any): Observable<string> {
		return this.http.get('assets/templates/receipt.html', { responseType: 'text' }).pipe(
			map((source) => {
				const template = Handlebars.compile(source);
				const data = {
					...order,
				};

				if (order.customers.length >= 1) { 
					data.groupedItems = this.orderService.mapGroupedItemsByCustomer(order);
				}

				 
				//console.log('data', data);
				const result = template(data)
				return result;
			})
		);
	}

	openPrintWindow(order: any) {
		this.printOrderReceipt(order)
			.subscribe((receipt) => {
				const WindowPrt: any = window.open('', '', 'left=0,top=0,width=700,height=750,toolbar=0,scrollbars=0,status=0');
				WindowPrt.document.write(receipt); 
				WindowPrt.document.close();
				setTimeout(() => {
					 WindowPrt.print();
					 WindowPrt.close();
					return;
				}, 300);
			});
	}

	private registerHelpers() {
		Handlebars.registerHelper('formatDateTime', (dateTime) => {
			return formatDateTime(dateTime);
		});

		Handlebars.registerHelper('formatToCurrency', (amount) => {
			return formatToCurrency(amount);
		});

		Handlebars.registerHelper('gt', (a, b) => {
			return a > b;
		});

		Handlebars.registerHelper('eq', (a, b) => {
			return a === b;
		});
	}

	openTallyPrintWindow(order: any) {
		const WindowPrt: any = window.open('', '', 'left=0,top=0,width=700,height=350,toolbar=0,scrollbars=0,status=0');
		const receipt = this.printTally(order); 
		WindowPrt.document.write(receipt);
		WindowPrt.document.close();
		setTimeout(() => {
			// WindowPrt.print();
			// WindowPrt.close();
			return;
		}, 300);
	}

	printTally(items: [any]) {
		const template = _.map(items, (item) => {
			console.log(item);
			return `<html>
					<body>
						<div class="row">
							<div class="col col_des">
								<p><h2>${item.id} - ${item.quantity}</h2></p> 
							</div>
						</div>
					</body>
				</html>`;
		});
		return template;
	}

	OpenPrintMassDelivery(list: any) {
		const WindowPrt: any = window.open('', '', 'left=0,top=0,width=700,height=350,toolbar=0,scrollbars=0,status=0');
		const receipt = this.printMassDelivery(list); 
		WindowPrt.document.write(receipt);
		WindowPrt.document.close();
		setTimeout(() => {
			// WindowPrt.print();
			// WindowPrt.close();
			return;
		}, 300);
	}

	printMassDelivery(list: any){
		
		return `<html>
					<body>
						<div class="row">
							<div class="col col_des">
								<p><h2>${list}</h2></p>
							</div>
						</div>
					</body>
				</html>`;
	}
}