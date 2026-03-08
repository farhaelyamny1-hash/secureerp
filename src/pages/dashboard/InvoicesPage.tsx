import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Printer, Trash2, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrencyAmount } from "@/lib/currency";
import { getCompanyProfile } from "@/lib/company";
import InvoiceFormDialog from "./invoices/InvoiceFormDialog";
import InvoicePreviewDialog from "./invoices/InvoicePreviewDialog";
import {
  Customer,
  Invoice,
  InvoiceItem,
  InvoiceFormState,
  Product,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from "./invoices/types";
import { calcInvoiceTotals, createDefaultInvoiceForm } from "./invoices/utils";

const escapeHtml = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const InvoicesPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("SecureERP");
  const [currencyCode, setCurrencyCode] = useState("EGP");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceFormState>(createDefaultInvoiceForm());

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewItems, setPreviewItems] = useState<InvoiceItem[]>([]);

  const resetForm = () => {
    setEditingInvoice(null);
    setForm(createDefaultInvoiceForm());
  };

  const closeFormDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const company = await getCompanyProfile(user.id);
      if (!company) {
        setCompanyId(null);
        setInvoices([]);
        setCustomers([]);
        setProducts([]);
        toast.error("لا توجد شركة مرتبطة بحسابك");
        return;
      }

      setCompanyId(company.id);
      setCompanyName(company.name || "SecureERP");
      setCurrencyCode(company.currency || "EGP");

      const [invoiceRes, customerRes, productRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, invoice_number, issue_date, due_date, status, subtotal, tax_rate, tax_amount, discount, total, notes, customer_id, customers(name)")
          .eq("company_id", company.id)
          .order("created_at", { ascending: false }),
        supabase.from("customers").select("id, name").eq("company_id", company.id).order("created_at", { ascending: false }),
        supabase.from("products").select("id, name, price").eq("company_id", company.id).order("created_at", { ascending: false }),
      ]);

      if (invoiceRes.error || customerRes.error || productRes.error) {
        toast.error("تعذر تحميل بيانات الفواتير");
      }

      setInvoices((invoiceRes.data as Invoice[]) || []);
      setCustomers(customerRes.data || []);
      setProducts((productRes.data as Product[]) || []);
    } catch {
      toast.error("تعذر تحميل بيانات الفواتير");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const buildPrintDocument = (invoice: Invoice, items: InvoiceItem[]) => {
    const rows = items
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.description)}</td>
            <td>${item.quantity}</td>
            <td>${escapeHtml(formatCurrencyAmount(item.unit_price, currencyCode))}</td>
            <td>${escapeHtml(formatCurrencyAmount(item.total, currencyCode))}</td>
          </tr>
        `,
      )
      .join("");

    return `
      <html dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>فاتورة ${escapeHtml(invoice.invoice_number)}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 32px; direction: rtl; color: #111827; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .meta { color: #6b7280; font-size: 14px; }
          .box { background: #f9fafb; border-radius: 10px; padding: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; }
          th { background: #f3f4f6; }
          .totals { background: #f9fafb; border-radius: 10px; padding: 12px; width: 320px; margin-right: auto; }
          .totals-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .total-bold { font-weight: 700; border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>${escapeHtml(companyName)}</h2>
            <div class="meta">فاتورة ضريبية</div>
          </div>
          <div>
            <div><strong>${escapeHtml(invoice.invoice_number)}</strong></div>
            <div class="meta">تاريخ الإصدار: ${escapeHtml(invoice.issue_date)}</div>
            <div class="meta">الاستحقاق: ${escapeHtml(invoice.due_date || "—")}</div>
          </div>
        </div>

        ${invoice.customers?.name ? `<div class="box"><strong>العميل:</strong> ${escapeHtml(invoice.customers.name)}</div>` : ""}

        <table>
          <thead>
            <tr>
              <th>الوصف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div class="totals-row"><span>المجموع الفرعي</span><span>${escapeHtml(formatCurrencyAmount(invoice.subtotal, currencyCode))}</span></div>
          <div class="totals-row"><span>الضريبة</span><span>${escapeHtml(formatCurrencyAmount(invoice.tax_amount, currencyCode))}</span></div>
          <div class="totals-row"><span>الخصم</span><span>${escapeHtml(formatCurrencyAmount(invoice.discount, currencyCode))}</span></div>
          <div class="totals-row total-bold"><span>الإجمالي</span><span>${escapeHtml(formatCurrencyAmount(invoice.total, currencyCode))}</span></div>
        </div>

        ${invoice.notes ? `<p class="meta" style="margin-top:14px;"><strong>ملاحظات:</strong> ${escapeHtml(invoice.notes)}</p>` : ""}
      </body>
      </html>
    `;
  };

  const printInvoice = (invoice: Invoice, items: InvoiceItem[], printWindow?: Window | null) => {
    const targetWindow = printWindow || window.open("", "_blank");
    if (!targetWindow) {
      toast.error("المتصفح منع نافذة الطباعة");
      return;
    }

    targetWindow.document.write(buildPrintDocument(invoice, items));
    targetWindow.document.close();
    targetWindow.focus();
    targetWindow.print();
  };

  const openPreview = async (invoice: Invoice) => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("id, invoice_id, product_id, description, quantity, unit_price, total")
      .eq("invoice_id", invoice.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("تعذر تحميل تفاصيل الفاتورة");
      return;
    }

    setPreviewInvoice(invoice);
    setPreviewItems((data as InvoiceItem[]) || []);
  };

  const openEdit = async (invoice: Invoice) => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("product_id, description, quantity, unit_price")
      .eq("invoice_id", invoice.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("تعذر تحميل عناصر الفاتورة");
      return;
    }

    setEditingInvoice(invoice);
    setForm({
      customer_id: invoice.customer_id || "",
      due_date: invoice.due_date || "",
      tax_rate: String(invoice.tax_rate ?? 14),
      discount: String(invoice.discount ?? 0),
      notes: invoice.notes || "",
      status: invoice.status || "draft",
      items:
        data && data.length > 0
          ? data.map((item) => ({
              product_id: item.product_id || null,
              description: item.description || "",
              quantity: Number(item.quantity) || 0,
              unit_price: Number(item.unit_price) || 0,
            }))
          : [{ product_id: null, description: "", quantity: 1, unit_price: 0 }],
    });
    setDialogOpen(true);
  };

  const handleQuickPrint = async (invoice: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("المتصفح منع نافذة الطباعة");
      return;
    }

    const { data, error } = await supabase
      .from("invoice_items")
      .select("id, invoice_id, product_id, description, quantity, unit_price, total")
      .eq("invoice_id", invoice.id)
      .order("created_at", { ascending: true });

    if (error) {
      printWindow.close();
      toast.error("تعذر تحميل عناصر الفاتورة للطباعة");
      return;
    }

    printInvoice(invoice, (data as InvoiceItem[]) || [], printWindow);
  };

  const handleSave = async () => {
    if (!user || !companyId) {
      toast.error("لا توجد شركة مرتبطة بحسابك");
      return;
    }

    const validItems = form.items.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      toast.error("أضف عنصرًا واحدًا على الأقل");
      return;
    }

    setSaving(true);

    const { subtotal, taxAmount, total, discountAmount } = calcInvoiceTotals(form.items, form.tax_rate, form.discount);

    try {
      let invoiceId = editingInvoice?.id;
      const invoicePayload = {
        company_id: companyId,
        customer_id: form.customer_id || null,
        due_date: form.due_date || null,
        tax_rate: Number(form.tax_rate) || 0,
        discount: discountAmount,
        subtotal,
        tax_amount: taxAmount,
        total,
        notes: form.notes || null,
        status: form.status,
      };

      if (editingInvoice) {
        const { error: updateError } = await supabase
          .from("invoices")
          .update(invoicePayload)
          .eq("id", editingInvoice.id);

        if (updateError) {
          toast.error("تعذر تحديث الفاتورة");
          setSaving(false);
          return;
        }

        const { error: deleteItemsError } = await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", editingInvoice.id);

        if (deleteItemsError) {
          toast.error("تعذر تحديث عناصر الفاتورة");
          setSaving(false);
          return;
        }
      } else {
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

        const { data: createdInvoice, error: createError } = await supabase
          .from("invoices")
          .insert({
            ...invoicePayload,
            invoice_number: invoiceNumber,
          })
          .select("id")
          .single();

        if (createError || !createdInvoice) {
          toast.error("تعذر إنشاء الفاتورة");
          setSaving(false);
          return;
        }

        invoiceId = createdInvoice.id;
      }

      const itemsPayload = validItems.map((item) => ({
        invoice_id: invoiceId as string,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      }));

      const { error: itemsInsertError } = await supabase.from("invoice_items").insert(itemsPayload);

      if (itemsInsertError) {
        toast.error("تم حفظ الفاتورة لكن فشل حفظ العناصر");
        setSaving(false);
        return;
      }

      toast.success(editingInvoice ? "تم تعديل الفاتورة" : "تم إنشاء الفاتورة");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("حدث خطأ غير متوقع أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    const { error: itemDeleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", invoiceId);

    if (itemDeleteError) {
      toast.error("تعذر حذف عناصر الفاتورة");
      return;
    }

    const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
    if (error) {
      toast.error("تعذر حذف الفاتورة");
      return;
    }

    toast.success("تم حذف الفاتورة");
    fetchData();
  };

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;

    return invoices.filter((invoice) => {
      const invoiceNo = invoice.invoice_number.toLowerCase();
      const customer = invoice.customers?.name?.toLowerCase() || "";
      return invoiceNo.includes(query) || customer.includes(query);
    });
  }, [invoices, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">الفواتير</h1>
          <p className="text-sm text-muted-foreground">إدارة الفواتير والطباعة والتعديل وربط العناصر بالمنتجات</p>
        </div>

        <Button
          className="gradient-primary text-primary-foreground font-heading"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 ml-2" />
          فاتورة جديدة
        </Button>
      </div>

      <InvoiceFormDialog
        open={dialogOpen}
        isEditing={!!editingInvoice}
        form={form}
        customers={customers}
        products={products}
        currencyCode={currencyCode}
        loading={saving}
        onOpenChange={closeFormDialog}
        onFormChange={setForm}
        onSave={handleSave}
      />

      <InvoicePreviewDialog
        open={!!previewInvoice}
        invoice={previewInvoice}
        items={previewItems}
        currencyCode={currencyCode}
        companyName={companyName}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewInvoice(null);
            setPreviewItems([]);
          }
        }}
        onPrint={() => {
          if (!previewInvoice) return;
          printInvoice(previewInvoice, previewItems);
        }}
      />

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن فاتورة..."
              className="pr-10 font-body bg-muted border-0"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">جاري تحميل الفواتير...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد فواتير حالياً</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">رقم الفاتورة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">تاريخ الإصدار</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الاستحقاق</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">العميل</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الإجمالي</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-sm text-primary">{invoice.invoice_number}</td>
                    <td className="p-4 text-sm text-muted-foreground">{invoice.issue_date}</td>
                    <td className="p-4 text-sm text-muted-foreground">{invoice.due_date || "—"}</td>
                    <td className="p-4 text-sm text-foreground">{invoice.customers?.name || "—"}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">
                      {formatCurrencyAmount(invoice.total, currencyCode)}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${INVOICE_STATUS_COLORS[invoice.status] || ""}`}>
                        {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openPreview(invoice)}>
                            <Eye className="w-4 h-4 ml-2" />
                            معاينة
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(invoice)}>
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickPrint(invoice)}>
                            <Printer className="w-4 h-4 ml-2" />
                            طباعة
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(invoice.id)}>
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
