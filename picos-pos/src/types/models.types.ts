// Product
export interface Product {
    id: number;
    name: string;
    description?: string | null;
    barcode?: string | null;
    base_price: string; // COMES AS STRING
    is_active: boolean;
}

// Sale Item
export interface SaleItem {
    id: number;
    product_id: number;
    product_name_snapshot: string;
    unit_price_snapshot: string; // String
    quantity: string;            // String
    discount_percent: string;    // String
    item_subtotal: string;       // String
}

// Sale (Ticket)
export interface Sale {
    id: number;
    ticket_number: string;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    payment_method: 'cash' | 'card' | 'mixed';
    cash_received: string;
    card_amount: string;
    change_given: string;
    is_refunded: boolean;
    created_at: string; // ISO Date
    items: SaleItem[];
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
}

export interface CashSessionCloseResponse {
    session_id: number;
    user_id: number;
    opened_at: string;
    closed_at: string;
    opening_balance: string;
    closing_balance: string;
    total_sales_cash: string;
    total_sales_card: string;
    total_refunded_cash: string;
    total_refunded_card: string;
    expected_cash_in_drawer: string;
    actual_cash_in_drawer: string;
    discrepancy: string;
    has_discrepancy: boolean;
}
