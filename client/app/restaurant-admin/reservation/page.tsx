"use client";

import React, { useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiUser, FiClock, FiX } from "react-icons/fi";

const mockReservations: Record<number, any[]> = {
  12: [
    { id: 1, name: "Watson Joyce", pax: 5, time: "19:00", table: "Table #01", status: "Confirmed" },
    { id: 2, name: "Sarah Connor", pax: 2, time: "20:30", table: "Table #04", status: "Pending" }
  ],
  15: [
    { id: 3, name: "John Doe", pax: 8, time: "18:00", table: "Table #12", status: "Confirmed" }
  ],
  28: [
    { id: 4, name: "Alice Smith", pax: 4, time: "19:15", table: "Table #07", status: "Confirmed" }
  ]
};

export default function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Generate a mock calendar grid for the month
  const daysInMonth = 31;
  const startOffset = 3; // Starts on Wednesday
  const calendarCells = Array.from({ length: startOffset + daysInMonth }, (_, i) => {
    if (i < startOffset) return null;
    return i - startOffset + 1;
  });

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiCalendar className="text-blue-600" /> Reservations
        </h2>
        
        <div className="flex items-center gap-4 card-light px-4 py-2 !rounded-xl">
          <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors"><FiChevronLeft size={20} /></button>
          <span className="font-bold text-lg min-w-[120px] text-center text-gray-800">March 2026</span>
          <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors"><FiChevronRight size={20} /></button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Calendar Grid */}
        <div className="flex-1 card-light p-6 flex flex-col">
          <div className="grid grid-cols-7 gap-4 mb-4 text-center font-bold text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-4 flex-1">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={idx} className="bg-transparent rounded-xl" />;
              
              const hasReservation = !!mockReservations[day];
              const isSelected = selectedDate === day;

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-gradient-to-tr from-blue-500 to-cyan-400 border-blue-500 text-white shadow-lg transform scale-105" 
                      : "bg-white/50 border-gray-200 hover:border-blue-400 text-gray-700 hover:bg-white"
                  }`}
                >
                  <span className="text-lg font-bold">{day}</span>
                  
                  {hasReservation && (
                    <div className="mt-auto flex flex-col gap-1">
                      <div className={`text-[10px] px-1.5 py-0.5 rounded font-bold truncate ${isSelected ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        {mockReservations[day].length} Bookings
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Panel */}
        {selectedDate && (
          <div className="w-96 card-light p-6 flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">March {selectedDate}, 2026</h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-800">
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-light pr-2 flex flex-col gap-4">
              {mockReservations[selectedDate] ? (
                mockReservations[selectedDate].map((res) => (
                  <div key={res.id} className="bg-white/80 border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{res.table}</span>
                      <span className={`text-xs px-2 py-1 rounded-md font-bold ${res.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {res.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-400" />
                        <span className="text-gray-700 font-medium">{res.name}</span>
                        <span className="text-xs">({res.pax} pax)</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-gray-700">
                        <FiClock className="text-blue-500" />
                        {res.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
                  <FiCalendar size={48} className="opacity-20" />
                  <p>No reservations for this date</p>
                </div>
              )}
            </div>
            
            <button className="mt-6 w-full py-3 bg-gradient-to-tr from-blue-500 to-cyan-400 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all">
              + New Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
