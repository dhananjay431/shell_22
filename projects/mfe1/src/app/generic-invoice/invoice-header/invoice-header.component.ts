import { Component, input } from '@angular/core';
import { InvoiceProcessNewDataService } from '../invoice-process-new-data.service';

@Component({
  selector: 'app-invoice-header',

  templateUrl: './invoice-header.component.html',
  styleUrls: ['./invoice-header.component.scss'],
})
export class InvoiceHeaderComponent {
  workitemno = input<string>('');
  constructor(private ss: InvoiceProcessNewDataService) {}
  ngOnInit() {
    console.log('InvoiceHeaderComponent initialized', this.ss.getData());
  }
}
