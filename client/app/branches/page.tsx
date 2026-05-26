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

export default function BranchPage() {

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");

  const [locationFilter, setLocationFilter] = useState("");

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    managerName: "",
    status: "ACTIVE",
  });
  


  // FETCH BRANCHES
  const fetchBranches = async () => {

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
    fetchBranches();
  }, []);


  // HANDLE INPUT
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // RESET FORM
  const resetForm = () => {

    setFormData({
      name: "",
      code: "",
      location: "",
      managerName: "",
      status: "ACTIVE",
    });

    setEditingId("");
  };


  // SHOW MESSAGE
  const showMessage = (text: string) => {

    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };


  // CREATE OR UPDATE
  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      // UPDATE
      if (editingId) {

        await fetch(
          `http://localhost:5000/api/branches/${editingId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(formData),
          }
        );

        showMessage("Branch updated successfully");

      } else {

        // CREATE
        await fetch(
          "http://localhost:5000/api/branches",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(formData),
          }
        );

        showMessage("Branch created successfully");
      }

      resetForm();

      fetchBranches();

    } catch (error) {

      console.log(error);

      showMessage("Something went wrong");
    }
  };


  // DELETE
  const deleteBranch = async (id: string) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this branch?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      await fetch(
        `http://localhost:5000/api/branches/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchBranches();

      showMessage("Branch deleted successfully");

    } catch (error) {

      console.log(error);

      showMessage("Delete failed");
    }
  };


  // EDIT
  const editBranch = (branch: Branch) => {

    setEditingId(branch._id);

    setFormData({
      name: branch.name,
      code: branch.code,
      location: branch.location,
      managerName: branch.managerName,
      status: branch.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // FILTER LOGIC
  const filteredBranches = branches.filter((branch) => {

    const matchesSearch =
      branch.name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesLocation =
      locationFilter === "" ||
      branch.location === locationFilter;

    return matchesSearch && matchesLocation;
  });


  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        {/* TOAST MESSAGE */}

        {
          message && (

            <div className="fixed top-5 right-5 bg-black text-white px-6 py-3 rounded-xl shadow-lg z-50">

              {message}

            </div>
          )
        }


        {/* HEADER */}

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-3">
            Franchise & Branch Management
          </h1>

          <p className="text-gray-600 text-lg">
            Manage franchise branches and analytics
          </p>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-md grid gap-4 mb-10"
        >

          <div className="grid md:grid-cols-2 gap-4">

            <input
              type="text"
              name="name"
              placeholder="Branch Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="code"
              placeholder="Branch Code"
              value={formData.code}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="managerName"
              placeholder="Manager Name"
              value={formData.managerName}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            />

          </div>


          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >

            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="INACTIVE">
              INACTIVE
            </option>

          </select>


          <div className="flex gap-4">

            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              {
                editingId
                  ? "Update Branch"
                  : "Create Branch"
              }
            </button>


            {
              editingId && (

                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
              )
            }

          </div>

        </form>


        {/* SEARCH + FILTER */}

        <div className="flex flex-col md:flex-row gap-4 mb-8">

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


          {/* LOCATION FILTER */}

          <select
            value={locationFilter}
            onChange={(e) =>
              setLocationFilter(e.target.value)
            }
            className="border p-3 rounded-lg bg-white"
          >

            <option value="">
              All Locations
            </option>

            {
              [...new Set(
                branches.map(
                  (branch) => branch.location
                )
              )].map((location) => (

                <option
                  key={location}
                  value={location}
                >
                  {location}
                </option>
              ))
            }

          </select>

        </div>


        {/* LOADING */}

        {
          loading && (

            <p className="text-center text-lg">
              Loading branches...
            </p>
          )
        }


        {/* EMPTY */}

        {
          !loading && filteredBranches.length === 0 && (

            <div className="bg-white p-10 rounded-xl text-center shadow-md">

              <p className="text-gray-500 text-lg">
                No branches found
              </p>

            </div>
          )
        }


        {/* BRANCH LIST */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {
            filteredBranches.map((branch) => (

              <div
                key={branch._id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
              >

                <div className="flex justify-between items-start mb-4">

                  <h2 className="text-2xl font-bold">
                    {branch.name}
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      branch.status === "ACTIVE"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {branch.status}
                  </span>

                </div>


                <div className="space-y-3 text-gray-700">

                  <p>
                    <span className="font-semibold">
                      Code:
                    </span>{" "}
                    {branch.code}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Location:
                    </span>{" "}
                    {branch.location}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Manager:
                    </span>{" "}
                    {branch.managerName}
                  </p>

                </div>


                {/* ACTION BUTTONS */}

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      editBranch(branch)
                    }
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteBranch(branch._id)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))
          }

        </div>

      </div>

    </div>
  );
}

