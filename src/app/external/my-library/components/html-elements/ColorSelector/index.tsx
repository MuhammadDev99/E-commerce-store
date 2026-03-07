import { useState } from 'react'
import styles from '../style.module.css'
type HexColor = `#${string}`

export default function ColorSelector({ label, defaultColor, onColorChange }: { label: string, defaultColor?: HexColor, onColorChange?: (color: HexColor) => void }) {
    const [color, setColor] = useState<HexColor>(defaultColor ?? "#ffffff")
    function handleColorChange(color: HexColor) {
        setColor(color)
        onColorChange?.(color)
    }
    return (<label className={styles.colorSelectorItem}>
        <span>{label}</span>
        <input className={styles.hiddenInput} value={color} onChange={(e) => handleColorChange(e.target.value as HexColor)} type="color" />
        <span className={styles.customColorbox} style={{ backgroundColor: color }}></span>
    </label>)
}