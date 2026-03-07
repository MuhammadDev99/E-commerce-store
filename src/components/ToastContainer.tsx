// components/ToastContainer.tsx
"use client";
import { notification } from "@/lib/notifications";
import { useSignals } from "@preact/signals-react/runtime";

export default function ToastContainer() {
  useSignals();
  // Accessing .value here makes this component "subscribe" to changes
  const active = notification.value;

  if (!active) return null;

  return (
    <div
      className={`fixed bottom-5 right-5 p-4 rounded text-white shadow-xl ${
        active.type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {active.message}
    </div>
  );
}
