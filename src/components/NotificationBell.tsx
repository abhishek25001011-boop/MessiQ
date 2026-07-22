import { Bell } from "lucide-react";
import { notifications } from "@/data/notifications";

export default function NotificationBell() {
  return (
    <div className="relative">
      <Bell className="w-6 h-6 cursor-pointer" />

      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">
        {notifications.length}
      </span>
    </div>
  );
}