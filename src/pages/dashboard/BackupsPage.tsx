import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Download, Upload, RefreshCw, HardDrive, Clock, CheckCircle2,
  AlertCircle, Loader2, FileDown, Database
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Backup {
  id: string;
  status: string;
  backup_type: string;
  file_size: number;
  tables_included: string[];
  created_at: string;
  completed_at: string | null;
}

const TABLE_LABELS: Record<string, string> = {
  products: "المنتجات",
  customers: "العملاء",
  categories: "التصنيفات",
  invoices: "الفواتير",
  invoice_items: "بنود الفواتير",
  quotations: "عروض الأسعار",
  quotation_items: "بنود عروض الأسعار",
  payments: "المدفوعات",
  expenses: "المصروفات",
  employees: "الموظفين",
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BackupsPage = () => {
  const { user } = useAuth();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<any>(null);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("backups")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBackups(data as unknown as Backup[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const createBackup = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await supabase.functions.invoke("create-backup", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;

      const result = response.data;
      if (result.success) {
        // Auto-download the backup
        const blob = new Blob([result.data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `secureerp-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success("تم إنشاء النسخة الاحتياطية بنجاح");
        fetchBackups();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Backup error:", err);
      toast.error("فشل إنشاء النسخة الاحتياطية");
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.data || parsed.system !== "SecureERP") {
          toast.error("ملف النسخة الاحتياطية غير صالح");
          return;
        }
        setRestoreFile(parsed);
        setSelectedTables(parsed.tables || Object.keys(parsed.data));
        setRestoreDialogOpen(true);
      } catch {
        toast.error("ملف النسخة الاحتياطية غير صالح");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setRestoring(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const response = await supabase.functions.invoke("restore-backup", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { backupData: restoreFile, selectedTables },
      });

      if (response.error) throw response.error;

      const result = response.data;
      if (result.success) {
        const totalInserted = Object.values(result.results as Record<string, { inserted: number }>)
          .reduce((sum, r) => sum + r.inserted, 0);
        toast.success(`تم استعادة ${totalInserted} سجل بنجاح`);
        setRestoreDialogOpen(false);
        setRestoreFile(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Restore error:", err);
      toast.error("فشل استعادة النسخة الاحتياطية");
    } finally {
      setRestoring(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    // Re-create backup and download
    await createBackup();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            النسخ الاحتياطي
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة النسخ الاحتياطية لبيانات شركتك
          </p>
        </div>
      </div>

      {/* Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">إنشاء نسخة احتياطية</h3>
              <p className="text-sm text-muted-foreground mt-1">
                تصدير جميع بيانات الشركة كملف JSON
              </p>
            </div>
            <Button onClick={createBackup} disabled={creating} className="w-full">
              {creating ? (
                <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الإنشاء...</>
              ) : (
                <><Database className="w-4 h-4 ml-2" /> إنشاء نسخة احتياطية</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">استعادة من نسخة</h3>
              <p className="text-sm text-muted-foreground mt-1">
                استعادة البيانات من ملف نسخة احتياطية
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestoreFileSelect}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 ml-2" /> اختيار ملف النسخة
            </Button>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
              <HardDrive className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">إجمالي النسخ</h3>
              <p className="text-3xl font-bold text-primary mt-1">{backups.length}</p>
            </div>
            <Button variant="ghost" onClick={fetchBackups} className="w-full">
              <RefreshCw className="w-4 h-4 ml-2" /> تحديث
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">سجل النسخ الاحتياطية</CardTitle>
          <CardDescription>جميع النسخ الاحتياطية السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد نسخ احتياطية بعد</p>
              <p className="text-sm mt-1">أنشئ أول نسخة احتياطية لحماية بياناتك</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {backup.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : backup.status === "in_progress" ? (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          نسخة احتياطية
                        </span>
                        <Badge variant={backup.backup_type === "auto" ? "secondary" : "outline"}>
                          {backup.backup_type === "auto" ? "تلقائي" : "يدوي"}
                        </Badge>
                        <Badge
                          variant={backup.status === "completed" ? "default" : "destructive"}
                        >
                          {backup.status === "completed" ? "مكتمل" : backup.status === "in_progress" ? "قيد التنفيذ" : "فشل"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(backup.created_at).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {backup.file_size > 0 && (
                          <span>{formatFileSize(backup.file_size)}</span>
                        )}
                        {backup.tables_included && (
                          <span>{(backup.tables_included as string[]).length} جداول</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadBackup(backup.id)}
                    disabled={backup.status !== "completed"}
                  >
                    <FileDown className="w-4 h-4 ml-1" /> تحميل
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">استعادة النسخة الاحتياطية</DialogTitle>
            <DialogDescription>
              اختر الجداول التي تريد استعادتها. سيتم إضافة البيانات إلى البيانات الحالية.
            </DialogDescription>
          </DialogHeader>

          {restoreFile && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p><strong>تاريخ النسخة:</strong> {new Date(restoreFile.created_at).toLocaleDateString("ar-EG")}</p>
                <p><strong>الإصدار:</strong> {restoreFile.version}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">الجداول المتاحة:</p>
                {Object.keys(restoreFile.data).map((table) => (
                  <label key={table} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={selectedTables.includes(table)}
                      onCheckedChange={(checked) => {
                        setSelectedTables((prev) =>
                          checked
                            ? [...prev, table]
                            : prev.filter((t) => t !== table)
                        );
                      }}
                    />
                    <span className="text-sm text-foreground">
                      {TABLE_LABELS[table] || table}
                    </span>
                    <Badge variant="outline" className="mr-auto">
                      {restoreFile.data[table].length} سجل
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoring || selectedTables.length === 0}
            >
              {restoring ? (
                <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الاستعادة...</>
              ) : (
                <><Upload className="w-4 h-4 ml-2" /> استعادة</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupsPage;
