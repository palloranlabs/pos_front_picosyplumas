import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    className,
    icon,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                <input
                    ref={ref}
                    className={clsx(
                        "block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm py-2 px-3 border",
                        icon && "pl-10",
                        error && "border-brand-red focus:border-brand-red focus:ring-brand-red",
                        className
                    )}
                    {...props}
                />
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        {icon}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
