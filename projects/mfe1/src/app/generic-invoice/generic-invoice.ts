import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { InvoiceHeaderComponent } from './invoice-header/invoice-header.component';
import { InvoiceSummaryComponent } from './invoice-summary/invoice-summary.component';
import { LineItemsComponent } from './line-items/line-items.component';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { CommonService } from '../../../../shared/common.service';
import { InvoiceProcessNewDataService } from './invoice-process-new-data.service';
import { forkJoin, mergeMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
// import { InvoiceService } from './invoice.service';

@Component({
  selector: 'app-generic-invoice',
  imports: [
    InvoiceDetailsComponent,
    InvoiceHeaderComponent,
    InvoiceSummaryComponent,
    LineItemsComponent,
    VendorDetailsComponent,
    AsyncPipe,
  ],
  standalone: true,
  templateUrl: './generic-invoice.html',
  styleUrl: './generic-invoice.scss',
})
export class GenericInvoice {
  jsonData: any;
  // workitemnumber = signal<string>('');
  constructor(
    private route: ActivatedRoute,
    private cs: CommonService,
    private invoiceProcessNewData: InvoiceProcessNewDataService,
    // public invService: InvoiceService,
  ) {
    // this.workitemnumber.set(this.invService.getWorkItemId());
    // console.log("workitemnumber: ", this.workitemnumber());
    this.s = this.invoiceProcessNewData.setSubject('dt');
    this.workItemNumber.set(this.route.snapshot.paramMap.get('id') || '');
    this.so = this.s.pipe(
      mergeMap((d: any) => forkJoin({
        a1: this.invoiceProcessNewData.getINVPDF(d),
        a2: this.invoiceProcessNewData.getAllHarServices(d),
      })),
      tap((d: any) => this.invoiceProcessNewData.setData(d)),
    );
  }
  // sdt: any;
  // so: any;

  s: any;

  // workItemNumber = this.route.snapshot.paramMap.get('id') || '';
  workItemNumber = signal<string>('');

  so: any;
  // sdt = toSignal(this.so, { initialValue: null });

  // private readonly shareDataEffect = effect(() => {
  //   this.invoiceProcessNewData.setData(this.sdt());
  // });
  //

  ngOnInit(): void {
    (window as any).app = this;

    setTimeout(() => {
      this.s.next(this.workItemNumber());
    }, 1000);

    this.s.next(this.workItemNumber());

    // this.route.paramMap.subscribe((param: any) => {
    //   console.log("workitemnumber from route",param);
    // })
  }
}
