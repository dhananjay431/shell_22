import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'mfe1',

  exposes: {
    './Component': './projects/mfe1/src/app/app.ts',
    './Dashboard': './projects/mfe1/src/app/dashboard/dashboard.component.ts',
    './Reports': './projects/mfe1/src/app/reports/reports.ts',
    './Theme': './projects/mfe1/src/app/settings/theme/theme.ts',
    './ExtractionCheck': './projects/mfe1/src/app/extraction-check/extraction-check.ts',
    './DocExtraction': './projects/mfe1/src/app/doc-extraction/doc-extraction.ts',
    './Poreports': './projects/mfe1/src/app/poreports/poreports.ts',
    './AiDocTrain': './projects/mfe1/src/app/ai-doc-train/ai-doc-train.ts',
    './DashboardPage': './projects/mfe1/src/app/dashboard/dashboard.ts',
    './DashboardOverview': './projects/mfe1/src/app/dashboard/overview/overview.ts',
    './DashboardTransactionDetails':
      './projects/mfe1/src/app/dashboard/transaction-details/transaction-details.ts',
    './TransactionDetails': './projects/mfe1/src/app/transaction-details/transaction-details.ts',
    './InvoiceCreation': './projects/mfe1/src/app/invoice-creation/invoice-creation.ts',
    './InvoiceSummary': './projects/mfe1/src/app/invoice-summary/invoice-summary.ts',
    './InvoiceSummaryDashboard': './projects/mfe1/src/app/invoice-summary/dashboard/dashboard.ts',
    './InvoiceSummaryOverview':
      './projects/mfe1/src/app/invoice-summary/dashboard/overview/overview.ts',
    './InvoiceSummaryTransactionDetails':
      './projects/mfe1/src/app/invoice-summary/dashboard/transaction-details/transaction-details.ts',
    './PrCreation': './projects/mfe1/src/app/pr-creation/pr-creation.ts',
    './Qc': './projects/mfe1/src/app/qc/qc.ts',
    './Pdf': './projects/mfe1/src/app/pdf/pdf.ts',
    './Launchdocument': './projects/mfe1/src/app/launchdocument/launchdocument.ts',
    './TaskManagement': './projects/mfe1/src/app/task-management/task-management.ts',
    './UserManagement': './projects/mfe1/src/app/user-management/user-management.ts',
    './DoaConfiguration': './projects/mfe1/src/app/doa-configuration/doa-configuration.ts',
    './RecurringPay': './projects/mfe1/src/app/recurring-pay/recurring-pay.ts',
    './Aimodel': './projects/mfe1/src/app/aimodel/aimodel.ts',
    './PR': './projects/mfe1/src/app/pr/pr.ts',
    './PO': './projects/mfe1/src/app/po/po.ts',
    './Aigpt': './projects/mfe1/src/app/aigpt/aigpt.ts',
    './VnRules': './projects/mfe1/src/app/vn-rules/vn-rules.ts',
    './NewDataExt': './projects/mfe1/src/app/new-data-ext/new-data-ext.ts',
    './Dataextv3': './projects/mfe1/src/app/dataextv3/dataextv3.ts',
    './InvoiceProcess': './projects/mfe1/src/app/invoice-process/invoice-process.ts',
    './GenericInvoice': './projects/mfe1/src/app/generic-invoice/generic-invoice.ts',
  },

  shared: {
    ...shareAll(
      { singleton: true, strictVersion: true, requiredVersion: 'auto', build: 'package' },
      {
        overrides: {
          // includeSecondaries is an opt-out of ignoreUnusedDeps, so all of
          // @angular/core is shared to prevent mismatches.
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // ignoreUnusedDeps is enabled by default now
    // ignoreUnusedDeps: true,

    // Opt-in: groups chunks in remoteEntry.json for smaller metadata file
    denseChunking: true,
  },
});
