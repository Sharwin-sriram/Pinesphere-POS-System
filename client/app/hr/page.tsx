'use client';

import React, { useState, useEffect } from 'react';

// Basic type definitions
type DashboardData = {
 total_employees: number;
 present_today: number;
 absent_today: number;
 on_leave_today: number;
 salary_pending: number;
 top_performer: string;
 pending_leaves?: number;
 recent_leaves?: any[];
};


type PredictionData = {
 day: string;
 ai_recommendation: string;
 confidence_score: number;
};

export default function HRDashboard() {
 const [data, setData] = useState<DashboardData | null>(null);
 const [aiData, setAiData] = useState<PredictionData | null>(null);
 const [loading, setLoading] = useState(true);

 // In a real app, this would use an environment variable for the API base URL
 const API_BASE = 'http://127.0.0.1:8000/api/hr';

 useEffect(() => {
 let isMounted = true;

 const fetchData = async () => {
 try {
 const [dashRes, aiRes] = await Promise.all([
 fetch(`${API_BASE}/dashboard/`),
 fetch(`${API_BASE}/ai/predict-scheduling/`)
 ]);

 if (dashRes.ok) {
 const dashJson = await dashRes.json();
 if (isMounted) setData(dashJson);
 }
 
 if (aiRes.ok) {
 const aiJson = await aiRes.json();
 if (isMounted) setAiData(aiJson);
 }
 } catch (e) {
 if (isMounted) {
 console.error('Error fetching dashboard data:', e);
 }
 } finally {
 if (isMounted) {
 setLoading(false);
 }
 }
 };

 fetchData();

 return () => {
 isMounted = false;
 };
 }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">Dashboard Overview</h1>
      
      {loading ? (
        <p className="text-[var(--color-text-secondary)]">Loading dashboard data...</p>
      ) : (
        <div className="space-y-8">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--color-bg-secondary)] shadow-sm p-6 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Total Employees</p>
                <p className="text-3xl font-semibold text-[var(--color-text-primary)] mt-2">{data?.total_employees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">👥</div>
            </div>
 
            <div className="bg-[var(--color-bg-secondary)] shadow-sm p-6 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Present Today</p>
                <p className="text-3xl font-semibold text-green-600 mt-2">{data?.present_today}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">✅</div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] shadow-sm p-6 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Pending Leaves</p>
                <p className="text-3xl font-semibold text-yellow-600 mt-2">{data?.pending_leaves}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xl">🏖️</div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] shadow-sm p-6 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)]">Late Arrivals</p>
                <p className="text-3xl font-semibold text-red-600 mt-2">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl">⏱️</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Leave Requests */}
            <div className="bg-[var(--color-bg-secondary)] shadow-sm p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)] flex justify-between items-center">
                Recent Leave Requests
                <a href="/hr/leaves" className="text-sm text-[var(--color-accent)] hover:underline">View All</a>
              </h2>
              {data?.recent_leaves && data.recent_leaves.length > 0 ? (
                <ul className="divide-y divide-[var(--color-border)]">
                  {data.recent_leaves.map((leave: any) => (
                    <li key={leave.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{leave.employee_details?.first_name} {leave.employee_details?.last_name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{leave.leave_type} • {leave.start_date}</p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        {leave.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[var(--color-text-secondary)] text-sm">No recent leave requests.</p>
              )}
            </div>
            
            {/* Quick Actions (Simulated) */}
            <div className="bg-[var(--color-bg-secondary)] shadow-sm p-6 rounded-xl border border-[var(--color-border)]">
              <h2 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-bg-tertiary-hover)] transition flex items-center justify-between">
                  <span>Mark Attendance (Simulate)</span>
                  <span>➔</span>
                </button>
                <a href="/hr/shifts" className="w-full block px-4 py-3 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-bg-tertiary)] transition flex items-center justify-between">
                  <span>Manage Shifts</span>
                  <span>➔</span>
                </a>
                <a href="/hr/payroll" className="w-full block px-4 py-3 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-bg-tertiary)] transition flex items-center justify-between">
                  <span>Process Payroll</span>
                  <span>➔</span>
                </a>
              </div>
 </div>
 </div>
 
 </div>
 )}
 </div>
 );
}

function MetricCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</h3>
      <p className="text-2xl font-semibold text-[var(--color-text-primary)] mt-2">{value}</p>
    </div>
  );
}
