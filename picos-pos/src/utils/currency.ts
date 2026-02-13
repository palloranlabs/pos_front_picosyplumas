export const parseDecimal = (value: string | number): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrency = (value: string | number): string => {
    const num = parseDecimal(value);
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(num);
};
