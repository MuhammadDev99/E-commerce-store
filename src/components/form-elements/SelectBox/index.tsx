import { forwardRef, ComponentPropsWithoutRef, useRef, useState, useEffect, useMemo } from "react"
import clsx from "clsx"
import styles from "./style.module.css"
import { FormElementRef } from "@/types" // Ensure this is imported from your types file
import { useFormImperativeHandle } from "@/hooks/useFormImperativeHandle"

export type SelectOption = { display: string; value: string | number }
export type SelectGroup = { groupLabel: string; items: SelectOption[] }
type OptionItem = SelectOption | SelectGroup

interface SelectBoxProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
    label?: string
    error?: string
    helperText?: string
    icon?: React.ElementType
    tooltip?: string
    placeholder?: string
    options?: OptionItem[]
    validation?: (value: string) => string | undefined | null
    value?: string | number
    defaultValue?: string | number
    onChange?: (value: string) => void
    required?: boolean
    disabled?: boolean
}

const SelectBox = forwardRef<FormElementRef, SelectBoxProps>(
    (
        {
            label,
            error: externalError,
            helperText,
            className,
            required,
            icon: Icon,
            tooltip,
            disabled,
            options = [],
            placeholder,
            validation,
            onChange,
            defaultValue,
            value: controlledValue,
            ...rest
        },
        ref,
    ) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const [isOpen, setIsOpen] = useState(false)
        const [selectedValue, setSelectedValue] = useState<string>(
            (controlledValue ?? defaultValue ?? "").toString(),
        )

        // --- REUSABLE LOGIC ---
        const { internalError, setInternalError } = useFormImperativeHandle({
            ref,
            containerRef,
            validation,
            getValue: () => selectedValue,
            onFocus: () => setIsOpen(true), // Open dropdown when parent calls .focus()
        })

        const currentError = internalError || externalError
        const hasError = !!currentError

        // Flatten options for easier searching
        const flatOptions = useMemo(() => {
            const items: SelectOption[] = []
            options.forEach((item) => {
                if ("items" in item) items.push(...item.items)
                else items.push(item)
            })
            return items
        }, [options])

        // Find display text for the trigger
        const selectedDisplay = useMemo(() => {
            return (
                flatOptions.find((opt) => opt.value.toString() === selectedValue)?.display ||
                placeholder
            )
        }, [flatOptions, selectedValue, placeholder])

        // Sync controlled value
        useEffect(() => {
            if (controlledValue !== undefined) setSelectedValue(controlledValue.toString())
        }, [controlledValue])

        // Close on click outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }, [])

        const handleSelect = (val: string | number) => {
            const stringVal = val.toString()
            setSelectedValue(stringVal)
            setIsOpen(false)

            // Clear error via the hook's state
            if (internalError) setInternalError(undefined)

            onChange?.(stringVal)
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (disabled) return
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setIsOpen(!isOpen)
            } else if (e.key === "Escape") {
                setIsOpen(false)
            } else if (e.key === "ArrowDown" && !isOpen) {
                setIsOpen(true)
            }
        }

        return (
            <div
                ref={containerRef}
                className={clsx(
                    styles.root,
                    className,
                    required && styles.required,
                    hasError && styles.negative,
                    disabled && styles.disabled,
                    isOpen && styles.isOpen,
                )}
                {...rest}
            >
                {label && (
                    <div className={styles.labelWrapper}>
                        <p className={styles.label}>{label}</p>
                        {Icon && <Icon className={styles.icon} />}
                        {tooltip && (
                            <div className={styles.tooltipContainer} tabIndex={0}>
                                <span className={styles.tooltipTrigger}>?</span>
                                <div className={styles.tooltipBox}>{tooltip}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.selectWrapper}>
                    <div
                        className={clsx(styles.selectTrigger, selectedValue && styles.filled)}
                        tabIndex={disabled ? -1 : 0}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        onKeyDown={handleKeyDown}
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                    >
                        <span className={styles.triggerValue}>{selectedDisplay}</span>
                        <div className={styles.arrowIcon} />
                    </div>

                    {isOpen && (
                        <div className={styles.dropdownMenu} role="listbox">
                            {options.map((item, idx) => {
                                if ("items" in item) {
                                    return (
                                        <div key={idx} className={styles.group}>
                                            <div className={styles.groupLabel}>
                                                {item.groupLabel}
                                            </div>
                                            {item.items.map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    className={clsx(
                                                        styles.option,
                                                        selectedValue === opt.value.toString() &&
                                                            styles.selected,
                                                    )}
                                                    onClick={() => handleSelect(opt.value)}
                                                    role="option"
                                                    aria-selected={
                                                        selectedValue === opt.value.toString()
                                                    }
                                                >
                                                    {opt.display}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                                return (
                                    <div
                                        key={item.value}
                                        className={clsx(
                                            styles.option,
                                            selectedValue === item.value.toString() &&
                                                styles.selected,
                                        )}
                                        onClick={() => handleSelect(item.value)}
                                        role="option"
                                        aria-selected={selectedValue === item.value.toString()}
                                    >
                                        {item.display}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {(currentError || helperText) && (
                    <p className={clsx(styles.message, hasError && styles.errorMessage)}>
                        {currentError || helperText}
                    </p>
                )}
            </div>
        )
    },
)

SelectBox.displayName = "SelectBox"
export default SelectBox
