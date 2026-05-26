'use client';

import React, { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://127.0.0.1:8000/api/hr';

  useEffect(() => {
    // We fetch directory data to get some overall stats for the mock charts
    fetch(`${API_BASE}/employees/directory_data/`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch reports data:", err);
        setLoading(false);
      });
  }, []);

  const ReportCard = ({ title, desc, icon, color }: { title: string, desc: string, icon: string, color: string }) => (
    <div className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex gap-4 items-start`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color} bg-opacity-20 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
        <div className="mt-3 flex gap-2">
          <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 font-medium">Export CSV</button>
          <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-medium">View PDF</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Exportable insights on staff performance, attendance, and payroll.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm shadow-sm">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition shadow-sm text-sm">
            Generate Master Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Fake Charts for UI visual */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-4">Attendance Trend (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-between gap-2 px-2 pb-2 border-b border-gray-200">
            {/* Fake bar chart */}
            {[80, 85, 92, 90, 75, 98, 95].map((val, i) => (
              <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group">
                <div 
                  className="bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600" 
                  style={{ height: `${val}%` }}
                ></div>
                <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded transition">{val}%</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
          <p className="text-indigo-100 font-medium text-sm">Average Staff Utilization</p>
          <h2 className="text-5xl font-bold mt-2">92%</h2>
          <p className="text-sm mt-4 text-indigo-200">Optimal scheduling across all branches. Kitchen staff is currently highly utilized.</p>
          <button className="mt-6 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm self-start">
            View Analytics Detail
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Available Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Monthly Attendance Summary" 
          desc="Complete log of check-ins, late arrivals, and overtime hours per employee."
          icon="📅"
          color="text-blue-600 bg-blue-100"
        />
        <ReportCard 
          title="Payroll & Deductions" 
          desc="Net pay, bonuses awarded, and tax deductions formatted for accounting."
          icon="💸"
          color="text-green-600 bg-green-100"
        />
        <ReportCard 
          title="Performance Reviews" 
          desc="Historical performance scores, ratings, and manager comments."
          icon="⭐"
          color="text-yellow-600 bg-yellow-100"
        />
        <ReportCard 
          title="Leave Balances" 
          desc="Remaining casual, sick, and paid leaves for the current financial year."
          icon="🌴"
          color="text-orange-600 bg-orange-100"
        />
        <ReportCard 
          title="Shift Swap Audit" 
          desc="Log of all approved and rejected shift swap requests."
          icon="🔄"
          color="text-purple-600 bg-purple-100"
        />
        <ReportCard 
          title="Branch Staffing Density" 
          desc="Analysis of staff coverage vs. required ratios per department."
          icon="📊"
          color="text-indigo-600 bg-indigo-100"
        />
      </div>

    </div>
  );
}
