import MainLayout from "../layouts/MainLayout";
import { FileSpreadsheet, FileText, FileType } from "lucide-react";

function ExportReport() {
  const cardClass =
    "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 transition duration-150 hover:border-[var(--color-border-hover)] active:scale-[0.97]";

  return (
    <MainLayout>
      <h2 className="mb-2 text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
        Export reports
      </h2>

      <p className="mb-8 text-[var(--color-text-secondary)]">
        Download reports in PDF, Excel, or CSV format.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <a
          href="http://127.0.0.1:8000/api/export/pdf/"
          target="_blank"
          rel="noreferrer"
          className={cardClass}
        >
          <FileText size={40} strokeWidth={1.5} className="text-[var(--color-danger)]" />
          <h3 className="mt-4 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
            PDF report
          </h3>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Download analytics report as PDF
          </p>
        </a>

        <a
          href="http://127.0.0.1:8000/api/export/excel/"
          target="_blank"
          rel="noreferrer"
          className={cardClass}
        >
          <FileSpreadsheet size={40} strokeWidth={1.5} className="text-[var(--color-success)]" />
          <h3 className="mt-4 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
            Excel report
          </h3>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Download analytics report as Excel
          </p>
        </a>

        <a
          href="http://127.0.0.1:8000/api/export/csv/"
          target="_blank"
          rel="noreferrer"
          className={cardClass}
        >
          <FileType size={40} strokeWidth={1.5} className="text-[var(--color-blue)]" />
          <h3 className="mt-4 text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
            CSV report
          </h3>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Download analytics report as CSV
          </p>
        </a>
      </div>
    </MainLayout>
  );
}

export default ExportReport;
