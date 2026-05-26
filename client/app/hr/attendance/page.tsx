'use client';

import React, { useState, useEffect } from 'react';

export default function AttendancePage() {
 const [data, setData] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [captureMethod, setCaptureMethod] = useState('PIN');
 
 const API_BASE = 'http://127.0.0.1:8000/api/hr';

 useEffect(() => {
 fetch(`${API_BASE}/attendance/dashboard_data/`)
 .then(res => res.json())
 .then(json => {
 setData(json);
 setLoading(false);
 })
 .catch(err => {
 console.error("Failed to fetch attendance dashboard:", err);
 setLoading(false);
 });
 }, []);

 const metrics = data?.metrics || {};
 const daily_records = data?.daily_records || [];
 const late_arrivals = data?.late_arrivals || [];
 const overtime_employees = data?.overtime_employees || [];
 const corrections = data?.corrections || [];

 const getStatusBadge = (status: string) => {
 switch(status) {
 case 'Present': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Present</span>;
 case 'Late': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Late</span>;
 case 'Absent': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Absent</span>;
 case 'Leave': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> On Leave</span>;
 case 'Half Day': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Half Day</span>;
 default: return <span>{status}</span>;
 }
 };

 const calculateHours = (checkIn: string | null, checkOut: string | null) => {
 if (!checkIn || !checkOut) return '--';
 // Simplified calculation for demo display
 const [inH, inM] = checkIn.split(':').map(Number);
 const [outH, outM] = checkOut.split(':').map(Number);
 let diff = (outH * 60 + outM) - (inH * 60 + inM);
 if (diff < 0) diff += 24 * 60; // crossover midnight
 const h = Math.floor(diff / 60);
 const m = diff % 60;
 return `${h}h ${m}m`;
 };

 return (
 <div className="space-y-6 pb-12">
 
 {/* Header & Date Picker */}
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-3xl font-semibold text-gray-900">Attendance Dashboard</h1>
 <p className="text-gray-500 mt-1">Real-time attendance tracking and insights.</p>
 </div>
 <div className="flex gap-3 items-center">
 <input type="date" className="p-2 border border-gray-200 rounded-lg text-sm " defaultValue={new Date().toISOString().split('T')[0]} />
 <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-bg-primary)] transition ">
 ⬇ Export PDF
 </button>
 </div>
 </div>

 {/* Summary Cards */}
 <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
 <div className="bg-white p-4 rounded-xl border border-gray-100 border-t-4 border-t-green-500">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Present Today</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.present || 0}</p>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 border-t-4 border-t-red-500">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent Today</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.absent || 0}</p>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 border-t-4 border-t-yellow-500">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Late Arrivals</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.late || 0}</p>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 border-t-4 border-t-blue-500">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On Leave</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.on_leave || 0}</p>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 border-t-4 border-t-indigo-500">
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overtime Emp.</p>
 <p className="text-2xl font-semibold text-gray-900 mt-1">{metrics.overtime || 0}</p>
 </div>
 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white">
 <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Attendance %</p>
 <p className="text-3xl font-semibold mt-1">{metrics.attendance_percentage || 0}%</p>
 </div>
 </div>

 {/* Main Content Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 
 {/* Left Column (Table) - Takes up 3 cols */}
 <div className="lg:col-span-3 space-y-6">
 
 {/* Attendance Capture Panel */}
 <div className="bg-white rounded-xl border border-gray-100 p-6">
 <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 border-b pb-2">Attendance Capture</h2>
 
 <div className="flex flex-wrap gap-6 mb-6">
 <label className="flex items-center gap-2 cursor-pointer group">
 <input type="radio" name="method" value="PIN" checked={captureMethod === 'PIN'} onChange={() => setCaptureMethod('PIN')} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
 <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">PIN</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer group">
 <input type="radio" name="method" value="RFID" checked={captureMethod === 'RFID'} onChange={() => setCaptureMethod('RFID')} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
 <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">RFID</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer group">
 <input type="radio" name="method" value="Biometric" checked={captureMethod === 'Biometric'} onChange={() => setCaptureMethod('Biometric')} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
 <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">Biometric</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer group">
 <input type="radio" name="method" value="Face Recognition" checked={captureMethod === 'Face Recognition'} onChange={() => setCaptureMethod('Face Recognition')} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
 <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition">Face Recognition</span>
 </label>
 </div>

 <div className="bg-[var(--color-bg-primary)] rounded-lg p-6 border border-gray-100">
 {captureMethod === 'PIN' && (
 <div className="max-w-sm">
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
 <input type="text" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter ID..." />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
 <input type="password" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="****" />
 </div>
 <div className="flex gap-3 pt-2">
 <button className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 transition text-sm">Check In</button>
 <button className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-700 transition text-sm">Check Out</button>
 </div>
 </div>
 </div>
 )}

 {captureMethod === 'RFID' && (
 <div className="flex flex-col items-center justify-center py-6">
 <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-200">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-1">RFID Reader Status: <span className="text-green-500">Connected</span></h3>
 <p className="text-gray-500 animate-pulse font-medium text-sm">Please tap employee card on the reader...</p>
 </div>
 )}

 {captureMethod === 'Biometric' && (
 <div className="flex flex-col items-center justify-center py-6">
 <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
 </div>
 <h3 className="text-lg font-semibold text-gray-900 mb-1">Biometric Device Status: <span className="text-green-500">Connected</span></h3>
 <p className="text-gray-500 animate-pulse font-medium text-sm">Waiting for fingerprint...</p>
 </div>
 )}

 {captureMethod === 'Face Recognition' && (
 <div className="flex flex-col items-center justify-center py-2">
 <div className="w-full max-w-sm aspect-video bg-gray-900 rounded-xl overflow-hidden relative mb-5 border-4 border-gray-200 shadow-inner">
 <div className="absolute inset-0 flex items-center justify-center">
 <p className="text-gray-400 font-medium text-sm">Camera Preview</p>
 </div>
 {/* Viewfinder crosshairs */}
 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-500/50 rounded-lg">
 <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-blue-500"></div>
 <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-blue-500"></div>
 <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-blue-500"></div>
 <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-blue-500"></div>
 </div>
 </div>
 <button className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 text-sm">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 Start Detection
 </button>
 </div>
 )}
 </div>
 </div>

 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 
 {/* Filter Bar */}
 <div className="p-4 border-b border-gray-100 flex gap-3 bg-[var(--color-bg-primary)]/50 flex-wrap">
 <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white flex-1"><option>All Branches</option></select>
 <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white flex-1"><option>All Departments</option></select>
 <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white flex-1"><option>All Roles</option></select>
 <select className="p-2 border border-gray-200 rounded-lg text-sm bg-white flex-1"><option>Status: All</option></select>
 </div>

 {/* Attendance Table */}
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-[var(--color-bg-primary)]">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept & Role</th>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {loading ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading daily records...</td></tr> : 
 daily_records.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-500">No attendance data for this date.</td></tr> :
 daily_records.map((rec: any) => (
 <tr key={rec.id} className="hover:bg-[var(--color-bg-primary)]">
 <td className="px-4 py-4 whitespace-nowrap">
 <div className="font-semibold text-gray-900">{rec.employee_details?.first_name} {rec.employee_details?.last_name}</div>
 <div className="text-xs text-gray-500 font-mono">EMP{rec.employee_details?.id.toString().padStart(3, '0')}</div>
 </td>
 <td className="px-4 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900">{rec.employee_details?.department}</div>
 <div className="text-xs text-gray-500">{rec.employee_details?.role}</div>
 </td>
 <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
 {rec.check_in_time ? rec.check_in_time.substring(0,5) : '--'}
 </td>
 <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
 {rec.check_out_time ? rec.check_out_time.substring(0,5) : '--'}
 </td>
 <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
 {calculateHours(rec.check_in_time, rec.check_out_time)}
 </td>
 <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
 <span className="bg-[var(--color-bg-tertiary)] px-2 py-1 rounded border border-gray-200">{rec.method}</span>
 </td>
 <td className="px-4 py-4 whitespace-nowrap">
 {getStatusBadge(rec.status)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Method Analytics */}
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <div className="p-4 border-b border-gray-100 bg-[var(--color-bg-primary)]/50">
 <h3 className="font-semibold text-[var(--color-text-primary)]">Attendance Methods Usage Today</h3>
 </div>
 <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center hover: transition">
 <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">PIN</span>
 <span className="text-3xl font-semibold text-blue-600">20</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center hover: transition">
 <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">RFID</span>
 <span className="text-3xl font-semibold text-indigo-600">12</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center hover: transition">
 <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Biometric</span>
 <span className="text-3xl font-semibold text-purple-600">8</span>
 </div>
 <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center hover: transition">
 <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2 text-center">Face Recognition</span>
 <span className="text-3xl font-semibold text-teal-600">5</span>
 </div>
 </div>
 </div>

 </div>

 {/* Right Column (Panels) - Takes up 1 col */}
 <div className="space-y-6">
 
 {/* Late Arrivals Panel */}
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <div className="bg-yellow-50 border-b border-yellow-100 p-4">
 <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
 <span className="text-xl">⚠️</span> Late Employees Today
 </h3>
 </div>
 <div className="p-4">
 {late_arrivals.length === 0 ? (
 <p className="text-sm text-gray-500 italic">No late arrivals today.</p>
 ) : (
 <ul className="space-y-3">
 {late_arrivals.map((rec: any) => (
 <li key={rec.id} className="flex justify-between items-center text-sm">
 <span className="font-medium text-[var(--color-text-primary)]">{rec.employee_details?.first_name}</span>
 <span className="text-red-600 font-semibold">{rec.late_minutes} min late</span>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>

 {/* Overtime Panel */}
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <div className="bg-indigo-50 border-b border-indigo-100 p-4">
 <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
 <span className="text-xl">⏱️</span> Extra Working Hours
 </h3>
 </div>
 <div className="p-4">
 {overtime_employees.length === 0 ? (
 <p className="text-sm text-gray-500 italic">No overtime recorded today.</p>
 ) : (
 <ul className="space-y-3">
 {overtime_employees.map((rec: any) => (
 <li key={rec.id} className="flex justify-between items-center text-sm">
 <span className="font-medium text-[var(--color-text-primary)]">{rec.employee_details?.first_name}</span>
 <span className="text-indigo-600 font-semibold">+{rec.overtime_minutes}m</span>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>

 {/* Correction Requests */}
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <div className="bg-[var(--color-bg-primary)] border-b border-gray-100 p-4">
 <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
 <span className="text-xl">📝</span> Correction Requests
 </h3>
 </div>
 <div className="p-4">
 {corrections.length === 0 ? (
 <p className="text-sm text-gray-500 italic">No pending requests.</p>
 ) : (
 <ul className="space-y-4">
 {corrections.map((corr: any) => (
 <li key={corr.id} className="text-sm border-b pb-3 last:border-0 last:pb-0">
 <div className="flex justify-between mb-1">
 <span className="font-semibold text-[var(--color-text-primary)]">{corr.employee_details?.first_name}</span>
 <span className="text-xs text-gray-400">{corr.date}</span>
 </div>
 <p className="text-[var(--color-text-secondary)] italic text-xs">"{corr.reason}"</p>
 <div className="mt-2 flex gap-2">
 <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 font-medium">Approve</button>
 <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-medium">Reject</button>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>

 {/* Device Status Card */}
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
 <div className="bg-[var(--color-bg-primary)] border-b border-gray-100 p-4">
 <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
 <span className="text-xl">🔌</span> Attendance Devices
 </h3>
 </div>
 <div className="p-4">
 <ul className="space-y-4">
 <li className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
 <span className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> 
 PIN System
 </span>
 <span className="text-green-600 font-semibold flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
 </li>
 <li className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
 <span className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg> 
 RFID Reader
 </span>
 <span className="text-green-600 font-semibold flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</span>
 </li>
 <li className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
 <span className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg> 
 Biometric Device
 </span>
 <span className="text-green-600 font-semibold flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</span>
 </li>
 <li className="flex justify-between items-center text-sm">
 <span className="font-medium text-[var(--color-text-primary)] flex items-center gap-2">
 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> 
 Face AI Camera
 </span>
 <span className="text-blue-600 font-semibold flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Active</span>
 </li>
 </ul>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}
