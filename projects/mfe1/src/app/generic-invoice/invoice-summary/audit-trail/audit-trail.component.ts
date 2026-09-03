import { Component } from '@angular/core';
import { InvoiceProcessNewDataService } from '../../invoice-process-new-data.service';

import { mergeMap } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { CommonService } from '../../../../../../shared/common.service';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [NgIf, AsyncPipe],

  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss'],
})
export class AuditTrailComponent {
  constructor(
    private invoiceprocessnewdataservice: InvoiceProcessNewDataService,
    private cs: CommonService,
  ) {
    this.s = this.invoiceprocessnewdataservice.setSubject('audit');
    this.ob = this.s.pipe(
      mergeMap((d: any) => this.invoiceprocessnewdataservice.GetBusinessObjects_AP_COMMENTS(d)),
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
  /* 
    <SOAP:Envelope xmlns:SOAP='http://schemas.xmlsoap.org/soap/envelope/'>
    <SOAP:Body>
        <GetBusinessObjects xmlns='http://schemas.cordys.com/SharedWSAppPkg'>
            <cursor id="0" position="0" numRows="500" maxRows="99999" sameConnection="false" />
            <ConfigId>GET_AP_COMMENTS</ConfigId>
            <SearchNode>
                <WORK_ITEM>GABAP0000000003082</WORK_ITEM>
                <TYPE>Comment</TYPE>
            </SearchNode>
        </GetBusinessObjects>
    </SOAP:Body>
</SOAP:Envelope>
    */
}


