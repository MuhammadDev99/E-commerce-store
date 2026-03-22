import React from "react"
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import clsx from "clsx"
import styles from "./style.module.css"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default function PieChart({
    className,
    data,
    unit = "",
}: {
    className?: string
    data: { name: string; value: number }[]
    unit?: string
}) {
    // 1. Create a Custom Tooltip Component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0]

            return (
                <div
                    style={{
                        backgroundColor: "#1f2937",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        border: "none",
                    }}
                >
                    <span style={{ color: "#fff", fontSize: "16px" }}>{dataItem.name}</span>
                    <span style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
                        {Number(dataItem.value).toLocaleString()} {unit}
                    </span>
                </div>
            )
        }
        return null
    }

    return (
        <div className={clsx(styles.root, className)}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart accessibilityLayer={false}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                style={{ outline: "none" }}
                            />
                        ))}
                    </Pie>

                    {/* 2. Pass the transition overrides here */}
                    <Tooltip
                        content={<CustomTooltip />}
                        isAnimationActive={false}
                        wrapperStyle={{ transition: "none", outline: "none" }}
                    />

                    <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    )
}
