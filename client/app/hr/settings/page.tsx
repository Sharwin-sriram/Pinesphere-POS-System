'use client';

import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // Simulated state for settings
  const [settings, setSettings] = useState({
    autoApproveCasualLeave: true,
    lateThresholdMins: 15,
    enableFaceScan: true,
    overtimeMultiplier: 1.5,
    notifyOnShiftSwap: true,
    requireManagerApprovalForOvertime: false
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // Simulated save
    alert('Settings saved successfully!');
  };

  const Toggle = ({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <button 
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Settings</h1>
          <p className="text-gray-500 mt-1">Configure automated rules, policies, and permissions.</p>
        </div>
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
          Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 pt-4">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          {['general', 'attendance', 'shifts', 'payroll'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition capitalize ${
                activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab} Settings
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {activeTab === 'general' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">General Policies</h2>
              <div className="space-y-4">
                <Toggle 
                  label="Enable Biometric Face Scan" 
                  desc="Allow employees to use camera for instant attendance check-in." 
                  checked={settings.enableFaceScan} 
                  onChange={() => handleToggle('enableFaceScan')} 
                />
                <Toggle 
                  label="Manager Notification on Shift Swaps" 
                  desc="Send an automatic email/alert when an employee requests a swap." 
                  checked={settings.notifyOnShiftSwap} 
                  onChange={() => handleToggle('notifyOnShiftSwap')} 
                />
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">Attendance & Leaves</h2>
              <div className="space-y-4">
                <div className="py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Late Arrival Threshold (Minutes)</p>
                    <p className="text-sm text-gray-500">Grace period before an employee is marked as 'Late'.</p>
                  </div>
                  <input 
                    type="number" 
                    value={settings.lateThresholdMins} 
                    onChange={e => setSettings({...settings, lateThresholdMins: Number(e.target.value)})}
                    className="w-20 p-2 border border-gray-300 rounded text-center"
                  />
                </div>
                <Toggle 
                  label="Auto-Approve Casual Leaves" 
                  desc="If employee has remaining balance, automatically approve casual leave requests." 
                  checked={settings.autoApproveCasualLeave} 
                  onChange={() => handleToggle('autoApproveCasualLeave')} 
                />
              </div>
            </div>
          )}

          {activeTab === 'shifts' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">Shift Management</h2>
              <div className="text-center p-8">
                <p className="text-gray-500 mb-4">Shift rules and hours are configured here.</p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 text-sm inline-block">
                  <span className="font-bold">Pro Tip:</span> Use the Auto-Schedule AI in the Planner to automatically balance shifts based on these rules.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">Payroll & Overtime</h2>
              <div className="space-y-4">
                <div className="py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Overtime Pay Multiplier</p>
                    <p className="text-sm text-gray-500">Standard is 1.5x of base hourly rate.</p>
                  </div>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.overtimeMultiplier} 
                    onChange={e => setSettings({...settings, overtimeMultiplier: Number(e.target.value)})}
                    className="w-20 p-2 border border-gray-300 rounded text-center"
                  />
                </div>
                <Toggle 
                  label="Require Manager Approval for Overtime" 
                  desc="Overtime hours won't be paid unless manually approved." 
                  checked={settings.requireManagerApprovalForOvertime} 
                  onChange={() => handleToggle('requireManagerApprovalForOvertime')} 
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
