export const parseDecimal = (value: string | number): number => {
    return typeof value === 'string' ? parseFloat(value) : value;
};

export const formatCurrency = (value: string | number): string => {
    const num = parseDecimal(value);
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(num);
};
