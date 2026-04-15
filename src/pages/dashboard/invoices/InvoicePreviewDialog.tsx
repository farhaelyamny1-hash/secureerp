import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { formatCurrencyAmount } from "@/lib/currency";
import { Invoice, InvoiceItem } from "./types";
import { CompanyProfile } from "@/lib/company";
import { QRCodeSVG } from "qrcode.react";

interface InvoicePreviewDialogProps {
  open: boolean;
  invoice: Invoice | null;
  items: InvoiceItem[];
  currencyCode: string;
  companyName: string;
  companyProfile?: CompanyProfile | null;
  websiteUrl?: string;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
}

const InvoicePreviewDialog = ({
  open, invoice, items, currencyCode, companyName, companyProfile, websiteUrl, onOpenChange, onPrint,
}: InvoicePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-8 pt-6 pb-0">
          <DialogTitle className="font-heading text-lg">معاينة الفاتورة</DialogTitle>
        </DialogHeader>

        {invoice ? (
          <div id="pos-invoice-content" className="px-8 pb-6" style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-primary/20 pb-5 mb-5">
              <div className="flex items-center gap-3">
                {companyProfile?.logo_url && (
                  <img src={companyProfile.logo_url} alt={`${companyName} logo`} className="w-14 h-14 object-contain rounded-lg border border-border" />
                )}
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground">{companyName}</h2>
                  {companyProfile?.tax_number && (
                    <p className="text-xs text-muted-foreground mt-0.5">الرقم الضريبي: {companyProfile.tax_number}</p>
                  )}
                </div>
              </div>
              <div className="text-left">
                <span className="inline-block bg-primary/10 text-primary font-heading font-bold text-sm px-3 py-1.5 rounded-md">
                  فاتورة
                </span>
              </div>
            </div>

            {/* Invoice Info + Bill To */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Bill To */}
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">فاتورة إلى</h3>
                {invoice.customers ? (
                  <div>
                    <p className="font-semibold text-sm text-foreground">{invoice.customers.name}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">عميل نقدي</p>
                )}
              </div>

              {/* Invoice Details */}
              <div className="bg-muted/40 rounded-lg p-4">
                <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">تفاصيل الفاتورة</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الفاتورة:</span>
                    <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الإصدار:</span>
                    <span className="text-foreground">{invoice.issue_date}</span>
                  </div>
                  {invoice.due_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تاريخ الاستحقاق:</span>
                      <span className="text-foreground">{invoice.due_date}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة:</span>
                    <span className={`font-semibold ${invoice.status === 'paid' ? 'text-success' : invoice.status === 'overdue' ? 'text-destructive' : 'text-accent'}`}>
                      {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'overdue' ? 'متأخرة' : invoice.status === 'draft' ? 'مسودة' : 'معلقة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Contact Info */}
            {(companyProfile?.phone || companyProfile?.address) && (
              <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                {companyProfile?.phone && <span>هاتف: {companyProfile.phone}</span>}
                {companyProfile?.address && <span>العنوان: {companyProfile.address}</span>}
              </div>
            )}

            {/* Items Table */}
            <div className="rounded-lg border border-border overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/60">
                    <th className="text-right py-2.5 px-3 font-heading font-semibold text-foreground text-xs">#</th>
                    <th className="text-right py-2.5 px-3 font-heading font-semibold text-foreground text-xs">الصنف</th>
                    <th className="text-center py-2.5 px-3 font-heading font-semibold text-foreground text-xs">الكمية</th>
                    <th className="text-center py-2.5 px-3 font-heading font-semibold text-foreground text-xs">سعر الوحدة</th>
                    <th className="text-left py-2.5 px-3 font-heading font-semibold text-foreground text-xs">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 text-muted-foreground text-xs">{index + 1}</td>
                      <td className="py-2.5 px-3 text-foreground font-medium text-xs">{item.description}</td>
                      <td className="py-2.5 px-3 text-foreground text-center text-xs">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-foreground text-center text-xs">{formatCurrencyAmount(item.unit_price, currencyCode)}</td>
                      <td className="py-2.5 px-3 text-foreground text-left font-medium text-xs">{formatCurrencyAmount(item.total, currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-5">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="text-foreground">{formatCurrencyAmount(invoice.subtotal, currencyCode)}</span>
                </div>
                {(invoice.tax_amount ?? 0) > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">الضريبة {invoice.tax_rate ? `(${invoice.tax_rate}%)` : ''}</span>
                    <span className="text-foreground">{formatCurrencyAmount(invoice.tax_amount, currencyCode)}</span>
                  </div>
                )}
                {(invoice.discount ?? 0) > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">الخصم</span>
                    <span className="text-destructive">- {formatCurrencyAmount(invoice.discount, currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t-2 border-primary/20 font-bold">
                  <span className="font-heading text-foreground">الإجمالي</span>
                  <span className="font-heading text-primary text-lg">{formatCurrencyAmount(invoice.total, currencyCode)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-muted/30 rounded-lg p-3 mb-5">
                <p className="text-xs font-semibold text-muted-foreground mb-1">ملاحظات:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{invoice.notes}</p>
              </div>
            )}

            {/* Footer: QR Code + Thank You */}
            <div className="border-t border-border pt-5 flex items-end justify-between">
              <div className="text-center">
                <QRCodeSVG
                  value="https://www.yota.lovable.app"
                  size={80}
                  level="M"
                  bgColor="transparent"
                  fgColor="hsl(220, 30%, 10%)"
                />
                <p className="text-[9px] text-muted-foreground mt-1">yota.lovable.app</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-heading font-semibold text-foreground">شكراً لتعاملكم معنا</p>
                <p className="text-xs text-muted-foreground mt-0.5">تم إنشاء هذه الفاتورة بواسطة SecureERP</p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="px-8 pb-6">
          <Button variant="outline" size="sm" onClick={onPrint} className="gap-2">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
