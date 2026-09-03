import { Component } from '@angular/core';
import { InvoiceProcessNewDataService } from '../../invoice-process-new-data.service';

import { mergeMap } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { CommonService } from '../../../../../../shared/common.service';

@Component({
  selector: 'app-attachments',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent {
  constructor(
    private invoiceprocessnewdataservice: InvoiceProcessNewDataService,
    private cs: CommonService,
  ) {
    this.s = this.invoiceprocessnewdataservice.setSubject('attachments');
    this.ob = this.s.pipe(
      mergeMap((d: any) => this.invoiceprocessnewdataservice.GetBusinessObjects_AP_UPLOADED_DOCUMENTS(d)),
    );
  }
  s: any;
  ob: any;
  obj = (dt: any) => (Array.isArray(dt) ? dt : [dt]);
  ngOnInit() {
    console.log('InvoiceDetailsComponent initialized', this.invoiceprocessnewdataservice.getData());

    setTimeout(() => {
      this.s.next(
        this.invoiceprocessnewdataservice.getData()?.a2?.invoiceHeaderAndDetails?.[0]?.InvoiceDetails?.InvoiceDetailsData?.WORK_ITEM,
      );
    }, 100);
  }
}


