import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

/* ─── Utility ──────────────────────────────────────────────── */
function cn(...classes: (string | undefined | false | null)[]) {
    return classes.filter(Boolean).join(' ');
}

/* ─── Card ──────────────────────────────────────────────────── */
interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
            }}
            className={cn('relative overflow-hidden', className)}
        >
            {children}
        </div>
    );
}

/* ─── Button ────────────────────────────────────────────────── */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', style, ...props }: ButtonProps) {
    const base: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: 'var(--radius-md)',
        border: 'none',
        outline: 'none',
        transition: 'all 0.18s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        letterSpacing: '-0.01em',
        fontFamily: 'inherit',
    };

    const sizes: Record<string, React.CSSProperties> = {
        sm: { height: '36px', padding: '0 14px', fontSize: '13px' },
        md: { height: '44px', padding: '0 20px', fontSize: '14px' },
        lg: { height: '52px', padding: '0 28px', fontSize: '15px' },
    };

    const variants: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.1)',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
        },
        outline: {
            background: 'transparent',
            color: 'var(--accent-light)',
            border: '1px solid rgba(124,58,237,0.4)',
        },
    };

    return (
        <button
            style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
            className={className}
            {...props}
        />
    );
}

/* ─── Field (Label + Input) ─────────────────────────────────── */
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id?: string;
    error?: string;
}

export function Field({ label, id, error, className, style, ...props }: FieldProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <label
                htmlFor={inputId}
                style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                }}
            >
                {label}
            </label>
            <input
                id={inputId}
                style={{
                    height: '48px',
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    ...style,
                }}
                onFocus={e => {
                    e.currentTarget.style.border = `1px solid var(--border-focus)`;
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)';
                }}
                onBlur={e => {
                    e.currentTarget.style.border = `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`;
                    e.currentTarget.style.boxShadow = 'none';
                }}
                {...props}
            />
            {error && (
                <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '-2px' }}>{error}</p>
            )}
        </div>
    );
}

/* ─── BrandMark ─────────────────────────────────────────────── */
export function BrandMark({ size = 44 }: { size?: number }) {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.1)',
                flexShrink: 0,
            }}
        >
            <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
        </div>
    );
}

/* ─── StatusBadge ───────────────────────────────────────────── */
interface StatusBadgeProps {
    active: boolean;
    activeText?: string;
    inactiveText?: string;
}

export function StatusBadge({ active, activeText = 'Online', inactiveText = 'Offline' }: StatusBadgeProps) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 500,
                background: active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                color: active ? '#34d399' : '#f87171',
                letterSpacing: '-0.01em',
            }}
        >
            <span
                style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: active ? '#10b981' : '#ef4444',
                    boxShadow: active ? '0 0 8px rgba(16,185,129,0.8)' : '0 0 8px rgba(239,68,68,0.7)',
                    flexShrink: 0,
                    animation: active ? 'pulse-dot 2s ease infinite' : 'none',
                }}
            />
            {active ? activeText : inactiveText}
        </span>
    );
}

/* ─── Avatar ────────────────────────────────────────────────── */
const AVATAR_COLORS = [
    ['#7c3aed', '#5b21b6'],
    ['#0ea5e9', '#0369a1'],
    ['#ec4899', '#be185d'],
    ['#f59e0b', '#b45309'],
    ['#10b981', '#065f46'],
    ['#f97316', '#c2410c'],
];

function getAvatarColors(name: string) {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
    const [from, to] = getAvatarColors(name);
    return (
        <div
            aria-hidden="true"
            title={name}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.4,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
                letterSpacing: '-0.01em',
            }}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );
}
