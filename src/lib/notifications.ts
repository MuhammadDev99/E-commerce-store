// lib/notifications.ts
import { signal } from "@preact/signals-react";

export type NotificationType = "success" | "error";

// The "Signal" holds the value globally
export const notification = signal<{
  type: NotificationType;
  message: string;
} | null>(null);

// A simple, pure JS function to trigger the UI
export const showNotification = (type: NotificationType, message: string) => {
  notification.value = { type, message };

  setTimeout(() => {
    notification.value = null;
  }, 3000);
};
