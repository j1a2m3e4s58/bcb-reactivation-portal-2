import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffLayout } from "@/components/StaffLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type FollowupRecord,
  unwrapResult,
  useClearFollowups,
  useDeleteFollowups,
  useFollowups,
} from "@/lib/backend";
import { CheckSquare, Download, RotateCcw, Trash2, Users } from "lucide-react";
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

function exportCSV(records: FollowupRecord[]) {
  const headers = [
    "Account Number",
    "Account Name",
    "Phone Number",
    "Date Submitted",
  ];
  const rows = records.map((r) => [
    r.accountNumber,
    r.accountName,
    r.phoneNumber,
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
  a.download = "dormant_followups.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type DialogType = "delete" | "clear" | null;

export default function StaffFollowupsPage() {
  return (
    <ProtectedRoute>
      <StaffLayout title="Follow-Up Requests">
        <FollowupsContent />
      </StaffLayout>
    </ProtectedRoute>
  );
}

function FollowupsContent() {
  const { data: records = [], isLoading, error } = useFollowups();
  const deleteFollowups = useDeleteFollowups();
  const clearFollowups = useClearFollowups();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogType>(null);

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
      const result = await deleteFollowups.mutateAsync(ids);
      unwrapResult(result);
      setSelected(new Set());
      setDialog(null);
      toast.success(
        `Deleted ${ids.length} follow-up${ids.length !== 1 ? "s" : ""}.`,
      );
    } catch (err) {
      toast.error("Delete failed", { description: String(err) });
    }
  }

  async function handleClear() {
    try {
      const result = await clearFollowups.mutateAsync();
      unwrapResult(result);
      setSelected(new Set());
      setDialog(null);
      toast.success("All follow-up records cleared.");
    } catch (err) {
      toast.error("Clear failed", { description: String(err) });
    }
  }

  if (isLoading)
    return <LoadingSpinner size="lg" label="Loading follow-up requests…" />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div className="space-y-5" data-ocid="followups.page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl">
            Follow-Up Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} record{records.length !== 1 ? "s" : ""} total
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
              data-ocid="followups.delete_button"
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
            data-ocid="followups.export_button"
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
            data-ocid="followups.clear_button"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No follow-up requests"
          description="Follow-up requests from customers will appear here."
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card-elevated overflow-hidden">
            <table className="w-full text-sm" data-ocid="followups.table">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                      data-ocid="followups.select_all_checkbox"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Account Number
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Account Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wide text-xs">
                    Date Submitted
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
                      data-ocid={`followups.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleOne(sid)}
                          aria-label={`Select ${record.accountName}`}
                          data-ocid={`followups.checkbox.${idx + 1}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {record.accountNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {record.accountName}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {record.phoneNumber}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(record.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
                data-ocid="followups.mobile.select_all_checkbox"
              />
              <span className="text-sm text-muted-foreground">Select all</span>
            </div>
            {records.map((record, idx) => {
              const sid = String(record.id);
              const isChecked = selected.has(sid);
              return (
                <div
                  key={sid}
                  className={`card-elevated rounded-xl p-4 flex gap-3 transition-colors ${
                    isChecked ? "ring-2 ring-primary/40" : ""
                  }`}
                  data-ocid={`followups.item.${idx + 1}`}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleOne(sid)}
                    aria-label={`Select ${record.accountName}`}
                    className="mt-0.5"
                    data-ocid={`followups.checkbox.${idx + 1}`}
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium text-foreground truncate">
                      {record.accountName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {record.accountNumber}
                    </p>
                    <p className="text-sm text-foreground">
                      {record.phoneNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(record.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(o) => !o && setDialog(null)}
        title={`Delete ${selected.size} record${selected.size !== 1 ? "s" : ""}?`}
        description="These follow-up records will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteFollowups.isPending}
      />

      {/* Confirm Clear All */}
      <ConfirmDialog
        open={dialog === "clear"}
        onOpenChange={(o) => !o && setDialog(null)}
        title="Clear all follow-up records?"
        description="This will permanently delete ALL follow-up requests. This action is irreversible and cannot be undone."
        confirmLabel="Clear All"
        variant="destructive"
        onConfirm={handleClear}
        loading={clearFollowups.isPending}
      />
    </div>
  );
}
