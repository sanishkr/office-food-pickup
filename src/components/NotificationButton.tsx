import React from "react";
import { useNotifications } from "../hooks/useNotifications";

export const NotificationButton: React.FC = () => {
  const { notificationPermission, requestPermission } = useNotifications();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  if (!("Notification" in window)) {
    return null;
  }

  if (notificationPermission === "granted") {
    return (
      <div className="relative cursor-default" title="Notifications enabled">
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRequestPermission}
      className="relative"
      title={
        notificationPermission === "denied"
          ? "Notification permission blocked"
          : "Enable notifications"
      }
    >
      <svg
        className={`w-5 h-5 ${
          notificationPermission === "denied"
            ? "text-gray-300 dark:text-gray-600"
            : "text-purple-600 hover:text-purple-900 animate-pulse hover:animate-bounce hover:scale-110 transition-transform duration-200"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    </button>
  );
};
