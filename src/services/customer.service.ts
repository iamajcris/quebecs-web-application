import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Customer } from 'src/models/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  public apiBase: string;

  constructor(
    public httpClient: HttpClient,
  ) {
    this.apiBase = environment.apiBase;
  }

  saveCustomer(customer: Customer) {
    return this.httpClient.post(`${this.apiBase}/customer`, customer);
  }

  updateCustomer(id: any, data: any){
    return this.httpClient.put(`${this.apiBase}/customer/${id}`, data);
  }

  deleteCustomer(id: any){
    return this.httpClient.delete(`${this.apiBase}/customer/${id}`);
  }

  getCustomers(options: any = null): Observable<Customer[]> {
    const params = {
      p: 0,
      ps: 10,
      sd: -1,
      s: 'createdAt',
      ...options,
    };

    return this.httpClient.get<Customer[]>(`${this.apiBase}/customers`, { params });
  }
}
