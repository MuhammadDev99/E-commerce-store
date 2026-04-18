"use client"
import clsx from "clsx"
import styles from "./style.module.css"
import { ComponentPropsWithoutRef, useRef } from "react"
import { useSignals, useSignal } from "@preact/signals-react/runtime"
import TextBox from "@/components/form-elements/TextBox"
import Button from "@/components/Button"
import Card from "@/components/Card"
import { LockIcon, Trash2Icon } from "lucide-react"
import { FormElementRef } from "@/types"
import DeleteAccountModal from "@/components/modals/DeleteAccountModal"
import { passwordValidation } from "@/inputValidations"
import { changeMyPassword } from "@/utils/db/user"
import { safe } from "@/utils/safe"
import { showMessage } from "@/utils/showMessage"
type Props = {} & ComponentPropsWithoutRef<"div">

export default function SecurityClient({ ...rest }: Props) {
    useSignals()
    // Refrences
    const currentPasswordRef = useRef<FormElementRef>(null)
    const newPasswordRef = useRef<FormElementRef>(null)
    const confirmNewPasswordRef = useRef<FormElementRef>(null)

    const showAccountDeletionModal = useSignal<boolean>(false)
    const handlePasswordChange = async () => {
        const currentPassword = currentPasswordRef.current?.value
        const newPassword = newPasswordRef.current?.value
        if (!newPassword || !currentPassword) {
            showMessage({ content: "الرجاء إدخال كلمة المرور الحالية والجديدة", type: "error" })
            return
        }
        const result = await safe(changeMyPassword(currentPassword, newPassword))
        if (!result.success) {
            showMessage({ content: result.error.message, type: "error" })
            return
        }
        showMessage({ content: "تم تغيير كلمة المرور بنجاح", type: "success" })
    }

    return (
        <div className={clsx(styles.root, rest.className)}>
            {showAccountDeletionModal.value && (
                <DeleteAccountModal
                    onClose={() => {
                        showAccountDeletionModal.value = false
                        console.log("onclose")
                    }}
                />
            )}
            <h2>إعدادات الأمان</h2>
            <Card
                className={clsx(styles.card, styles.passwordForm)}
                title="تغيير كلمة السر"
                icon={LockIcon}
            >
                <TextBox
                    ref={currentPasswordRef}
                    className={styles.currentPassword}
                    label="كلمة المرور الحالية"
                    validation={(value) => {
                        if (passwordValidation(value)) {
                            return "كلمة المرور غير صحيحة"
                        }
                    }}
                    onChange={() => currentPasswordRef.current?.validate()}
                />
                <TextBox
                    ref={newPasswordRef}
                    label="كلمة المرور الجديدة"
                    validation={(value) => {
                        const genericError = passwordValidation(value)
                        if (genericError) return genericError
                        if (value === currentPasswordRef.current?.value) {
                            return "كلمة المرور الجديدة يجب أن تختلف عن الحالية"
                        }
                    }}
                    onChange={() => newPasswordRef.current?.validate()}
                />
                <TextBox
                    ref={confirmNewPasswordRef}
                    label="تأكيد كلمة المرور الجديدة"
                    validation={(value) => {
                        if (newPasswordRef.current && newPasswordRef.current.value !== value) {
                            return "كلمة المرور غير متطابقة"
                        }
                    }}
                    onChange={() => confirmNewPasswordRef.current?.validate()}
                />
                <Button
                    onClick={handlePasswordChange}
                    type="primary"
                    className={styles.changePasswordBtn}
                >
                    غير كلمة المرور
                </Button>
            </Card>
            <Card className={styles.card} title="حذف الحساب" icon={Trash2Icon}>
                <p>نحن حزينون لمغادرتك، نتمنى رؤيتك مجدداً!</p>
                <Button
                    type="negative"
                    onClick={() =>
                        (showAccountDeletionModal.value = !showAccountDeletionModal.value)
                    }
                >
                    احذف حسابي
                </Button>
            </Card>
        </div>
    )
}
