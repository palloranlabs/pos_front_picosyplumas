import { z } from 'zod';

// Regex for Zod Validation (matches API requirement)
export const DECIMAL_REGEX = /^(?!^[-+.]*$)[+-]?0*(?:\d{0,8}|(?=[\d.]{1,11}0*$)\d{0,8}\.\d{0,2}0*$)/;

export const priceSchema = z.string().regex(DECIMAL_REGEX, "Must be a valid decimal amount (e.g. 10.50)");
