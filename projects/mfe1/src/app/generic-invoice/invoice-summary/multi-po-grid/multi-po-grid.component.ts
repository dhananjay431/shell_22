import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { InvoiceProcessNewDataService } from '../../invoice-process-new-data.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-multi-po-grid',
  standalone: true,
  imports: [NgIf,AsyncPipe],
  templateUrl: './multi-po-grid.component.html',
  styleUrls: ['./multi-po-grid.component.scss'],
})
export class MultiPoGridComponent {
  readonly taxCodes = ['V0', 'V1', 'JIN1', 'JIN2', 'I0'];
  showMpoGrid = false;
  showMpoEmpty = true;
  constructor(
    private invoiceprocessnewdataservice: InvoiceProcessNewDataService,
  ) {}
  ngOnInit() {
    console.log(
      'InvoiceDetailsComponent initialized',
      this.invoiceprocessnewdataservice.getData(),
    );
  }

  ob = (_ob:any) => Array.isArray(_ob)?_ob:[_ob];
  tblDt:any = of([])

  numberValue(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  poPrice(row: any): number {
    return this.numberValue(row.LINE_GROSS_AMT ?? row.LINE_ORDER_PRICE ?? row.PO_PRICE);
  }

  invoicePrice(row: any): number {
    return this.numberValue(row.GRN_ACCOUNTED_AMNT ?? row.LINE_GROSS_AMT ?? row.PO_PRICE);
  }

  taxCode(row: any): string {
    return row.TAX_CODE && this.taxCodes.includes(row.TAX_CODE) ? row.TAX_CODE : 'JIN2';
  }

  taxRate(code: string): number {
    return code === 'V0' || code === 'I0' ? 0 : code.startsWith('J') ? 0.18 : 0.12;
  }

  taxAmount(row: any): number {
    return this.numberValue(row.GRN_QTY) * this.invoicePrice(row) * this.taxRate(this.taxCode(row));
  }

  hasVariance(row: any): boolean {
    return Math.abs(this.invoicePrice(row) - this.poPrice(row)) > 0.004;
  }

  recalcRow(row: any, rowIndex: number): void {
    const quantity = document.getElementById(`mpo-r${rowIndex}-irqty`) as HTMLInputElement | null;
    const price = document.getElementById(`mpo-r${rowIndex}-irprice`) as HTMLInputElement | null;
    const tax = document.getElementById(`mpo-r${rowIndex}-taxcode`) as HTMLSelectElement | null;
    if (quantity) row.GRN_QTY = quantity.value;
    if (price) row.GRN_ACCOUNTED_AMNT = price.value;
    if (tax) row.TAX_CODE = tax.value;
  }
  button_getData(dt: any) {
    this.showMpoGrid = true;
    this.showMpoEmpty = false;
    this.tblDt = this.invoiceprocessnewdataservice
      .GetOpenPOLinesFromOTData(
        dt.value,
        this.invoiceprocessnewdataservice.getData()?.a2?.invoiceHeaderAndDetails[0].InvoiceHeader?.Company_Code,
      );
  }
}


