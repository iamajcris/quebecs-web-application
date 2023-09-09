import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  public apiBase: string;

  constructor(public httpClient: HttpClient) {
  }

  getTemplate(type: string) {
    return this.httpClient.get(`${environment.templateBaseUrl}/${type}.html`, {responseType: 'text'});
  }
}