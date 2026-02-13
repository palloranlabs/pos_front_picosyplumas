// Product
export interface Product {
    id: number;
    name: string;
    description?: string | null;
    barcode?: string | null;
    sku?: string | null;
    image_url?: string | null;
    base_price: string; // COMES AS STRING
    is_active: boolean;
    aplica_iva: boolean;
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
    username: string;
    ticket_number: string;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    payment_method: 'cash' | 'card' | 'transfer' | 'mixed';
    cash_received: string;
    card_amount: string;
    transfer_amount: string;
    change_given: string;
    is_refunded: boolean;
    is_service?: boolean;
    refunded_at?: string;
    refunded_by_username?: string;
    refund_method?: string;
    customer_id?: number;
    customer_phone?: string;
    customer_name?: string;
    loyalty_points_used?: string;
    loyalty_points_earned?: string;
    created_at: string;
    items: SaleItem[];
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
}

export interface TicketSummary {
    ticket_number: string;
    username: string;
    total_amount: string;
    payment_method: string;
    is_refunded: boolean;
    created_at: string;
}

export interface CashSessionCloseResponse {
    session_id: number;
    username: string;
    opened_at: string;
    closed_at: string;
    opening_balance: string;
    closing_balance: string;
    tickets: TicketSummary[];
    movements: CashMovementSummary[];
    total_income: string;
    total_expense: string;
    total_sales_cash: string;
    total_sales_card: string;
    total_sales_transfer: string;
    total_refunded_cash: string;
    total_refunded_card: string;
    total_refunded_transfer: string;
    expected_cash_in_drawer: string;
    actual_cash_in_drawer: string;
    discrepancy: string;
    has_discrepancy: boolean;
}

export interface CashMovementSummary {
    ticket_number: string;
    movement_type: 'income' | 'expense';
    amount: string;
    description: string;
    created_at: string;
}

export interface CashMovementResponse {
    id: number;
    session_id: number;
    username: string;
    movement_type: 'income' | 'expense';
    amount: string;
    description: string;
    ticket_number: string;
    created_at: string;
}

export interface AllowedIP {
    id: number;
    ip_address: string;
    nickname: string | null;
    created_at: string;
}

export interface AllowedIPCreate {
    ip_address: string;
    nickname?: string;
}
