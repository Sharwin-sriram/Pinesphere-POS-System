'use client';

import React, { useState, useEffect, useRef } from 'react';

type EmployeeData = {
 name: string;
 role: string;
 next_shift: { name: string; date: string; start_time: string; end_time: string } | null;
 casual_leaves: number;
 sick_leaves: number;
 performance_score: string;
};

export default function EmployeeMobileApp() {
 const [data, setData] = useState<EmployeeData | null>(null);
 const [loading, setLoading] = useState(true);
 const [showCamera, setShowCamera] = useState(false);
 const [attendanceMsg, setAttendanceMsg] = useState<string | null>(null);
 const videoRef = useRef<HTMLVideoElement>(null);

 // Hardcoded for demo purposes (Assuming Employee ID 1 exists)
 const EMPLOYEE_ID = 1;
 const API_BASE = 'http://127.0.0.1:8000/api/hr';

 useEffect(() => {
 const fetchMyDashboard = async () => {
 try {
 const res = await fetch(`${API_BASE}/employees/${EMPLOYEE_ID}/my-dashboard/`);
 if (res.ok) {
 const json = await res.json();
 setData(json);
 }
 } catch (e) {
 console.error('Error fetching employee dashboard:', e);
 } finally {
 setLoading(false);
 }
 };

 fetchMyDashboard();
 }, []);

 const openCamera = async () => {
 setShowCamera(true);
 setAttendanceMsg(null);
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ video: true });
 if (videoRef.current) {
 videoRef.current.srcObject = stream;
 }
 } catch (e) {
 console.error('Error accessing camera:', e);
 setAttendanceMsg('Camera permission denied or unavailable.');
 }
 };

 const closeCamera = () => {
 if (videoRef.current && videoRef.current.srcObject) {
 const stream = videoRef.current.srcObject as MediaStream;
 stream.getTracks().forEach(track => track.stop());
 }
 setShowCamera(false);
 };

 const simulateCheckIn = async () => {
 try {
 // Create a time string like "09:15"
 const now = new Date();
 const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
 
 const res = await fetch(`${API_BASE}/attendance/mark/`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ employee_id: EMPLOYEE_ID, time: timeStr })
 });
 const json = await res.json();
 
 if (res.ok) {
 if (json.late_minutes) {
 setAttendanceMsg(`✅ ${json.message}. You were marked LATE by ${json.late_minutes} minutes.`);
 } else {
 setAttendanceMsg(`✅ ${json.message}. Status: ${json.status || 'Checked Out'}`);
 }
 } else {
 setAttendanceMsg(`❌ Error: ${json.error}`);
 }
 } catch (e) {
 setAttendanceMsg('Error simulating check-in.');
 }
 
 closeCamera();
 };

 if (loading) {
 return <div className="min-h-screen bg-[var(--color-bg-tertiary)] p-6 flex items-center justify-center">Loading your dashboard...</div>;
 }

 return (
 <div className="min-h-screen bg-[var(--color-bg-tertiary)] font-sans text-[var(--color-text-primary)] pb-20">
 
 {/* Header Profile */}
 <div className="bg-indigo-600 p-6 pt-12 text-white rounded-b-3xl">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
 👤
 </div>
 <div>
 <h1 className="text-2xl font-semibold">{data?.name || "Employee"}</h1>
 <p className="text-indigo-100">{data?.role || "Staff"}</p>
 </div>
 </div>
 </div>

 <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
 
 {/* Attendance Msg */}
 {attendanceMsg && (
 <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-medium">
 {attendanceMsg}
 </div>
 )}

 {/* Camera / Check In */}
 {!showCamera ? (
 <div className="bg-white p-5 rounded-2xl border border-gray-100 text-center">
 <h2 className="font-semibold mb-2">Smart Attendance</h2>
 <p className="text-sm text-gray-500 mb-4">Scan your face to check-in or check-out of your shift.</p>
 <button 
 onClick={openCamera}
 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
 >
 📸 Open Scanner
 </button>
 </div>
 ) : (
 <div className="bg-black p-4 rounded-2xl text-center">
 <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-gray-800 rounded-xl mb-4 object-cover"></video>
 <div className="flex gap-2">
 <button onClick={closeCamera} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium">Cancel</button>
 <button onClick={simulateCheckIn} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium">Scan & Match</button>
 </div>
 </div>
 )}

 {/* Next Shift */}
 <div className="bg-white p-5 rounded-2xl border border-gray-100">
 <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming Shift</h2>
 {data?.next_shift ? (
 <div>
 <p className="text-lg font-semibold text-gray-900">{data.next_shift.name}</p>
 <p className="text-[var(--color-text-secondary)]">{data.next_shift.date} • {data.next_shift.start_time} - {data.next_shift.end_time}</p>
 </div>
 ) : (
 <p className="text-gray-500 italic">No upcoming shifts assigned.</p>
 )}
 </div>

 {/* Quick Stats Grid */}
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white p-4 rounded-2xl border border-gray-100">
 <h3 className="text-xs font-semibold text-gray-500 uppercase">Leaves Left</h3>
 <p className="text-2xl font-semibold mt-1">{data?.casual_leaves || 0} Casual</p>
 </div>
 <div className="bg-white p-4 rounded-2xl border border-gray-100">
 <h3 className="text-xs font-semibold text-gray-500 uppercase">Performance</h3>
 <p className="text-xl font-semibold mt-1 text-indigo-600">{data?.performance_score || "N/A"}</p>
 </div>
 </div>

 {/* Actions List */}
 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mt-4">
 <button className="w-full text-left p-4 border-b border-gray-50 flex justify-between items-center hover:bg-[var(--color-bg-primary)] transition">
 <span className="font-medium">📅 Apply for Leave</span>
 <span className="text-gray-400">➔</span>
 </button>
 <button className="w-full text-left p-4 border-b border-gray-50 flex justify-between items-center hover:bg-[var(--color-bg-primary)] transition">
 <span className="font-medium">🕒 Attendance History</span>
 <span className="text-gray-400">➔</span>
 </button>
 <button className="w-full text-left p-4 flex justify-between items-center hover:bg-[var(--color-bg-primary)] transition">
 <span className="font-medium">💰 Salary Slips</span>
 <span className="text-gray-400">➔</span>
 </button>
 </div>

 </div>
 </div>
 );
}
