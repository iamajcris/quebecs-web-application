import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  public apiBase: string;

  constructor(
    public httpClient: HttpClient,
  ) {
    this.apiBase = environment.apiBase;

    // TODO: auth
    // httpOptions.headers = httpOptions.headers.set('Authorization', this.oauthService.authorizationHeader());
  }

  createOrder(order: any) {
    return this.httpClient.post(`${this.apiBase}/order`, order);
  }

  getOrder(id: any){
    return this.httpClient.get(`${this.apiBase}/order/${id}`);
  }

  updateOrder(id: any, data: any){
    return this.httpClient.put(`${this.apiBase}/order/${id}`, data);
  }

  saveOrUpdateOrder(data: any, id: any = null) {
    return id ? this.updateOrder(id, data) : this.createOrder(data);
  }

  listOrders(options: any = null) {
    const params = {
      p: 0,
      ps: 10,
      sd: -1,
      s: 'createdAt',
      ...options,
    };

    return this.httpClient.get<any[]>(`${this.apiBase}/orders`, { params });
  }

  getOrdersByField(query: any, field: string = 'orderDate') {
    const params = {
      ...query
    };

    return this.httpClient.get<any[]>(`${this.apiBase}/orders/${field}`, { params });
  }

  mapGroupedItemsByCustomer(order: any) {
    const { items, customer, customers } = order;

    const groupedItems = _.chain(items)
      .filter(item => item.customerId)
      .groupBy('customerId')
      .map((items, customerId) => {
        if (!customerId) return;

        const customerData = _.find(_.concat([customer], customers), (c) => c.customerId === customerId);

        items = _.uniqBy(items, 'id');
        return {
          customerId,
          customerName: _.trim(`${_.get(customerData, 'firstName', '')} ${_.get(customerData, 'lastName', '')}`),
          items,
          totalQuantity: _.sum(_.map(items, (item) => item.quantity)),
          total: _.sum(_.map(items, (item) => item.price))
        };
      })
      .value();

    return groupedItems;
  }
}
