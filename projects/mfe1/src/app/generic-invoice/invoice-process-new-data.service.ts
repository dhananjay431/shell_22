import { Injectable, Signal, signal } from '@angular/core';
import { forkJoin, map, mergeMap, Subject } from 'rxjs';
import { CommonService } from '../../../../shared/common.service';
declare var _: any;
export interface InvoiceProcessNewData {
  a1: any;
  a2: any;
}
138;
@Injectable({
  providedIn: 'root',
})
export class InvoiceProcessNewDataService {
  dataSignal = signal(null);
  selectedAgentSignal = signal<string | null>(null);

  d: any = {};

  GetBusinessObjects_AP_COMMENTS(d: any) {
    return this.cs.ajax(
      'GetBusinessObjects.AP_COMMENTS',
      'http://schemas.cordys.com/SharedWSAppPkg',
      {
        cursor: {
          '@id': '0',
          '@position': '0',
          '@numRows': '500',
          '@maxRows': '99999',
          '@sameConnection': 'false',
        },
        ConfigId: 'GET_AP_COMMENTS',
        SearchNode: {
          WORK_ITEM: d,
          TYPE: 'Comment',
        },
      },
    );
  }

  GetBusinessObjects_AP_UPLOADED_DOCUMENTS(d: any) {
    return this.cs.ajax(
      'GetBusinessObjects.AP_UPLOADED_DOCUMENTS',
      'http://schemas.cordys.com/SharedWSAppPkg',
      {
        cursor: {
          '@id': '0',
          '@position': '0',
          '@numRows': '500',
          '@maxRows': '99999',
          '@sameConnection': 'false',
        },
        ConfigId: 'GET_UPLOADED_DOCUMENTS',
        SearchNode: {
          WORK_ITEM: d,
          STATUS: 'Active',
        },
      },
    );
  }

  getSubject(key: any) {
    return this.d[key];
  }
  setSubject(key: any) {
    this.d[key] = new Subject();
    return this.d[key];
  }
  constructor(private cs: CommonService) {}
  readonly data: Signal<InvoiceProcessNewData | null> = this.dataSignal.asReadonly();

  getData(): InvoiceProcessNewData | null {
    return this.dataSignal();
  }

  setData(data: any): void {
    this.dataSignal.set(data);
  }

  clear(): void {
    this.dataSignal.set(null);
    this.selectedAgentSignal.set(null);
  }

  selectAgent(group: string | null): void {
    this.selectedAgentSignal.set(group);
  }
  getjson(base64: any, workItemId: any) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // const raw = JSON.stringify({ base64 });
    return this.cs
      .ajax('GetAIExtractionDetails.getAIExtractionDetails', 'http://services.ap.com/invoice', {
        workItemId,
      })
      .pipe(
        map((de: any) => {
          let d: any = [];
          if (de[0].getAIExtractionDetails != '') d = JSON.parse(de[0].getAIExtractionDetails);
          return d;
        }),
      );
  }
  getINVPDF(id: any) {
    let that = this;

    return this.cs
      .ajax(
        'GetBusinessObjects.AP_UPLOADED_DOCUMENTS',
        'http://schemas.cordys.com/SharedWSAppPkg',
        {
          cursor: {
            '@id': '0',
            '@position': '0',
            '@numRows': '500',
            '@maxRows': '99999',
            '@sameConnection': 'false',
          },
          ConfigId: 'GET_UPLOADED_DOCUMENTS',
          SearchNode: {
            WORK_ITEM: id,
            STATUS: 'Active',
          },
        },
      )
      .pipe(
        map((d: any) => _.chain(d).find({ DOCUMENT_TYPE: 'Invoice' }).value()),
        mergeMap((inv: any) =>
          this.cs.ajax(
            'DownloadDocumentWrapperforAzureBlob',
            'http://schemas.cordys.com/SharedWSAppPkg',
            {
              downlodABRequest: {
                WorkItemID: id,
                FileName: inv?.DOCUMENT_NAME?.split('/').at(-1),

                DocURL: inv?.DOCUMENT_URL,
              },
            },
          ),
        ),
        mergeMap((d: any) => {
          return that
            .getjson(JSON.parse(d.return).content, id)
            .pipe(map((d1: any) => [d1, JSON.parse(d.return).content]));
        }),
      );
  }
  getAllHarServices(workItem: any) {
    return forkJoin({
      invoiceHeaderAndDetails: this.cs.ajax(
        'GetAPInvoiceHeaderAndDetails.APInvoiceResponse',
        'http://services.ap.com/invoice',
        { WORK_ITEM_NUMBER: workItem },
      ),
      get_documents_types: this.cs.ajax(
        'GetBusinessObjects.AP_DOCUMENT_TYPES',
        'http://schemas.cordys.com/SharedWSAppPkg',
        {
          cursor: {
            '@id': '0',
            '@position': '0',
            '@numRows': '500',
            '@maxRows': '99999',
            '@sameConnection': 'false',
          },
          ConfigId: 'GET_DOCUMENTS_TYPES',
          SearchNode: {
            STATUS: 'Active',
          },
        },
      ),
    });
  }

  /* 
  <SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
    <SOAP:Body>
        <GetOpenPOLinesFromOT xmlns="http://schemas.cordys.com/SharedWSAppPkg" preserveSpace="no" qAccess="0" qValues="">
            <workitem></workitem>
            <poNumbers>3100017622,3100017623</poNumbers>
            <invoiceDetails>
                <COMPANY_CODE>GA12</COMPANY_CODE>
            </invoiceDetails>
        </GetOpenPOLinesFromOT>
    </SOAP:Body>
</SOAP:Envelope>
 */
  GetOpenPOLinesFromOTData(poNumbers: any, COMPANY_CODE: any) {
    return this.cs.ajax(
      'GetOpenPOLinesFromOT.COM_GRN_DETAILS',
      'http://schemas.cordys.com/SharedWSAppPkg',
      {
        workitem: '',
        poNumbers,
        invoiceDetails: {
          COMPANY_CODE,
        },
      },
    );
  }
}
