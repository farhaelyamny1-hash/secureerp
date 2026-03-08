export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: string;
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount: number | null;
  total: number | null;
  notes: string | null;
  customer_id: string | null;
  customers?: { name: string } | null;
}

export interface Customer {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface InvoiceFormItem {
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceFormState {
  customer_id: string;
  due_date: string;
  tax_rate: string;
  discount: string;
  notes: string;
  status: string;
  items: InvoiceFormItem[];
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  sent: "مُرسلة",
  paid: "مدفوعة",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};
