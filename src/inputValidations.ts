export function passwordValidation(value: string, required: boolean = false) {
    if (!value && required) {
        return "الحقل مطلوب";
    }

    // التأكد من الطول (على الأقل 8 أحرف)
    if (value.length < 8) {
        return "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    }

    // التأكد من وجود حرف كبير واحد على الأقل
    // if (!/[A-Z]/.test(value)) {
    //     return "يجب أن تحتوي على حرف كبير واحد على الأقل";
    // }

    // التأكد من وجود حرف صغير واحد على الأقل
    // if (!/[a-z]/.test(value)) {
    //     return "يجب أن تحتوي على حرف صغير واحد على الأقل";
    // }

    // التأكد من وجود رقم واحد على الأقل
    if (!/[0-9]/.test(value)) {
        return "يجب أن تحتوي على رقم واحد على الأقل";
    }

    // التأكد من وجود رمز خاص واحد على الأقل (اختياري حسب رغبتك)
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    //     return "يجب أن تحتوي على رمز خاص واحد على الأقل (@#$%)";
    // }

    // إذا كانت كلمة المرور صالحة
    return null;
}

export function nameValidation(value: string, required: boolean = false) {
    // التأكد من أن الحقل ليس فارغاً
    if (required && (!value || value.trim() === "")) {
        return "الحقل مطلوب";
    }

    // التأكد من الطول (على الأقل 3 أحرف)
    if (value.trim().length < 3) {
        return "يجب أن يكون الاسم 3 أحرف على الأقل";
    }

    // التأكد من الطول الأقصى (مثلاً 50 حرفاً)
    if (value.length > 50) {
        return "الاسم طويل جداً";
    }

    // التأكد من أن الاسم يحتوي على حروف فقط (يدعم العربية والإنجليزية والمسافات)
    // الحروف العربية: \u0600-\u06FF
    const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
    if (!nameRegex.test(value)) {
        return "يجب أن يحتوي الاسم على حروف فقط";
    }

    // إذا كان الاسم صالحاً
    return null;
}

export function emailValidation(value: string, required: boolean = true) {
    // التأكد من أن الحقل ليس فارغاً
    if (required && (!value || value.trim() === "")) {
        return "البريد الإلكتروني مطلوب";
    }

    // التعبير النمطي (Regex) للتحقق من صيغة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
        return "يرجى إدخال بريد إلكتروني صحيح (مثال: example@domain.com)";
    }

    // إذا كان البريد الإلكتروني صالحاً
    return null;
}