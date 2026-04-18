"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useRef } from "react"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import BaseModal from "../BaseModal"
import Card from "@/components/Card"
import { Trash2Icon } from "lucide-react"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import { passwordValidation } from "@/inputValidations"
import { FormElementRef } from "@/types"
import { deleteMyAccount } from "@/utils/db/user"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"
import { useRouter } from "next/navigation"
type Props = { onClose?: () => void } & ComponentPropsWithoutRef<"div">

export default function DeleteAccountModal({ onClose, ...rest }: Props) {
    useSignals()
    const router = useRouter()
    const isLoading = useSignal<boolean>(false)
    const passwordRef = useRef<FormElementRef>(null)
    const handleAccountDelete = async () => {
        const passwordValue = passwordRef.current?.value
        const validInput = passwordRef.current?.validate()
        if (validInput && passwordValue) {
            isLoading.value = true
            const result = await safe(deleteMyAccount(passwordValue))
            isLoading.value = false
            if (!result.success) {
                return showMessage({ content: result.error.message, type: "error" })
            }
            showMessage({ content: "تم حذف الحساب بنجاح", type: "success" })
            onClose?.()
            router.push("/")
        }
    }
    return (
        <BaseModal className={clsx(styles.root, rest.className)} onOutsideClick={onClose}>
            <Card onClose={onClose} className={styles.window} title="حذف الحساب" icon={Trash2Icon}>
                <TextBox
                    ref={passwordRef}
                    label="كلمة المرور"
                    type="password"
                    helperText="للمتابعة ضع كلمة المرور"
                    validation={(value) => {
                        if (passwordValidation(value)) {
                            return "كلمة المرور غير صحيحة"
                        }
                    }}
                />
                <Button
                    loading={isLoading.value}
                    onClick={handleAccountDelete}
                    type="negative"
                    className={styles.deleteBtn}
                >
                    حذف الحساب
                </Button>
            </Card>
        </BaseModal>
    )
}
