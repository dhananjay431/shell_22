import { Routes } from '@angular/router';
import { AiDocTrain } from './ai-doc-train/ai-doc-train';
import { Aigpt } from './aigpt/aigpt';
import { Aimodel } from './aimodel/aimodel';
import { Dashboard } from './dashboard/dashboard';
import { Overview as DashboardOverview } from './dashboard/overview/overview';
import { TransactionDetails as DashboardTransactionDetails } from './dashboard/transaction-details/transaction-details';
import { Dataextv3 } from './dataextv3/dataextv3';
import { DoaConfiguration } from './doa-configuration/doa-configuration';
import { DocExtraction } from './doc-extraction/doc-extraction';
import { ExtractionCheck } from './extraction-check/extraction-check';
import { GenericInvoice } from './generic-invoice/generic-invoice';
import { InvoiceCreation } from './invoice-creation/invoice-creation';
import { InvoiceProcess } from './invoice-process/invoice-process';
import { InvoiceSummary } from './invoice-summary/invoice-summary';
import { Dashboard as InvoiceSummaryDashboard } from './invoice-summary/dashboard/dashboard';
import { Overview as InvoiceSummaryOverview } from './invoice-summary/dashboard/overview/overview';
import { TransactionDetails as InvoiceSummaryTransactionDetails } from './invoice-summary/dashboard/transaction-details/transaction-details';
import { PoHome } from './landing-page/po-home/po-home';
import { LandingPage } from './landing-page/landing-page';
import { Launchdocument } from './launchdocument/launchdocument';
import { NewDataExt } from './new-data-ext/new-data-ext';
import { Pdf } from './pdf/pdf';
import { PO } from './po/po';
import { Poreports } from './poreports/poreports';
import { PR } from './pr/pr';
import { PrCreation } from './pr-creation/pr-creation';
import { Qc } from './qc/qc';
import { RecurringPay } from './recurring-pay/recurring-pay';
import { Reports } from './reports/reports';
import { Theme } from './settings/theme/theme';
import { TaskManagement } from './task-management/task-management';
import { TransactionDetails } from './transaction-details/transaction-details';
import { UserManagement } from './user-management/user-management';
import { VnRules } from './vn-rules/vn-rules';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'landing-page', component: LandingPage },
  { path: 'landing-page/po-home', component: PoHome },
  { path: 'reports', component: Reports },
  { path: 'settings/theme', component: Theme },
  { path: 'extraction-check', component: ExtractionCheck },
  { path: 'doc-extraction', component: DocExtraction },
  { path: 'poreports', component: Poreports },
  { path: 'ai-doc-train', component: AiDocTrain },
  { path: 'dashboard', component: Dashboard },
  { path: 'transaction-details', component: TransactionDetails },
  { path: 'transaction-details/:id', component: TransactionDetails },
  { path: 'dashboard/transaction-details', component: DashboardTransactionDetails },
  { path: 'dashboard/transaction-details/:id', component: DashboardTransactionDetails },
  { path: 'invoice-creation', component: InvoiceCreation },
  { path: 'invoice-summary', component: InvoiceSummary },
  { path: 'invoice-summary/dashboard', component: InvoiceSummaryDashboard },
  { path: 'invoice-summary/dashboard/overview', component: InvoiceSummaryOverview },
  { path: 'invoice-summary/dashboard/overview/:id', component: InvoiceSummaryOverview },
  {
    path: 'invoice-summary/dashboard/transaction-details',
    component: InvoiceSummaryTransactionDetails,
  },
  {
    path: 'invoice-summary/dashboard/transaction-details/:id',
    component: InvoiceSummaryTransactionDetails,
  },
  { path: 'dashboard/overview', component: DashboardOverview },
  { path: 'dashboard/overview/:id', component: DashboardOverview },
  { path: 'pr-creation', component: PrCreation },
  { path: 'qc', component: Qc },
  { path: 'pdf', component: Pdf },
  { path: 'launchdocument/:id', component: Launchdocument },
  { path: 'task-management', component: TaskManagement },
  { path: 'user-management', component: UserManagement },
  { path: 'doa-configuration', component: DoaConfiguration },
  { path: 'recurring-pay', component: RecurringPay },
  { path: 'aimodel', component: Aimodel },
  { path: 'PR', component: PR },
  { path: 'PO', component: PO },
  { path: 'aigpt', component: Aigpt },
  { path: 'vn-rules', component: VnRules },
  { path: 'newDataExt', component: NewDataExt },
  { path: 'dataextv3', component: Dataextv3 },
  { path: 'invoice-process/:id', component: InvoiceProcess },
  { path: 'generic-invoice/:id', component: GenericInvoice },
];
