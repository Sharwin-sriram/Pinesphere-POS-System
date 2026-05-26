'use client';

import React, { useState, useEffect } from 'react';

export default function ShiftPlannerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const API_BASE = 'http://127.0.0.1:8000/api/hr';

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/employee-shifts/planner_data/?date=${selectedDate}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch shift planner data:", err);
        setLoading(false);
      });
  }, [selectedDate]);

  const metrics = data?.metrics || {};
  const assignments = data?.assignments || [];
  const swap_requests = data?.swap_requests || [];
  const coverage_warnings = data?.coverage_warnings || [];

  // Group assignments by shift block
  const morningShifts = assignments.filter((a: any) => a.shift_details?.name.toLowerCase().includes('morning'));
  const afternoonShifts = assignments.filter((a: any) => a.shift_details?.name.toLowerCase().includes('afternoon'));
  const nightShifts = assignments.filter((a: any) => a.shift_details?.name.toLowerCase().includes('night'));
  const customShifts = assignments.filter((a: any) => 
    !a.shift_details?.name.toLowerCase().includes('morning') && 
    !a.shift_details?.name.toLowerCase().includes('afternoon') && 
    !a.shift_details?.name.toLowerCase().includes('night')
  );

  const ShiftBlock = ({ title, icon, shifts, colorClass }: { title: string, icon: string, shifts: any[], colorClass: string }) => (
    <div className={`rounded-xl border ${colorClass} overflow-hidden`}>
      <div className={`px-4 py-3 border-b flex justify-between items-center ${colorClass.replace('bg-', 'bg-opacity-50 ')}`}>
        <h3 className="font-bold flex items-center gap-2">
          <span className="text-xl">{icon}</span> {title}
        </h3>
        <span className="text-sm font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">{shifts.length} Staff</span>
      </div>
      <div className="p-4 bg-white/50 space-y-3 min-h-[100px]">
        {shifts.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-4">No staff assigned.</p>
        ) : (
          shifts.map(shift => (
            <div key={shift.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group hover:border-blue-300 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {shift.employee_details?.first_name[0]}{shift.employee_details?.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{shift.employee_details?.first_name} {shift.employee_details?.last_name}</p>
                  <p className="text-xs text-gray-500">{shift.employee_details?.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                  {shift.shift_details?.start_time.substring(0,5)} - {shift.shift_details?.end_time.substring(0,5)}
                </p>
                <button className="text-xs text-blue-600 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition">Edit</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shift Planner</h1>
          <p className="text-gray-500 mt-1">Manage staff schedules, swaps, and coverage for <strong className="text-gray-800">{selectedDate}</strong>.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
            Auto-Schedule AI 🪄
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
            + Assign Shift
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl shadow-sm border border-orange-200">
          <p className="text-xs font-bold text-orange-800 uppercase tracking-wider flex gap-1 items-center"><span>🌅</span> Morning Shift</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{metrics.morning || 0} <span className="text-sm font-normal text-orange-700">staff</span></p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm border border-blue-200">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider flex gap-1 items-center"><span>☀️</span> Afternoon Shift</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{metrics.evening || 0} <span className="text-sm font-normal text-blue-700">staff</span></p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl shadow-sm border border-indigo-200">
          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex gap-1 items-center"><span>🌙</span> Night Shift</p>
          <p className="text-2xl font-bold text-indigo-900 mt-1">{metrics.night || 0} <span className="text-sm font-normal text-indigo-700">staff</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unassigned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.unassigned || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Swap Requests</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{metrics.swap_requests || 0}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column (Daily Roster) - Takes up 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            
            {/* Filter Bar */}
            <div className="flex gap-4 items-center mb-6 pb-6 border-b border-gray-100 flex-wrap">
              <input 
                type="date" 
                className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 shadow-inner font-medium text-blue-900" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm"><option>All Branches</option></select>
              <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white shadow-sm"><option>All Departments</option></select>
              <input type="text" placeholder="Search employee..." className="p-2 border border-gray-200 rounded-lg text-sm shadow-sm flex-1" />
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading daily roster...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ShiftBlock title="Morning" icon="🌅" shifts={morningShifts} colorClass="bg-orange-50 border-orange-200 text-orange-900" />
                <ShiftBlock title="Afternoon" icon="☀️" shifts={afternoonShifts} colorClass="bg-blue-50 border-blue-200 text-blue-900" />
                <ShiftBlock title="Night" icon="🌙" shifts={nightShifts} colorClass="bg-indigo-50 border-indigo-200 text-indigo-900" />
              </div>
            )}
            
            {!loading && customShifts.length > 0 && (
              <div className="mt-6">
                <ShiftBlock title="Custom Shifts" icon="⚙️" shifts={customShifts} colorClass="bg-gray-50 border-gray-200 text-gray-900" />
              </div>
            )}

          </div>
        </div>

        {/* Right Column (Panels) - Takes up 1 col */}
        <div className="space-y-6">
          
          {/* Quick Assign Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">⚡ Quick Assign</h3>
            </div>
            <div className="p-4 space-y-3">
              <select className="w-full p-2 border border-gray-200 rounded text-sm"><option>Select Employee</option></select>
              <select className="w-full p-2 border border-gray-200 rounded text-sm"><option>Select Shift</option></select>
              <button className="w-full bg-blue-600 text-white p-2 rounded text-sm font-medium hover:bg-blue-700 transition">Assign</button>
            </div>
          </div>

          {/* Coverage & Alerts Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 p-4">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <span className="text-xl">🚨</span> Coverage Alerts
              </h3>
            </div>
            <div className="p-4">
              {coverage_warnings.length === 0 ? (
                <p className="text-sm text-green-600 font-medium flex items-center gap-2">✅ Optimal coverage achieved.</p>
              ) : (
                <ul className="space-y-2">
                  {coverage_warnings.map((warn: any, i: number) => (
                    <li key={i} className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-100 font-medium flex gap-2 items-start">
                      <span>•</span> {warn.msg}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Swap Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-purple-50 border-b border-purple-100 p-4">
              <h3 className="font-bold text-purple-800 flex items-center gap-2">
                <span className="text-xl">🔄</span> Swap Requests
              </h3>
            </div>
            <div className="p-4">
              {swap_requests.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No pending requests.</p>
              ) : (
                <ul className="space-y-4">
                  {swap_requests.map((req: any) => (
                    <li key={req.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-gray-800">{req.employee_details?.first_name}</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 rounded-full font-bold">Pending</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="line-through">{req.current_shift_details?.name}</span>
                        <span>➡️</span>
                        <span className="font-bold text-gray-900">{req.requested_shift_details?.name}</span>
                      </div>
                      <p className="text-gray-500 italic text-xs mt-2">"{req.reason || 'No reason provided'}"</p>
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 text-xs bg-green-100 text-green-700 py-1.5 rounded hover:bg-green-200 font-medium transition">Approve</button>
                        <button className="flex-1 text-xs bg-red-100 text-red-700 py-1.5 rounded hover:bg-red-200 font-medium transition">Reject</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
