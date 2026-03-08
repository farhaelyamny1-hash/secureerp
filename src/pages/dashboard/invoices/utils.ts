import { InvoiceFormItem, InvoiceFormState } from "./types";

export const createEmptyInvoiceItem = (): InvoiceFormItem => ({
  product_id: null,
  description: "",
  quantity: 1,
  unit_price: 0,
});

export const createDefaultInvoiceForm = (): InvoiceFormState => ({
  customer_id: "",
  due_date: "",
  tax_rate: "14",
  discount: "0",
  notes: "",
  status: "draft",
  items: [createEmptyInvoiceItem()],
});

export const calcInvoiceTotals = (items: InvoiceFormItem[], taxRate: string, discount: string) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const parsedTaxRate = Number(taxRate) || 0;
  const parsedDiscount = Number(discount) || 0;
  const taxable = Math.max(subtotal - parsedDiscount, 0);
  const taxAmount = taxable * (parsedTaxRate / 100);
  const total = taxable + taxAmount;

  return {
    subtotal,
    taxAmount,
    total,
    discountAmount: parsedDiscount,
  };
};
