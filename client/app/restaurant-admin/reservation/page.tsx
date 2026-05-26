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
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiCalendar className="text-[#EA7C69]" /> Reservations
        </h2>
        
        <div className="flex items-center gap-4 bg-[#252836] px-4 py-2 rounded-xl border border-gray-800">
          <button className="p-1 hover:text-[#EA7C69] transition-colors"><FiChevronLeft size={20} /></button>
          <span className="font-semibold text-lg min-w-[120px] text-center">March 2026</span>
          <button className="p-1 hover:text-[#EA7C69] transition-colors"><FiChevronRight size={20} /></button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Calendar Grid */}
        <div className="flex-1 bg-[#252836] rounded-2xl border border-gray-800 p-6 flex flex-col">
          <div className="grid grid-cols-7 gap-4 mb-4 text-center font-semibold text-gray-400">
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
                      ? "bg-[#EA7C69] border-[#EA7C69] text-white shadow-lg transform scale-105" 
                      : "bg-[#1f1d2b] border-gray-800 hover:border-[#EA7C69]/50 text-gray-300"
                  }`}
                >
                  <span className="text-lg font-bold">{day}</span>
                  
                  {hasReservation && (
                    <div className="mt-auto flex flex-col gap-1">
                      <div className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${isSelected ? 'bg-white/20 text-white' : 'bg-[#EA7C69]/20 text-[#EA7C69]'}`}>
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
          <div className="w-96 bg-[#252836] rounded-2xl border border-gray-800 p-6 flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">March {selectedDate}, 2026</h3>
              <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-light pr-2 flex flex-col gap-4">
              {mockReservations[selectedDate] ? (
                mockReservations[selectedDate].map((res) => (
                  <div key={res.id} className="bg-[#1f1d2b] border border-gray-700 rounded-xl p-4 hover:border-[#EA7C69] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-lg text-white group-hover:text-[#EA7C69] transition-colors">{res.table}</span>
                      <span className={`text-xs px-2 py-1 rounded-md font-bold ${res.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {res.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-500" />
                        <span className="text-gray-300">{res.name}</span>
                        <span className="text-xs">({res.pax} pax)</span>
                      </div>
                      <div className="flex items-center gap-1 font-medium">
                        <FiClock className="text-[#EA7C69]" />
                        {res.time}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-3">
                  <FiCalendar size={48} className="opacity-20" />
                  <p>No reservations for this date</p>
                </div>
              )}
            </div>
            
            <button className="mt-6 w-full py-3 bg-[#EA7C69] text-white rounded-xl font-bold hover:bg-[#ffb6c1] hover:text-[#1f1d2b] transition-all shadow-[0_0_15px_rgba(234,124,105,0.3)]">
              + New Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
