import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

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
      ps: 10,
      sd: -1,
      s: 'createdAt',
      ...options,
    };

    return this.httpClient
      .get<Menu[]>(`${this.apiBase}/menus`, { params })
      .pipe(
        map((m: any) => {
          const date = new Date(m.scheduledDate);
          m.scheduledDate = new Date(date.toLocaleDateString("fil-PH"));
          return m;
        },
      ));
  }

  getMenu(id: any) {
    return this.httpClient.get<Menu>(`${this.apiBase}/menu/${id}`);
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
  pricing: [
    {
      price: number,
      size: string
    }
  ];
}

export interface Menu {
  scheduledDate: Date;
  menuId: number;
  menuItems: [MenuItem];
  updatedAt: Date;
  createdAt: Date;
}
