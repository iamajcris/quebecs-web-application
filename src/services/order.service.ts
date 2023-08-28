import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

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
}
