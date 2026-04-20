import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffLayout } from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  type AlreadyActivated,
  unwrapResult,
  useActivatedAccounts,
  useClearActivatedAccounts,
  useDeleteActivatedAccounts,
} from "@/lib/backend";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  Eye,
  Printer,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

function exportCSV(records: AlreadyActivated[]) {
  const headers = [
    "Full Name",
    "Phone Number",
    "Account Number",
    "Date Submitted",
    "Exported Date",
  ];
  const rows = records.map((r) => [
    r.fullName,
    r.phoneNumber,
    r.accountNumber,
    formatDate(r.createdAt),
    formatDate(r.exportedAt),
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
  a.download = "activated_accounts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface ImagePreviewState {
  src: string;
  title: string;
}

type DialogType = "delete" | "clear" | null;

export default function StaffActivatedPage() {
  return (
    <ProtectedRoute>
      <StaffLayout title="Activated Accounts">
        <ActivatedContent />
      </StaffLayout>
    </ProtectedRoute>
  );
}

function ActivatedContent() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const {
    data: records = [],
    isLoading,
    error,
  } = useActivatedAccounts(searchQuery);
  const deleteAccounts = useDeleteActivatedAccounts();
  const clearAccounts = useClearActivatedAccounts();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogType>(null);
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(
    null,
  );

  const allIds = useMemo(() => records.map((r) => String(r.id)), [records]);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0;

  // Debounce search: update searchQuery after 400ms of no typing
  useEffect(() => {
    const trimmed = searchInput.trim();
    const timer = setTimeout(() => {
      setSearchQuery(trimmed.length > 0 ? trimmed : null);
      setSelected(new Set());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      const result = await deleteAccounts.mutateAsync(ids);
      unwrapResult(result);
      setSelected(new Set());
      setDialog(null);
      toast.success(
        `Deleted ${ids.length} account${ids.length !== 1 ? "s" : ""}.`,
      );
    } catch (err) {
      toast.error("Delete failed", { description: String(err) });
    }
  }

  async function handleClear() {
    try {
      const result = await clearAccounts.mutateAsync();
      unwrapResult(result);
      setSelected(new Set());
      setDialog(null);
      toast.success("All activated account records cleared.");
    } catch (err) {
      toast.error("Clear failed", { description: String(err) });
    }
  }

  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div className="space-y-5" data-ocid="activated.page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl">
            Activated Accounts
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} record{records.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
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
              data-ocid="activated.delete_button"
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
            data-ocid="activated.export_button"
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
            data-ocid="activated.clear_button"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or account number…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
          data-ocid="activated.search_input"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading activated accounts…" />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={
            searchQuery
              ? "No matching records found"
              : "No activated accounts yet"
          }
          description={
            searchQuery
              ? "Try a different search term."
              : "Exported reactivations will appear here."
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block card-elevated overflow-hidden">
            <table className="w-full text-sm" data-ocid="activated.table">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                      data-ocid="activated.select_all_checkbox"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Account No.
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Exported
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Images
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, idx) => {
                  const sid = String(record.id);
                  const isChecked = selected.has(sid);
                  return (
                    <tr
                      key={sid}
                      className={`border-b border-border last:border-0 transition-colors ${
                        isChecked ? "bg-primary/5" : "hover:bg-muted/30"
                      }`}
                      data-ocid={`activated.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleOne(sid)}
                          aria-label={`Select ${record.fullName}`}
                          data-ocid={`activated.checkbox.${idx + 1}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {record.fullName}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {record.phoneNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {record.accountNumber}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(record.exportedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {[
                            { key: record.ghanaCardFrontKey, label: "Front" },
                            { key: record.ghanaCardBackKey, label: "Back" },
                            { key: record.ghanaCardSelfieKey, label: "Selfie" },
                          ].map(({ key, label }) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() =>
                                setImagePreview({
                                  src: key.getDirectURL(),
                                  title: label,
                                })
                              }
                              className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-border hover:border-primary/50 transition-smooth flex-shrink-0"
                              title={`View ${label}`}
                              aria-label={`View ${label}`}
                              data-ocid={`activated.image_preview.${idx + 1}`}
                            >
                              <img
                                src={key.getDirectURL()}
                                alt={label}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    "/assets/images/placeholder.svg";
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate({
                              to: "/staff/print/$id",
                              params: { id: sid },
                            })
                          }
                          className="gap-1.5 text-xs"
                          data-ocid={`activated.reprint_button.${idx + 1}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Reprint
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
                data-ocid="activated.mobile.select_all_checkbox"
              />
              <span className="text-sm text-muted-foreground">Select all</span>
            </div>
            {records.map((record, idx) => {
              const sid = String(record.id);
              const isChecked = selected.has(sid);
              return (
                <div
                  key={sid}
                  className={`card-elevated rounded-xl overflow-hidden transition-colors ${
                    isChecked ? "ring-2 ring-primary/40" : ""
                  }`}
                  data-ocid={`activated.item.${idx + 1}`}
                >
                  <div className="flex items-start gap-3 p-4 border-b border-border bg-muted/20">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleOne(sid)}
                      aria-label={`Select ${record.fullName}`}
                      className="mt-0.5"
                      data-ocid={`activated.checkbox.${idx + 1}`}
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-foreground">
                        {record.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.phoneNumber}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {record.accountNumber}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Submitted: {formatDate(record.createdAt)}</p>
                        <p>Exported: {formatDate(record.exportedAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: "/staff/print/$id",
                          params: { id: sid },
                        })
                      }
                      className="gap-1.5 text-xs flex-shrink-0"
                      data-ocid={`activated.reprint_button.${idx + 1}`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Reprint
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Ghana Card Images
                    </p>
                    <div className="flex gap-3">
                      {[
                        { key: record.ghanaCardFrontKey, label: "Front" },
                        { key: record.ghanaCardBackKey, label: "Back" },
                        { key: record.ghanaCardSelfieKey, label: "Selfie" },
                      ].map(({ key, label }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setImagePreview({
                              src: key.getDirectURL(),
                              title: label,
                            })
                          }
                          className="group relative w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-smooth"
                          aria-label={`View ${label}`}
                          data-ocid={`activated.image_preview.${idx + 1}`}
                        >
                          <img
                            src={key.getDirectURL()}
                            alt={label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/assets/images/placeholder.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-smooth flex items-center justify-center">
                            <Eye className="w-4 h-4 text-transparent group-hover:text-primary-foreground transition-smooth" />
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
        title={`Delete ${selected.size} account${selected.size !== 1 ? "s" : ""}?`}
        description="These activated account records will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteAccounts.isPending}
      />

      {/* Confirm Clear All */}
      <ConfirmDialog
        open={dialog === "clear"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Clear all activated accounts?"
        description="This will permanently delete ALL activated account records. This action is irreversible and cannot be undone."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClear}
        loading={clearAccounts.isPending}
      />
    </div>
  );
}
