import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { formatCurrencyAmount } from "@/lib/currency";
import { Invoice, InvoiceItem } from "./types";

interface InvoicePreviewDialogProps {
  open: boolean;
  invoice: Invoice | null;
  items: InvoiceItem[];
  currencyCode: string;
  companyName: string;
  onOpenChange: (open: boolean) => void;
  onPrint: () => void;
}

const InvoicePreviewDialog = ({
  open,
  invoice,
  items,
  currencyCode,
  companyName,
  onOpenChange,
  onPrint,
}: InvoicePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">معاينة الفاتورة</DialogTitle>
        </DialogHeader>

        {invoice ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-heading font-bold text-xl text-foreground">{companyName}</h2>
                <p className="text-sm text-muted-foreground">فاتورة ضريبية</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-foreground">{invoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{invoice.issue_date}</p>
              </div>
            </div>

            {invoice.customers ? (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">العميل</p>
                <p className="font-medium text-foreground">{invoice.customers.name}</p>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right pb-2">الوصف</th>
                    <th className="text-right pb-2">الكمية</th>
                    <th className="text-right pb-2">السعر</th>
                    <th className="text-right pb-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="border-b border-border">
                      <td className="py-2 text-foreground">{item.description}</td>
                      <td className="py-2 text-foreground">{item.quantity}</td>
                      <td className="py-2 text-foreground">{formatCurrencyAmount(item.unit_price, currencyCode)}</td>
                      <td className="py-2 text-foreground">{formatCurrencyAmount(item.total, currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{formatCurrencyAmount(invoice.subtotal, currencyCode)}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة:</span>
                <span>{formatCurrencyAmount(invoice.tax_amount, currencyCode)}</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span>{formatCurrencyAmount(invoice.discount, currencyCode)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-1">
                <span>الإجمالي:</span>
                <span>{formatCurrencyAmount(invoice.total, currencyCode)}</span>
              </div>
            </div>

            {invoice.notes ? <p className="text-sm text-muted-foreground">{invoice.notes}</p> : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onPrint}>
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
