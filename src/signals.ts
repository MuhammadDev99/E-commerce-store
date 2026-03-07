import { signal } from "@preact/signals-react";
import { MessageUI } from "./types";
export const messagesSignal = signal<MessageUI[]>([]);
