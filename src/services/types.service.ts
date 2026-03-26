import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class TypesService {
  public apiBase: string;

  constructor(
    public httpClient: HttpClient,
  ) {
    this.apiBase = `${environment.apiBase}/types`;

    // TODO: auth
    // httpOptions.headers = httpOptions.headers.set('Authorization', this.oauthService.authorizationHeader());
  }

  createTypes(data: any) {
    return this.httpClient.post(this.apiBase, data);
  }

  getTypesList(name: string, applySessionStorage = true): Observable<any> {
    if (sessionStorage.getItem(name) && applySessionStorage) {
      return new Observable(observer => {
        observer.next(JSON.parse(sessionStorage.getItem(name) || ''));
        observer.complete();
      });
    } else {
      return this.httpClient.get<any[]>(`${this.apiBase}/${name}`);
    }
  }
}

export interface Types {
  id: string | null;
  text: string;
  ext: any;
}