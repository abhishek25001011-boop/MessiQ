import { Bell } from "lucide-react";
import { notifications } from "@/data/notifications";
import { useState } from "react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}>
        <Bell className="w-6 h-6 cursor-pointer" />
      </button>

      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">
        {notifications.length}
      </span>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-card shadow-lg p-4 z-50">
          <h3 className="font-semibold mb-2">
            Notifications
          </h3>

          {notifications.map((item, index) => (
            <p
              key={index}
              className="text-sm py-2 border-b last:border-none"
            >
              {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}