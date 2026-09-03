import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-generic-invoice-content',
  standalone: true,
  templateUrl: './generic-invoice-content.html',
  styleUrl: './generic-invoice-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericInvoiceContent {}
