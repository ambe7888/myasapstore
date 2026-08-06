import { LoaderCircle } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    processing?: boolean;
    tabIndex?: number;
    children: React.ReactNode;
}

export default function AuthButton({
    processing = false,
    tabIndex,
    children,
    className = '',
    disabled,
    ...props
}: AuthButtonProps) {
    const { themeColor, customColor } = useBrand();
    const primaryColor = themeColor === 'custom' ? customColor : (THEME_COLORS[themeColor as keyof typeof THEME_COLORS] || '#059669');
    return (
        <button
            {...props}
            type={props.type || 'submit'}
            className={`w-full text-sm text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
            tabIndex={tabIndex}
            disabled={processing || disabled}
        >
            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
            <span>{children}</span>
        </button>
    );
}