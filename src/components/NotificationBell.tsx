import { Bell } from "lucide-react";
import { useState } from "react";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-6 h-6 cursor-pointer" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-card shadow-lg p-4 z-50">
          <h3 className="font-semibold mb-2">
            Notifications
          </h3>

          <p className="py-2 text-sm text-muted-foreground">No new notifications</p>
        </div>
      )}
    </div>
  );
}
