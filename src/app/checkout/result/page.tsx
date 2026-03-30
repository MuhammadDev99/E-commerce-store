// app/checkout/result/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"

async function getLiveStatus(chargeId: string) {
    const res = await fetch(`https://api.tap.company/v2/charges/${chargeId}`, {
        headers: { Authorization: `Bearer ${process.env.TAP_SECRET_KEY}` },
        cache: "no-store",
    })
    return res.ok ? res.json() : null
}

export default async function CheckoutResultPage({
    searchParams,
}: {
    searchParams: Promise<{ tap_id?: string }>
}) {
    const { tap_id: tapId } = await searchParams
    if (!tapId) redirect("/")

    // Fetch ONLY for display purposes
    const charge = await getLiveStatus(tapId)
    if (!charge) return <div>حدث خطأ في عرض النتيجة</div>

    const isSuccess = charge.status === "CAPTURED"
    const orderRef = charge.reference?.order

    return (
        <div style={containerStyle}>
            {isSuccess ? (
                <div>
                    <span style={{ fontSize: "50px" }}>✅</span>
                    <h1>تم الدفع بنجاح</h1>
                    <p>رقم الطلب: {orderRef}</p>
                    <Link href="/">
                        <button style={buttonStyle}>العودة للمتجر</button>
                    </Link>
                </div>
            ) : (
                <div>
                    <span style={{ fontSize: "50px" }}>❌</span>
                    <h1>فشلت العملية</h1>
                    <p>السبب: {charge.response?.message}</p>
                    <Link href="/cart">
                        <button style={{ ...buttonStyle, backgroundColor: "red" }}>
                            حاول مرة أخرى
                        </button>
                    </Link>
                </div>
            )}
        </div>
    )
}

const containerStyle: React.CSSProperties = {
    maxWidth: "500px",
    margin: "100px auto",
    textAlign: "center",
    direction: "rtl",
    border: "1px solid #eee",
    padding: "40px",
    borderRadius: "10px",
}
const buttonStyle: React.CSSProperties = {
    marginTop: "20px",
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: "black",
    color: "white",
    border: "none",
    borderRadius: "5px",
}
