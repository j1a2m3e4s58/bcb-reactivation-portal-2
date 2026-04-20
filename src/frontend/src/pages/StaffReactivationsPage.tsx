import { StatusBadge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffLayout } from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type OnlineReactivation,
  unwrapResult,
  useClearReactivations,
  useDeleteReactivations,
  useExportReactivation,
  usePendingReactivations,
} from "@/lib/backend";
import { useNavigate } from "@tanstack/react-router";
import {
  Download,
  Eye,
  FileOutput,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportCSV(records: OnlineReactivation[]) {
  const headers = [
    "Full Name",
    "Phone Number",
    "Account Number",
    "Status",
    "Date Submitted",
  ];
  const rows = records.map((r) => [
    r.fullName,
    r.phoneNumber,
    r.accountNumber,
    r.status,
    formatDate(r.createdAt),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "online_reactivations.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface ImagePreviewState {
  src: string;
  title: string;
}

type DialogType = "delete" | "clear" | null;

export default function StaffReactivationsPage() {
  return (
    <ProtectedRoute>
      <StaffLayout title="Online Reactivation Requests">
        <ReactivationsContent />
      </StaffLayout>
    </ProtectedRoute>
  );
}

function ReactivationsContent() {
  const navigate = useNavigate();
  const { data: records = [], isLoading, error } = usePendingReactivations();
  const deleteReactivations = useDeleteReactivations();
  const clearReactivations = useClearReactivations();
  const exportReactivation = useExportReactivation();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogType>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(
    null,
  );
  const [exportingId, setExportingId] = useState<string | null>(null);

  const allIds = useMemo(() => records.map((r) => String(r.id)), [records]);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDelete() {
    const ids = Array.from(selected).map((s) => BigInt(s));
    try {
      const result = await deleteReactivations.mutateAsync(ids);
      unwrapResult(result);
      setSelected(new Set());
      setDialog(null);
      toast.success(
        `Deleted ${ids.length} reactivation${ids.length !== 1 ? "s" : ""}.`,
      );
    } catch (err) {
      toast.error("Delete failed", { description: String(err) });
    }
  }

  async function handleClear() {
    try {
      const result = await clearReactivations.mutateAsync();
      unwrapResult(result);
      setSelected(new Set());
      setDialog(null);
      toast.success("All reactivation requests cleared.");
    } catch (err) {
      toast.error("Clear failed", { description: String(err) });
    }
  }

  async function handleExport(record: OnlineReactivation) {
    const sid = String(record.id);
    setExportingId(sid);
    try {
      const result = await exportReactivation.mutateAsync(record.id);
      const activated = unwrapResult(result);
      toast.success(`${record.fullName} exported and marked as activated.`);
      navigate({
        to: "/staff/print/$id",
        params: { id: String(activated.id) },
      });
    } catch (err) {
      toast.error("Export failed", { description: String(err) });
    } finally {
      setExportingId(null);
    }
  }

  if (isLoading)
    return <LoadingSpinner size="lg" label="Loading reactivation requests…" />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div className="space-y-5" data-ocid="reactivations.page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl">
            Online Reactivation Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} pending record{records.length !== 1 ? "s" : ""}
            {someSelected && ` · ${selected.size} selected`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {someSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDialog("delete")}
              className="gap-2"
              data-ocid="reactivations.delete_button"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selected.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(records)}
            disabled={records.length === 0}
            className="gap-2"
            data-ocid="reactivations.export_button"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialog("clear")}
            disabled={records.length === 0}
            className="gap-2 text-destructive hover:text-destructive"
            data-ocid="reactivations.clear_button"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No pending reactivation requests"
          description="Online reactivation submissions from customers will appear here."
        />
      ) : (
        <>
          {/* Select all (desktop) */}
          <div className="hidden md:flex items-center gap-2 px-1">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              aria-label="Select all"
              data-ocid="reactivations.select_all_checkbox"
            />
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>

          <div className="space-y-4" data-ocid="reactivations.list">
            {records.map((record, idx) => {
              const sid = String(record.id);
              const isChecked = selected.has(sid);
              const isExporting = exportingId === sid;
              const frontUrl = record.ghanaCardFrontKey.getDirectURL();
              const backUrl = record.ghanaCardBackKey.getDirectURL();
              const selfieUrl = record.ghanaCardSelfieKey.getDirectURL();

              return (
                <div
                  key={sid}
                  className={`card-elevated rounded-xl overflow-hidden transition-colors ${
                    isChecked ? "ring-2 ring-primary/40" : ""
                  }`}
                  data-ocid={`reactivations.item.${idx + 1}`}
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 p-4 border-b border-border bg-muted/20">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleOne(sid)}
                      aria-label={`Select ${record.fullName}`}
                      className="mt-0.5"
                      data-ocid={`reactivations.checkbox.${idx + 1}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-semibold text-foreground">
                          {record.fullName}
                        </span>
                        <StatusBadge variant="pending">Pending</StatusBadge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          <span className="text-xs uppercase tracking-wide mr-1">
                            Acct:
                          </span>
                          <span className="font-mono">
                            {record.accountNumber}
                          </span>
                        </span>
                        <span>
                          <span className="text-xs uppercase tracking-wide mr-1">
                            Phone:
                          </span>
                          {record.phoneNumber}
                        </span>
                        <span>
                          <span className="text-xs uppercase tracking-wide mr-1">
                            Submitted:
                          </span>
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                      {record.extraInfo && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {record.extraInfo}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleExport(record)}
                      disabled={isExporting}
                      className="gap-2 flex-shrink-0"
                      data-ocid={`reactivations.export_form_button.${idx + 1}`}
                    >
                      <FileOutput className="w-4 h-4" />
                      {isExporting ? "Exporting…" : "Export Form"}
                    </Button>
                  </div>

                  {/* Images */}
                  <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Ghana Card Images
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { url: frontUrl, label: "Ghana Card Front" },
                        { url: backUrl, label: "Ghana Card Back" },
                        { url: selfieUrl, label: "Selfie with Ghana Card" },
                      ].map(({ url, label }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setImagePreview({ src: url, title: label })
                          }
                          className="group relative w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-smooth focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label={`View ${label}`}
                          data-ocid={`reactivations.image_preview.${idx + 1}`}
                        >
                          <img
                            src={url}
                            alt={label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/assets/images/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-smooth flex items-center justify-center">
                            <Eye className="w-5 h-5 text-transparent group-hover:text-primary-foreground transition-smooth" />
                          </div>
                          <span className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-primary-foreground text-[9px] px-1 py-0.5 text-center truncate">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <ImagePreviewModal
          open={!!imagePreview}
          onOpenChange={(o) => !o && setImagePreview(null)}
          src={imagePreview.src}
          title={imagePreview.title}
          alt={imagePreview.title}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Delete ${selected.size} reactivation${selected.size !== 1 ? "s" : ""}?`}
        description="These reactivation records will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteReactivations.isPending}
      />

      {/* Confirm Clear All */}
      <ConfirmDialog
        open={dialog === "clear"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Clear all reactivation requests?"
        description="This will permanently delete ALL pending reactivation requests. This action is irreversible and cannot be undone."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClear}
        loading={clearReactivations.isPending}
      />
    </div>
  );
}
