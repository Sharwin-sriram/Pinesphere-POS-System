'use client';

import React, { useState, useEffect } from 'react';

export default function EmployeeDirectory() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null); // For Modal

  const API_BASE = 'http://127.0.0.1:8000/api/hr';

  useEffect(() => {
    fetch(`${API_BASE}/employees/directory_data/`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch employees:", err);
        setLoading(false);
      });
  }, []);

  const employees = data?.employees || [];
  const summary = data?.summary || {};

  // Simple client-side search filter
  const filteredEmployees = employees.filter((emp: any) => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.display_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant staff, shifts, and attendance.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
            ⬇ Export
          </button>
          <a href="/hr/employees/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm inline-block">
            + Add Employee
          </a>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present Today</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.present || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On Leave</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.on_leave || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New This Month</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.new_this_month || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.inactive || 0}</p>
        </div>
      </div>

      {/* Advanced Data Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 bg-gray-50/50 justify-between items-center">
          <div className="flex gap-2 items-center flex-1 min-w-[300px]">
            <input 
              type="text" 
              placeholder="Search by name, ID, phone..." 
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm shadow-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm"><option>All Departments</option></select>
            <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm"><option>All Roles</option></select>
            <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm"><option>All Branches</option></select>
          </div>
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1.5 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300">Bulk Actions ⌄</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Shift</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading directory...</td></tr> : 
               filteredEmployees.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">No employees found.</td></tr> :
               filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-4 py-4 whitespace-nowrap"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {emp.photo_url ? (
                        <img src={emp.photo_url} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{emp.display_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.phone || '--'}</div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{emp.role} <span className="text-gray-400 font-normal">({emp.department})</span></div>
                    <div className="text-xs text-gray-500">{emp.branch}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      emp.current_shift === 'Night' ? 'bg-indigo-100 text-indigo-800' :
                      emp.current_shift === 'Off' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {emp.current_shift}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {emp.attendance_status === 'Present' && <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" title="Present Today"></span>}
                      {emp.attendance_status === 'Late' && <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm" title="Late Today"></span>}
                      {emp.attendance_status === 'Absent' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" title="Absent Today"></span>}
                      {emp.attendance_status === 'Leave' && <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm" title="On Leave"></span>}
                      {emp.attendance_status === 'Off' && <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shadow-sm" title="Not Scheduled"></span>}
                      <span className="text-sm font-medium text-gray-700">{emp.attendance_status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedProfile(emp)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md transition hover:bg-blue-100"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-start text-white">
              <div className="flex items-center gap-4">
                {selectedProfile.photo_url ? (
                  <img src={selectedProfile.photo_url} alt="Profile" className="w-20 h-20 rounded-xl object-cover border-4 border-white/20 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white text-blue-700 flex items-center justify-center text-2xl font-bold border-4 border-white/20 shadow-lg">
                    {selectedProfile.first_name[0]}{selectedProfile.last_name[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{selectedProfile.first_name} {selectedProfile.last_name}</h2>
                  <p className="text-blue-100 font-medium">{selectedProfile.role} • {selectedProfile.display_id}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs backdrop-blur-md">{selectedProfile.department}</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs backdrop-blur-md">{selectedProfile.branch}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedProfile(null)} className="text-white hover:bg-white/20 p-2 rounded-full transition">✕</button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Personal Info */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
                    <ul className="space-y-3 text-sm">
                      <li><span className="text-gray-500 block text-xs uppercase tracking-wider">Email</span> <span className="font-medium text-gray-800">{selectedProfile.email}</span></li>
                      <li><span className="text-gray-500 block text-xs uppercase tracking-wider">Phone</span> <span className="font-medium text-gray-800">{selectedProfile.phone || 'N/A'}</span></li>
                      <li><span className="text-gray-500 block text-xs uppercase tracking-wider">Joining Date</span> <span className="font-medium text-gray-800">{selectedProfile.hire_date}</span></li>
                      <li><span className="text-gray-500 block text-xs uppercase tracking-wider">Status</span> 
                        <span className={`inline-flex ml-2 px-2 py-0.5 rounded text-xs font-bold ${selectedProfile.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedProfile.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200">✏️ Edit Employee</button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200">✉️ Send Notification</button>
                      <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-100">🚫 Disable Account</button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Work Data Tabs */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Performance & Payroll Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Avg Rating</p>
                        <p className="text-2xl font-bold text-indigo-600">{selectedProfile.performance_score}<span className="text-lg text-indigo-300 ml-1">/5</span></p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">Attendance Today</p>
                        <p className="text-xl font-bold text-gray-800 mt-1">{selectedProfile.attendance_status}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 min-h-[200px]">
                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 flex gap-4">
                      <button className="text-blue-600 border-b-2 border-blue-600 pb-1">Attendance History</button>
                      <button className="text-gray-400 hover:text-gray-600 pb-1">Shift Schedule</button>
                      <button className="text-gray-400 hover:text-gray-600 pb-1">Leave History</button>
                    </h3>
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      [ Detailed tabular data for {selectedProfile.first_name} would load here ]
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
