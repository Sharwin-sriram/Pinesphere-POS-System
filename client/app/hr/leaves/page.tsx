'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://127.0.0.1:8000/api/hr';

  const fetchLeaves = () => {
    fetch(`${API_BASE}/leave-requests/`)
      .then(res => res.json())
      .then(data => {
        setLeaves(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      await fetch(`${API_BASE}/leave-requests/${id}/${action}/`, { method: 'POST' });
      fetchLeaves(); // refresh
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>}
            {!loading && leaves.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No leave requests found.</td></tr>}
            {leaves.map((leave: any) => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{leave.employee_details?.first_name} {leave.employee_details?.last_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {leave.leave_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {leave.start_date} to {leave.end_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {leave.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(leave.id, 'approve')} className="text-green-600 hover:text-green-900">Approve</button>
                      <button onClick={() => handleAction(leave.id, 'reject')} className="text-red-600 hover:text-red-900">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
