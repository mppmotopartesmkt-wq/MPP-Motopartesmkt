export type DocumentType = 'CC' | 'NIT' | 'CE' | 'PASAPORTE' | 'TI' | 'RUT';
export type UserRole = 'admin' | 'collaborator' | 'customer';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  document_type?: DocumentType;
  document_number?: string;
  phone?: string;
  address?: string;
  city?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  discount_price?: number | null;
  stock_qty: number;
  length_mm?: number | null;
  width_mm?: number | null;
  height_mm?: number | null;
  package_details?: string | null;
  cbm_pc?: number | null;
  gross_weight_kg?: number | null;
  net_weight_kg?: number | null;
  images: string[];
  videos?: string[];
  wholesale_price?: number | null;
  status_text?: string;
  is_active: boolean;
  category?: string;
  rating?: number;
  reviews_count?: number;
  description?: string;
  brand?: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number;
  current_uses: number;
  expires_at?: string | null;
  is_active: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type InvoiceStatus = 'pending' | 'generated' | 'failed';
export type PaymentStatus = 'pending' | 'partial_payment' | 'paid_in_full';

export interface Order {
  id: string;
  order_number: string;
  profile_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_applied: number;
  total_amount: number;
  invoice_status: InvoiceStatus;
  payment_status: PaymentStatus;
  shipping_address?: {
    full_name?: string;
    address: string;
    city: string;
    phone?: string;
  };
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export type PaymentMethod = 'bold' | 'transfer' | 'wompi' | 'pse' | 'cash' | 'credit_card' | 'paypal' | 'apple_pay';

export interface Payment {
  id: string;
  order_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  receipt_url?: string;
  payment_date?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutResult {
  success: boolean;
  order_id: string;
  order_number: string;
  subtotal: number;
  discount_applied: number;
  total_amount: number;
  message?: string;
}
