import { Injectable } from '@angular/core';

export interface RequestParams {
  servicename: string;
  namespace: string;
  payload: any;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {}
