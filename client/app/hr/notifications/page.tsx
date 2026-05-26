'use client';

import React, { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://127.0.0.1:8000/api/hr';

  const fetchNotifications = () => {
    fetch(`${API_BASE}/notifications/`)
      .then(res => res.json())
      .then(data => {
        // Sort by unread first, then date
        const sorted = data.sort((a: any, b: any) => {
          if (a.is_read === b.is_read) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return a.is_read ? 1 : -1;
        });
        setNotifications(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch notifications:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    // In a real app, this would be a PATCH request
    // For now, optimistically update UI
    setNotifications(prev => prev.map((n: any) => n.id === id ? { ...n, is_read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Shift': return '🔄';
      case 'Leave': return '🌴';
      case 'Salary': return '💰';
      case 'Warning': return '⚠️';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">You have <strong className="text-blue-600">{unreadCount} unread</strong> messages.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm text-sm">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">You're all caught up! 🎉</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-5 flex gap-4 transition hover:bg-gray-50 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}>
                <div className="text-2xl pt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-bold ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.type} Alert
                    </h3>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!notif.is_read ? 'text-gray-800' : 'text-gray-500'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.is_read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      ✓ Mark as read
                    </button>
                  )}
                </div>
                {!notif.is_read && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
