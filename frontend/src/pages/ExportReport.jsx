import MainLayout from "../layouts/MainLayout";
import {
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
} from "react-icons/fa";

function ExportReport() {
  return (
    <MainLayout>
      <h2 className="text-4xl font-bold text-slate-800 mb-2">
        Export Reports
      </h2>

      <p className="text-slate-500 mb-8">
        Download reports in different formats.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* PDF */}

        <a
          href="http://127.0.0.1:8000/api/export/pdf/"
          target="_blank"
          rel="noreferrer"
        >
          <div className="bg-red-500 text-white rounded-xl shadow-lg p-8 hover:scale-105 transition duration-300">

            <FaFilePdf size={50} />

            <h3 className="text-2xl font-bold mt-4">
              PDF Report
            </h3>

            <p className="mt-2 text-red-100">
              Download analytics report as PDF
            </p>

          </div>
        </a>

        {/* Excel */}

        <a
          href="http://127.0.0.1:8000/api/export/excel/"
          target="_blank"
          rel="noreferrer"
        >
          <div className="bg-green-500 text-white rounded-xl shadow-lg p-8 hover:scale-105 transition duration-300">

            <FaFileExcel size={50} />

            <h3 className="text-2xl font-bold mt-4">
              Excel Report
            </h3>

            <p className="mt-2 text-green-100">
              Download analytics report as Excel
            </p>

          </div>
        </a>

        {/* CSV */}

        <a
          href="http://127.0.0.1:8000/api/export/csv/"
          target="_blank"
          rel="noreferrer"
        >
          <div className="bg-blue-500 text-white rounded-xl shadow-lg p-8 hover:scale-105 transition duration-300">

            <FaFileCsv size={50} />

            <h3 className="text-2xl font-bold mt-4">
              CSV Report
            </h3>

            <p className="mt-2 text-blue-100">
              Download analytics report as CSV
            </p>

          </div>
        </a>

      </div>
    </MainLayout>
  );
}

export default ExportReport;