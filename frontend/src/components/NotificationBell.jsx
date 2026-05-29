import React, { useState, useEffect } from 'react';
import api from '../lib/api';

// NotificationBell (audit task 2165524b AC 9): a header bell that lists recent
// notifications, each rendered with a type-specific icon — recommendation-type
// notifications carry a location-pin so the user can tell context suggestions
// apart from the rest.
const TYPE_ICON = {
  recommendation: '📍',
  verify_failed: '⚠️',
  budget_alert: '💰',
};

function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get('/notifications')
      .then((res) => {
        if (active) setItems(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative" data-testid="notification-bell">
      <button
        onClick={() => setOpen((o) => !o)}
        data-testid="notification-bell-btn"
        className="relative p-2 text-xl"
        aria-label="اعلان‌ها"
      >
        🔔
        {items.length > 0 && (
          <span
            data-testid="notification-bell-count"
            className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full px-1.5"
          >
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div
          data-testid="notification-bell-dropdown"
          className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20"
        >
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 p-2">اعلانی نیست</p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                data-testid={`notif-item-${n.id}`}
                className="text-sm p-2 flex gap-2 items-start hover:bg-gray-50 rounded"
              >
                <span data-testid={`notif-icon-${n.type || 'system'}`}>
                  {TYPE_ICON[n.type] || '🔔'}
                </span>
                <span className="text-gray-800">{n.title || n.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
