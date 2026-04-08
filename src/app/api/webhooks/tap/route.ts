// app/api/webhooks/tap/route.ts
import { NextResponse } from 'next/server';
import { db } from "@/db";
import { orders, cartItems } from "@/schemas/drizzle";
import { eq, and, ne } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const tapId = payload.id;
        const orderRef = payload.reference?.order;

        if (!tapId || !orderRef) return NextResponse.json({ error: "Invalid Payload" }, { status: 400 });

        // 1. Get the local order from DB
        const [dbOrder] = await db.select().from(orders).where(eq(orders.orderReference, orderRef)).limit(1);
        if (!dbOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // 2. Verify with Tap directly
        const verifyResponse = await fetch(`https://api.tap.company/v2/charges/${tapId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${process.env.TAP_SECRET_KEY}` },
        });

        const officialData = await verifyResponse.json();
        const status = officialData.status;
        const tapAmount = officialData.amount; // The amount the user actually paid

        // --- SECURITY FIX: COMPARE AMOUNTS ---
        // Verify that the amount Tap collected matches our record
        if (tapAmount !== dbOrder.totalAmount) {
            console.error(`FRAUD ALERT: Order ${orderRef} expected ${dbOrder.totalAmount} but paid ${tapAmount}`);
            await db.update(orders).set({ status: "failed" }).where(eq(orders.id, dbOrder.id));
            return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
        }
        // -------------------------------------

        const isSuccess = status === "CAPTURED";
        const isFailed = ["DECLINED", "CANCELLED", "FAILED", "VOID"].includes(status);

        const updated = await db.update(orders)
            .set({
                status: isSuccess ? "paid" : isFailed ? "failed" : "pending",
                tapChargeId: tapId
            })
            .where(and(
                eq(orders.orderReference, orderRef),
                ne(orders.status, "paid")
            ))
            .returning();

        if (isSuccess && updated.length > 0) {
            await db.delete(cartItems).where(eq(cartItems.userId, updated[0].userId));
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}