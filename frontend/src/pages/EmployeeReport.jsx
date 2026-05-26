import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function EmployeeReport() {
  const [report, setReport] = useState({
    total_employees: 0,
    total_orders_handled: 0,
    total_revenue_generated: 0,
    top_employee: "",
  });

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/employee-report/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://127.0.0.1:8000/api/employee-list/")
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Employee Reports
      </h1>

      <p className="text-slate-500 mb-8">
        Monitor employee performance and department statistics.
      </p>

      {/* Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Employees</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {report.total_employees}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Orders Handled</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            {report.total_orders_handled}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Revenue Generated</h3>
          <p className="text-4xl font-bold text-purple-600 mt-3">
            ₹{report.total_revenue_generated}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Top Employee</h3>
          <p className="text-2xl font-bold text-orange-600 mt-3">
            {report.top_employee}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <input
          type="text"
          placeholder="Search employee..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Score</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-4">{employee.name}</td>
                <td className="p-4">{employee.department}</td>
                <td className="p-4">{employee.score}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full ${
                      employee.status === "Excellent"
                        ? "bg-green-100 text-green-700"
                        : employee.status === "Good"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}

            {employees.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-6 text-gray-500"
                >
                  No Employee Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default EmployeeReport;