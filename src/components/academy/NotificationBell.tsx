import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, Notification } from "@/lib/api";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (_e) { /* silent */ }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleMarkOne = async (id: number) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const typeIcon = (type: string) => {
    if (type === "grade_added") return "Star";
    if (type === "request_reviewed") return "FileCheck";
    return "Bell";
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="text-muted-foreground hover:text-yellow-400 transition-colors relative"
      >
        <Icon name="Bell" size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 text-[7px] font-bold text-black flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-tactical-panel border border-tactical-border shadow-2xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-tactical-border">
            <span className="font-ibm text-xs font-semibold uppercase tracking-widest text-foreground">
              Уведомления
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[10px] text-primary hover:text-primary/80 font-ibm transition-colors"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <Icon name="BellOff" size={20} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground font-ibm">Нет уведомлений</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-3 py-2.5 border-b border-tactical-border/50 flex gap-2.5 cursor-pointer hover:bg-primary/5 transition-colors ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => !n.is_read && handleMarkOne(n.id)}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${!n.is_read ? "text-yellow-400" : "text-muted-foreground"}`}>
                    <Icon name={typeIcon(n.type)} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold font-ibm leading-tight ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-ibm leading-snug mt-0.5 break-words">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                      {formatTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}