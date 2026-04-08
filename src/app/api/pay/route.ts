// app/api/pay/route.ts
import { NextResponse } from 'next/server';
import { db } from "@/db";
import { orders, orderItems, products as productTable } from "@/schemas/drizzle";
import { generateUniqueRef } from "@/utils/id-generator";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
// Import your types
import { CartItem, NewOrder, NewOrderItem } from "@/types";

export async function POST(req: Request) {
    try {
        // 1. Authenticate the User
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
        }

        // 2. Get the items from the request
        // We only trust the 'id' and 'quantity' from the client.
        const body = await req.json();
        const clientItems: { id: number; quantity: number }[] = body.items;

        if (!clientItems || clientItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 3. SECURITY: Fetch actual prices from the Database
        const itemIds = clientItems.map(item => item.id);
        const dbProducts = await db
            .select()
            .from(productTable)
            .where(inArray(productTable.id, itemIds));

        // 4. Calculate Verified Total and prepare data
        let totalAmount = 0;
        const verifiedItemsToInsert: Omit<NewOrderItem, "orderId">[] = [];
        const itemSummaries: string[] = [];

        for (const clientItem of clientItems) {
            const dbProduct = dbProducts.find(p => p.id === clientItem.id);

            if (!dbProduct) {
                return NextResponse.json({ error: `Product ID ${clientItem.id} not found.` }, { status: 404 });
            }

            // Ensure quantity is at least 1 to prevent "negative price" attacks
            const validatedQuantity = Math.max(1, clientItem.quantity);
            const verifiedPrice = dbProduct.price;

            totalAmount += verifiedPrice * validatedQuantity;

            verifiedItemsToInsert.push({
                productId: dbProduct.id,
                quantity: validatedQuantity,
                priceAtPurchase: verifiedPrice,
            });

            itemSummaries.push(`${validatedQuantity}x ${dbProduct.name}`);
        }

        // 5. Generate a Unique Reference for Tap
        const orderRef = await generateUniqueRef({
            table: orders,
            column: orders.orderReference,
            length: 9,
            prefix: "ORD-" // Results in ORD-123456789
        });

        // 6. Database Transaction: Create Order and OrderItems
        const newOrderId = await db.transaction(async (tx) => {
            // A. Insert into Orders Table
            const [insertedOrder] = await tx.insert(orders).values({
                orderReference: orderRef,
                userId: session.user.id,
                totalAmount: totalAmount,
                status: "pending",
            }).returning({ id: orders.id });

            // B. Insert into OrderItems Table (Linking to the new Order ID)
            const finalOrderItems: NewOrderItem[] = verifiedItemsToInsert.map(item => ({
                ...item,
                orderId: insertedOrder.id,
            }));

            await tx.insert(orderItems).values(finalOrderItems);

            return insertedOrder.id;
        });

        // 7. Initialize Tap Payment
        const tapResponse = await fetch("https://api.tap.company/v2/charges/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.TAP_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                amount: totalAmount,
                currency: "SAR",
                threeDSecure: true,
                customer_initiated: true,
                description: itemSummaries.join(", ").substring(0, 250),
                metadata: {
                    order_db_id: newOrderId,
                },
                source: { id: "src_all" },
                reference: {
                    order: orderRef // This is our Single Source of Truth link
                },
                customer: {
                    first_name: session.user.name,
                    email: session.user.email,
                },
                // Redirect user back to the result page (Read-only)
                redirect: {
                    url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/result`
                },
                // Tap calls this in the background (Our Single Source of Truth updater)
                post: {
                    url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/tap`
                }
            }),
        });

        const data = await tapResponse.json();

        if (tapResponse.ok && data.transaction?.url) {
            return NextResponse.json({ url: data.transaction.url });
        } else {
            console.error("Tap API Error:", data);
            return NextResponse.json({
                error: data.errors?.[0]?.description || "Payment initialization failed"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Internal Payment Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}