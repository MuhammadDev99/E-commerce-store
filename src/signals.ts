import { signal } from "@preact/signals-react";
import { DisplayLanguage, MessageUI } from "./types";
export const messagesSignal = signal<MessageUI[]>([]);
export const searchSignal = signal<boolean>(false);
export const languageSignal = signal<DisplayLanguage>("arabic")