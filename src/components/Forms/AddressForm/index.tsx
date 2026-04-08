"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef } from "react"
import TextBox from "@/components/form-elements/TextBox"
import { ToggleInput } from "@/external/my-library/components"
import Button from "@/components/Button"
import { useSignal, useSignals } from "@preact/signals-react/runtime"
import { NewAddress } from "@/types"
import { safe } from "@/utils/safe"
import { upsertAddress, setDefaultAddressId } from "@/utils/db/user"
import { showMessage } from "@/utils/showMessage"

// Import Lucide Icons
import { Building, Building2, MapPin, Road, Mailbox, DoorOpen, Tag } from "lucide-react"

type Props = { formId: number } & ComponentPropsWithoutRef<"div">

export default function AddressForm({ formId, ...rest }: Props) {
    useSignals()

    const form = useSignal<NewAddress>({
        userId: "",
        city: "",
        district: "",
        street: "",
        postalCode: "",
        buildingNumber: "",
        apartment: "",
        label: "المنزل",
        id: formId,
    })

    const setAsDefault = useSignal<boolean>(true)

    const handleAdressSave = async () => {
        showMessage({ type: "info", content: "Saving address..." })

        if (typeof form.value.id !== "number") {
            showMessage({ type: "error", content: "Address ID is missing" })
            return
        }

        const result = await safe(upsertAddress({ form: form.value }))
        if (!result.success) {
            showMessage({
                title: "Failed to save address",
                type: "error",
                content: result.error.toString(),
            })
            return
        }

        showMessage({ type: "success", content: "Address saved successfully" })
        if (setAsDefault.value) await safe(setDefaultAddressId(form.value.id))
    }

    return (
        <div className={clsx(styles.root, rest.className)}>
            <h1 className={styles.title}>إضافة عنوان شحن جديد</h1>

            <div className={styles.row}>
                <TextBox
                    label="المدينة"
                    placeholder="الرياض"
                    icon={Building2} // Lucide component reference
                    value={form.value.city}
                    onChange={(e) => (form.value = { ...form.value, city: e.target.value })}
                />
                <TextBox
                    label="الحي"
                    placeholder="حي الياسمين"
                    icon={MapPin}
                    value={form.value.district}
                    onChange={(e) => (form.value = { ...form.value, district: e.target.value })}
                />
            </div>

            <TextBox
                label="اسم الشارع"
                placeholder="شارع الملك فهد"
                icon={Road}
                value={form.value.street}
                onChange={(e) => (form.value = { ...form.value, street: e.target.value })}
            />

            <div className={styles.row}>
                <TextBox
                    label="رقم المبنى"
                    placeholder="1234"
                    icon={Building}
                    value={form.value.buildingNumber ?? ""}
                    onChange={(e) =>
                        (form.value = { ...form.value, buildingNumber: e.target.value })
                    }
                />
                <TextBox
                    label="الرمز البريدي"
                    placeholder="12345"
                    icon={Mailbox}
                    value={form.value.postalCode ?? ""}
                    onChange={(e) => (form.value = { ...form.value, postalCode: e.target.value })}
                />
            </div>

            <div className={styles.row}>
                <TextBox
                    label="رقم الشقة / الدور"
                    placeholder="شقة 5، الدور الثاني"
                    icon={DoorOpen}
                    value={form.value.apartment ?? ""}
                    onChange={(e) => (form.value = { ...form.value, apartment: e.target.value })}
                />
                <TextBox
                    label="تسمية العنوان"
                    placeholder="المنزل"
                    icon={Tag}
                    value={form.value.label ?? ""}
                    onChange={(e) => (form.value = { ...form.value, label: e.target.value })}
                />
            </div>

            <ToggleInput
                label="اجعله العنوان الاساسي"
                startValue={setAsDefault.value}
                onChange={(value) => (setAsDefault.value = value)}
                className={styles.switch}
            />

            <Button type="primary" onClick={handleAdressSave}>
                حفظ العنوان
            </Button>
        </div>
    )
}
