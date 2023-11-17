import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, filter, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import _ from 'lodash';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  public apiBase: string;

  constructor(
    public httpClient: HttpClient,
  ) {
    this.apiBase = environment.apiBase;

    // TODO: auth
    // httpOptions.headers = httpOptions.headers.set('Authorization', this.oauthService.authorizationHeader());
  }

  createMenu(menu: any) {
    return this.httpClient.post(`${this.apiBase}/menu`, menu);
  }

  getMenus(options: any = null): Observable<Menu[]> {
    const params = {
      p: 0,
      ps: 20,
      sd: -1,
      s: 'createdAt',
      ...options,
    };

    return this.httpClient.get<Menu[]>(`${this.apiBase}/menus`, { params });
  }

  getMenu(id: any) {
    return this.httpClient.get<Menu>(`${this.apiBase}/menu/${id}`);
  }

  updateMenu(id: any, data: any){
    return this.httpClient.put(`${this.apiBase}/menu/${id}`, data);
  }

  getLatestMenu(menus: Menu[], orderType: string) {
    if (!_.isEmpty(menus)) {
      const menu = _.chain(menus)
        .filter((m) => _.toLower(m.store) === _.toLower(orderType))
        .orderBy('createdAt', 'desc')
        .head()
        .value();

      if (menu) {
        return menu
      }
    }
    return null;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

export interface MenuItem {
  name: string;
  price: number;
  size: string;
  category: string;
  sort: number;
  pricing: [
    {
      price: number,
      size: string
    }
  ];
}

export interface Menu {
  menuId: number;
  id: number;
  menuItems: [MenuItem];
  updatedAt: Date;
  createdAt: Date;
  store: string;
  scheduleDate: Date;
}
