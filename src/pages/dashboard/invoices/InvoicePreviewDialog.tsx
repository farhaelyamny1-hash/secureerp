import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { formatCurrencyAmount } from "@/lib/currency";
import { Invoice, InvoiceItem } from "./types";
import { CompanyProfile } from "@/lib/company";
import BarcodeDisplay from "@/components/BarcodeDisplay";

interface InvoicePreviewDialogProps {
  open: boolean;
  invoice: Invoice | null;
  items: InvoiceItem[];
  currencyCode: string;
  companyName: string;
  companyProfile?: CompanyProfile | null;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
}

const InvoicePreviewDialog = ({
  open, invoice, items, currencyCode, companyName, companyProfile, onOpenChange, onPrint,
}: InvoicePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-sm">معاينة الفاتورة</DialogTitle>
        </DialogHeader>

        {invoice ? (
          <div id="pos-invoice-content" className="space-y-2 text-[11px] leading-tight" style={{ maxWidth: '280px', margin: '0 auto' }}>
            {/* Header */}
            <div className="text-center space-y-0.5">
              {companyProfile?.logo_url && (
                <img src={companyProfile.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded mx-auto" />
              )}
              <p className="font-bold text-xs text-foreground">{companyName}</p>
              {companyProfile?.tax_number && <p className="text-[9px] text-muted-foreground">ض: {companyProfile.tax_number}</p>}
              {companyProfile?.phone && <p className="text-[9px] text-muted-foreground">{companyProfile.phone}</p>}
              {companyProfile?.address && <p className="text-[9px] text-muted-foreground">{companyProfile.address}</p>}
            </div>

            <div className="border-t border-dashed border-border" />

            {/* Invoice info */}
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{invoice.invoice_number}</span>
              <span className="text-muted-foreground">{invoice.issue_date}</span>
            </div>

            {invoice.customers && (
              <p className="text-[10px] text-foreground">العميل: {invoice.customers.name}</p>
            )}

            <div className="border-t border-dashed border-border" />

            {/* Items table */}
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right pb-1 font-medium">الصنف</th>
                  <th className="text-center pb-1 font-medium w-8">ك</th>
                  <th className="text-center pb-1 font-medium">سعر</th>
                  <th className="text-left pb-1 font-medium">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-dotted border-border">
                    <td className="py-0.5 text-foreground">{item.description}</td>
                    <td className="py-0.5 text-foreground text-center">{item.quantity}</td>
                    <td className="py-0.5 text-foreground text-center">{formatCurrencyAmount(item.unit_price, currencyCode)}</td>
                    <td className="py-0.5 text-foreground text-left">{formatCurrencyAmount(item.total, currencyCode)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-border" />

            {/* Totals */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between"><span>الفرعي</span><span>{formatCurrencyAmount(invoice.subtotal, currencyCode)}</span></div>
              {(invoice.tax_amount ?? 0) > 0 && (
                <div className="flex justify-between"><span>الضريبة</span><span>{formatCurrencyAmount(invoice.tax_amount, currencyCode)}</span></div>
              )}
              {(invoice.discount ?? 0) > 0 && (
                <div className="flex justify-between"><span>الخصم</span><span>{formatCurrencyAmount(invoice.discount, currencyCode)}</span></div>
              )}
              <div className="border-t border-border" />
              <div className="flex justify-between font-bold text-xs"><span>الإجمالي</span><span>{formatCurrencyAmount(invoice.total, currencyCode)}</span></div>
            </div>

            {invoice.notes && (
              <>
                <div className="border-t border-dashed border-border" />
                <p className="text-[9px] text-muted-foreground">{invoice.notes}</p>
              </>
            )}

            <div className="border-t border-dashed border-border" />
            <p className="text-center text-[9px] text-muted-foreground">شكراً لتعاملكم معنا</p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="w-3 h-3 ml-1" />
            طباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
