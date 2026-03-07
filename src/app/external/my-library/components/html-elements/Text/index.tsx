import clsx from 'clsx'
import styles from '../style.module.css'

interface TextProps {
    children: React.ReactNode;
    className?: string;
    size?: 'small' | 'medium' | 'large';
    weight?: 'normal' | 'bold';
    darkness?: 'low' | 'medium' | 'high';
    as?: 'p' | 'span' | 'h1' | 'h2' | 'div';
}

export default function Text({
    children,
    className,
    size = 'medium',
    weight = 'normal',
    darkness = 'high',
    as: Component = 'p'
}: TextProps) {
    return (
        <Component
            className={clsx(
                styles.text,
                styles["size_" + size],
                styles["weight_" + weight],
                styles["darkness_" + darkness],
                className
            )}
        >
            {children}
        </Component>
    );
};