import React from "react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import clsx from "clsx"
import styles from "./style.module.css"

export default function LineChart({
    className,
    data,
    unit = "",
}: {
    className?: string
    data: { name: string; total: number }[]
    unit?: string
}) {
    return (
        <div className={clsx(styles.root, className)}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 11, right: 10, left: 0, bottom: 0 }}
                    accessibilityLayer={false}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--accent-color, #3b82f6)"
                                stopOpacity={0.5}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--accent-color, #3b82f6)"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke="#e5e7eb" />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickFormatter={(value) => `${unit} ${value.toLocaleString()}`}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2937",
                            borderRadius: "8px",
                            border: "none",
                            color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        // Use 'any' or 'ValueType' to bypass the strict check
                        formatter={(value: any) => [`${unit} ${Number(value).toLocaleString()}`]}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--accent-color, #3b82f6)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        style={{ outline: "none" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
