// hooks/use-payment.ts
import { CartItem } from "@/types"; // Use CartItem since it has quantity
import { useState } from "react";

export function usePayment() {
    const [loading, setLoading] = useState(false);

    const startCheckout = async (items: CartItem[]) => {
        setLoading(true);
        try {
            // MAP THE DATA HERE: Clean the payload before sending
            const sanitizedItems = items.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));

            const response = await fetch("/api/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: sanitizedItems }), // Only sending IDs and Quantities
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || "Failed to initialize payment");
            }
        } catch (err: any) {
            alert(err.message);
            setLoading(false);
        }
    };

    return { startCheckout, loading };
}