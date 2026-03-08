import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { formatCurrencyAmount } from "@/lib/currency";
import { InvoiceFormState, Customer, Product, INVOICE_STATUS_LABELS } from "./types";
import { calcInvoiceTotals, createEmptyInvoiceItem } from "./utils";

interface InvoiceFormDialogProps {
  open: boolean;
  isEditing: boolean;
  form: InvoiceFormState;
  customers: Customer[];
  products: Product[];
  currencyCode: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: InvoiceFormState) => void;
  onSave: () => void;
}

const InvoiceFormDialog = ({
  open,
  isEditing,
  form,
  customers,
  products,
  currencyCode,
  loading,
  onOpenChange,
  onFormChange,
  onSave,
}: InvoiceFormDialogProps) => {
  const { subtotal, taxAmount, total, discountAmount } = calcInvoiceTotals(form.items, form.tax_rate, form.discount);

  const updateField = (key: keyof InvoiceFormState, value: string) => {
    onFormChange({ ...form, [key]: value });
  };

  const addItem = () => {
    onFormChange({ ...form, items: [...form.items, createEmptyInvoiceItem()] });
  };

  const removeItem = (index: number) => {
    onFormChange({
      ...form,
      items: form.items.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const updateItem = (index: number, field: "description" | "quantity" | "unit_price", value: string) => {
    const nextItems = [...form.items];

    if (field === "quantity") {
      nextItems[index] = {
        ...nextItems[index],
        quantity: Number(value) || 0,
      };
    } else if (field === "unit_price") {
      nextItems[index] = {
        ...nextItems[index],
        unit_price: Number(value) || 0,
      };
    } else {
      nextItems[index] = {
        ...nextItems[index],
        description: value,
      };
    }

    onFormChange({ ...form, items: nextItems });
  };

  const selectProduct = (index: number, productId: string) => {
    const nextItems = [...form.items];

    if (productId === "manual") {
      nextItems[index] = {
        ...nextItems[index],
        product_id: null,
      };
      onFormChange({ ...form, items: nextItems });
      return;
    }

    const product = products.find((item) => item.id === productId);
    if (!product) return;

    nextItems[index] = {
      ...nextItems[index],
      product_id: product.id,
      description: product.name,
      unit_price: Number(product.price) || 0,
    };

    onFormChange({ ...form, items: nextItems });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{isEditing ? "تعديل الفاتورة" : "إنشاء فاتورة جديدة"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">العميل</label>
              <Select value={form.customer_id} onValueChange={(value) => updateField("customer_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر عميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">الحالة</label>
              <Select value={form.status} onValueChange={(value) => updateField("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">تاريخ الاستحقاق</label>
              <Input type="date" value={form.due_date} onChange={(event) => updateField("due_date", event.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">عناصر الفاتورة</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-3 h-3 ml-1" />
                إضافة عنصر
              </Button>
            </div>

            <div className="space-y-2">
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[180px_1fr_90px_120px_36px] gap-2">
                  <Select value={item.product_id || "manual"} onValueChange={(value) => selectProduct(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر منتج" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">وصف يدوي</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="الوصف"
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="الكمية"
                    value={item.quantity}
                    onChange={(event) => updateItem(index, "quantity", event.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="السعر"
                    value={item.unit_price}
                    onChange={(event) => updateItem(index, "unit_price", event.target.value)}
                  />
                  {form.items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="h-10 w-9 rounded-md hover:bg-destructive/10 text-destructive flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="h-10" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="نسبة الضريبة %"
              type="number"
              min={0}
              value={form.tax_rate}
              onChange={(event) => updateField("tax_rate", event.target.value)}
            />
            <Input
              placeholder="الخصم"
              type="number"
              min={0}
              value={form.discount}
              onChange={(event) => updateField("discount", event.target.value)}
            />
          </div>

          <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{formatCurrencyAmount(subtotal, currencyCode)}</span>
            </div>
            <div className="flex justify-between">
              <span>الضريبة ({form.tax_rate}%):</span>
              <span>{formatCurrencyAmount(taxAmount, currencyCode)}</span>
            </div>
            <div className="flex justify-between">
              <span>الخصم:</span>
              <span>{formatCurrencyAmount(discountAmount, currencyCode)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-1">
              <span>الإجمالي:</span>
              <span>{formatCurrencyAmount(total, currencyCode)}</span>
            </div>
          </div>

          <Textarea
            placeholder="ملاحظات..."
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">إلغاء</Button>
          </DialogClose>
          <Button onClick={onSave} disabled={loading} className="gradient-primary text-primary-foreground">
            {loading ? "جاري الحفظ..." : isEditing ? "حفظ التعديل" : "إنشاء الفاتورة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormDialog;
