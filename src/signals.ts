import { signal } from "@preact/signals-react";
import { Coupon, DisplayLanguage, MessageUI, Product } from "./types";
export const messagesSignal = signal<MessageUI[]>([]);
export const searchSignal = signal<boolean>(false);
export const languageSignal = signal<DisplayLanguage>("arabic")
export const addedItemSignal = signal<Product | null>(null)
export const cartCountSignal = signal(0); // Initialize at 0
export const couponsTableSignal = signal<Coupon[]>([])