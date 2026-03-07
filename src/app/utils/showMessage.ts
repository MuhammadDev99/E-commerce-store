import { MessageUI } from "@/types";
import { messagesSignal } from "@/signals";
export function showMessage(message: Omit<MessageUI, "id">): void;
export function showMessage(content: string): void;
export function showMessage(payload: Omit<MessageUI, "id"> | string) {
  const partialMessage =
    typeof payload === "string"
      ? {
          content: payload,
          durationMs: 3000,
          title: "",
          type: "info" as const,
        }
      : payload;
  const message: MessageUI = { ...partialMessage, id: Date.now() };
  messagesSignal.value = [...messagesSignal.value, message];
  setTimeout(
    () =>
      (messagesSignal.value = messagesSignal.value.filter(
        (x) => x.id !== message.id,
      )),
    message.durationMs,
  );
}
