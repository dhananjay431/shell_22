import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: '',
    loadComponent: () => import('./home.component').then((m) => m.HomeComponent),
    children: [
      {
        path: 'payx',
        children: [
          {
            path: '',
            loadComponent: () =>
              loadRemoteModule('mfe1', './Component').then((module) => module.App),
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DashboardPage').then((module) => module.Dashboard),
          },
          {
            path: 'reports',
            loadComponent: () =>
              loadRemoteModule('mfe1', './Reports').then((module) => module.Reports),
          },
          {
            path: 'settings/theme',
            loadComponent: () => loadRemoteModule('mfe1', './Theme').then((module) => module.Theme),
          },
          {
            path: 'extraction-check',
            loadComponent: () =>
              loadRemoteModule('mfe1', './ExtractionCheck').then(
                (module) => module.ExtractionCheck,
              ),
          },
          {
            path: 'doc-extraction',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DocExtraction').then((module) => module.DocExtraction),
          },
          {
            path: 'poreports',
            loadComponent: () =>
              loadRemoteModule('mfe1', './Poreports').then((module) => module.Poreports),
          },
          {
            path: 'ai-doc-train',
            loadComponent: () =>
              loadRemoteModule('mfe1', './AiDocTrain').then((module) => module.AiDocTrain),
          },
          {
            path: 'transaction-details',
            loadComponent: () =>
              loadRemoteModule('mfe1', './TransactionDetails').then(
                (module) => module.TransactionDetails,
              ),
          },
          {
            path: 'transaction-details/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './TransactionDetails').then(
                (module) => module.TransactionDetails,
              ),
          },
          {
            path: 'dashboard/transaction-details',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DashboardTransactionDetails').then(
                (module) => module.TransactionDetails,
              ),
          },
          {
            path: 'dashboard/transaction-details/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DashboardTransactionDetails').then(
                (module) => module.TransactionDetails,
              ),
          },
          {
            path: 'dashboard/overview',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DashboardOverview').then((module) => module.Overview),
          },
          {
            path: 'dashboard/overview/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DashboardOverview').then((module) => module.Overview),
          },
          {
            path: 'invoice-creation',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceCreation').then(
                (module) => module.InvoiceCreation,
              ),
          },
          {
            path: 'invoice-summary',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceSummary').then((module) => module.InvoiceSummary),
          },
          {
            path: 'invoice-summary/dashboard',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceSummaryDashboard').then(
                (module) => module.Dashboard,
              ),
          },
          {
            path: 'invoice-summary/dashboard/overview',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceSummaryOverview').then(
                (module) => module.Overview,
              ),
          },
          {
            path: 'invoice-summary/dashboard/overview/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceSummaryOverview').then(
                (module) => module.Overview,
              ),
          },
          {
            path: 'invoice-summary/dashboard/transaction-details',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceSummaryTransactionDetails').then(
                (module) => module.TransactionDetails,
              ),
          },
          {
            path: 'invoice-summary/dashboard/transaction-details/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceSummaryTransactionDetails').then(
                (module) => module.TransactionDetails,
              ),
          },
          {
            path: 'pr-creation',
            loadComponent: () =>
              loadRemoteModule('mfe1', './PrCreation').then((module) => module.PrCreation),
          },
          {
            path: 'qc',
            loadComponent: () => loadRemoteModule('mfe1', './Qc').then((module) => module.Qc),
          },
          {
            path: 'pdf',
            loadComponent: () => loadRemoteModule('mfe1', './Pdf').then((module) => module.Pdf),
          },
          {
            path: 'launchdocument/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './Launchdocument').then((module) => module.Launchdocument),
          },
          {
            path: 'task-management',
            loadComponent: () =>
              loadRemoteModule('mfe1', './TaskManagement').then((module) => module.TaskManagement),
          },
          {
            path: 'user-management',
            loadComponent: () =>
              loadRemoteModule('mfe1', './UserManagement').then((module) => module.UserManagement),
          },
          {
            path: 'doa-configuration',
            loadComponent: () =>
              loadRemoteModule('mfe1', './DoaConfiguration').then(
                (module) => module.DoaConfiguration,
              ),
          },
          {
            path: 'recurring-pay',
            loadComponent: () =>
              loadRemoteModule('mfe1', './RecurringPay').then((module) => module.RecurringPay),
          },
          {
            path: 'aimodel',
            loadComponent: () =>
              loadRemoteModule('mfe1', './Aimodel').then((module) => module.Aimodel),
          },
          {
            path: 'PR',
            loadComponent: () => loadRemoteModule('mfe1', './PR').then((module) => module.PR),
          },
          {
            path: 'PO',
            loadComponent: () => loadRemoteModule('mfe1', './PO').then((module) => module.PO),
          },
          {
            path: 'aigpt',
            loadComponent: () => loadRemoteModule('mfe1', './Aigpt').then((module) => module.Aigpt),
          },
          {
            path: 'vn-rules',
            loadComponent: () =>
              loadRemoteModule('mfe1', './VnRules').then((module) => module.VnRules),
          },
          {
            path: 'newDataExt',
            loadComponent: () =>
              loadRemoteModule('mfe1', './NewDataExt').then((module) => module.NewDataExt),
          },
          {
            path: 'dataextv3',
            loadComponent: () =>
              loadRemoteModule('mfe1', './Dataextv3').then((module) => module.Dataextv3),
          },
          {
            path: 'invoice-process/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './InvoiceProcess').then((module) => module.InvoiceProcess),
          },
          {
            path: 'generic-invoice/:id',
            loadComponent: () =>
              loadRemoteModule('mfe1', './GenericInvoice').then((module) => module.GenericInvoice),
          },
        ],
      },
    ],
  },

  {
    path: 'login',
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: 'home' },
];
