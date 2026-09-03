import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GenericInvoiceContent } from './generic-invoice-content';

@Component({
  selector: 'app-generic-invoice',
  standalone: true,
  imports: [GenericInvoiceContent],
  templateUrl: './generic-invoice.html',
  styleUrl: './generic-invoice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericInvoice {}
