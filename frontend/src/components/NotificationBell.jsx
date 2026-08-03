import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    api.get('/notifications/my')
      .then(({ data }) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {}); // notifications are supplementary — a failed fetch shouldn't disrupt navigation
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // simple polling, no websocket infra needed for this scope
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClickNotification = async (n) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n.id}/read`);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // non-critical
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // non-critical
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button className="btn btn-sm btn-outline-light position-relative" onClick={() => setOpen((o) => !o)}>
        🔔
        {unreadCount > 0 && (
          <span
            className="position-absolute badge rounded-pill bg-danger"
            style={{ top: -4, right: -4, fontSize: 10 }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card"
          style={{ position: 'absolute', right: 0, top: '110%', width: 320, maxHeight: 400, overflowY: 'auto', zIndex: 1000 }}
        >
          <div className="card-body p-2">
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <strong className="small">Notifications</strong>
              {unreadCount > 0 && (
                <button className="btn btn-link btn-sm p-0" onClick={handleMarkAllRead}>Mark all read</button>
              )}
            </div>
            {notifications.length === 0 && (
              <p className="text-muted small px-1 mb-1">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                className="btn btn-sm text-start w-100 mb-1 border-0"
                style={{ background: n.isRead ? 'transparent' : 'rgba(232,163,61,0.12)', whiteSpace: 'normal' }}
                onClick={() => handleClickNotification(n)}
              >
                <div className="small">{n.message}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
