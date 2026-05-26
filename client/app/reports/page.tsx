"use client";

import { useEffect, useState } from "react";

interface Branch {
  _id: string;
  name: string;
  code: string;
  location: string;
  managerName: string;
  status: string;
}

export default function ReportsPage() {

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");


  // FETCH REPORTS
  const fetchReports = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/branches"
      );

      const data = await res.json();

      setBranches(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReports();
  }, []);


  // FILTER LOGIC
  const filteredBranches = branches.filter((branch) => {

    const matchesSearch =
      branch.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      branch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  // COUNTS
  const totalBranches = branches.length;

  const activeBranches =
    branches.filter(
      (branch) => branch.status === "ACTIVE"
    ).length;

  const inactiveBranches =
    branches.filter(
      (branch) => branch.status === "INACTIVE"
    ).length;


  // EXPORT CSV
  const exportCSV = () => {

    const headers = [
      "Branch Name",
      "Code",
      "Location",
      "Manager",
      "Status",
    ];

    const rows = filteredBranches.map((branch) => [

      branch.name,
      branch.code,
      branch.location,
      branch.managerName,
      branch.status,
    ]);


    const csvContent = [

      headers.join(","),

      ...rows.map((row) => row.join(",")),

    ].join("\n");


    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "branch_reports.csv"
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-3">
            Branch Reports
          </h1>

          <p className="text-gray-600 text-lg">
            View branch reports and analytics
          </p>

        </div>


        {/* SUMMARY CARDS */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* TOTAL */}

          <div className="bg-white p-6 rounded-2xl shadow-md">

            <h2 className="text-xl font-semibold text-gray-600 mb-3">
              Total Branches
            </h2>

            <p className="text-5xl font-bold">
              {totalBranches}
            </p>

          </div>


          {/* ACTIVE */}

          <div className="bg-green-500 text-white p-6 rounded-2xl shadow-md">

            <h2 className="text-xl font-semibold mb-3">
              Active Branches
            </h2>

            <p className="text-5xl font-bold">
              {activeBranches}
            </p>

          </div>


          {/* INACTIVE */}

          <div className="bg-red-500 text-white p-6 rounded-2xl shadow-md">

            <h2 className="text-xl font-semibold mb-3">
              Inactive Branches
            </h2>

            <p className="text-5xl font-bold">
              {inactiveBranches}
            </p>

          </div>

        </div>


        {/* SEARCH + FILTER + EXPORT */}

        <div className="flex flex-col lg:flex-row gap-4 mb-8">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search Branch..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border p-3 rounded-lg flex-1 bg-white"
          />


          {/* FILTER */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border p-3 rounded-lg bg-white"
          >

            <option value="">
              All Status
            </option>

            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="INACTIVE">
              INACTIVE
            </option>

          </select>


          {/* EXPORT */}

          <button
            onClick={exportCSV}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Export CSV
          </button>

        </div>


        {/* LOADING */}

        {
          loading && (

            <p className="text-center text-lg">
              Loading reports...
            </p>
          )
        }


        {/* EMPTY */}

        {
          !loading && filteredBranches.length === 0 && (

            <div className="bg-white p-10 rounded-xl text-center shadow-md">

              <p className="text-gray-500 text-lg">
                No reports found
              </p>

            </div>
          )
        }


        {/* TABLE */}

        {
          !loading && filteredBranches.length > 0 && (

            <div className="bg-white rounded-2xl shadow-md overflow-x-auto">

              <table className="w-full border-collapse">

                <thead className="bg-black text-white">

                  <tr>

                    <th className="p-4 text-left">
                      Branch Name
                    </th>

                    <th className="p-4 text-left">
                      Code
                    </th>

                    <th className="p-4 text-left">
                      Location
                    </th>

                    <th className="p-4 text-left">
                      Manager
                    </th>

                    <th className="p-4 text-left">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {
                    filteredBranches.map((branch) => (

                      <tr
                        key={branch._id}
                        className="border-b hover:bg-gray-50"
                      >

                        <td className="p-4 font-semibold">
                          {branch.name}
                        </td>

                        <td className="p-4">
                          {branch.code}
                        </td>

                        <td className="p-4">
                          {branch.location}
                        </td>

                        <td className="p-4">
                          {branch.managerName}
                        </td>

                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-white text-sm ${
                              branch.status === "ACTIVE"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          >
                            {branch.status}
                          </span>

                        </td>

                      </tr>
                    ))
                  }

                </tbody>

              </table>

            </div>
          )
        }

      </div>

    </div>
  );
}