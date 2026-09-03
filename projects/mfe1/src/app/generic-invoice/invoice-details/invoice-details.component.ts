import { Component } from '@angular/core';
import { InvoiceProcessNewDataService } from '../invoice-process-new-data.service';

@Component({
  selector: 'app-invoice-details',
  standalone: true,

  // imports: [DatePipe],
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
})
export class InvoiceDetailsComponent {
  constructor(public ss: InvoiceProcessNewDataService) {}
  ngOnInit() {
    console.log('InvoiceDetailsComponent initialized', this.ss.getData());
  }
}
