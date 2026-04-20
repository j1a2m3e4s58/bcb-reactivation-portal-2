import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useActivatedAccounts, usePendingReactivations } from "@/lib/backend";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StaffPrintPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/staff/print/$id" });

  const { data: activatedList = [], isLoading: loadingActivated } =
    useActivatedAccounts(null);

  const { data: pendingList = [], isLoading: loadingPending } =
    usePendingReactivations();

  const isLoading = loadingActivated || loadingPending;

  const activated = activatedList.find((r) => String(r.id) === id);
  const pending = pendingList.find((r) => String(r.id) === id);
  const record = activated ?? pending;

  const frontUrl = record?.ghanaCardFrontKey.getDirectURL();
  const backUrl = record?.ghanaCardBackKey.getDirectURL();
  const selfieUrl = record?.ghanaCardSelfieKey.getDirectURL();

  const refNumber = record
    ? `BCB-REACT-${String(record.id).padStart(6, "0")}`
    : `BCB-REACT-${id}`;

  const submittedDate = record ? formatDateTime(record.createdAt) : "—";
  const exportedDate = activated ? formatDateTime(activated.exportedAt) : "—";

  return (
    <div className="min-h-screen bg-background" data-ocid="print.page">
      {/* Screen-only controls */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: -1 as unknown as string })}
          className="gap-2"
          data-ocid="print.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          Reactivation Form — {record?.fullName ?? `Record #${id}`}
        </span>
        <Button
          size="sm"
          onClick={() => window.print()}
          className="ml-auto gap-2"
          data-ocid="print.print_button"
        >
          <Printer className="w-4 h-4" />
          Print Form
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" label="Loading reactivation record…" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && !record && (
        <div className="max-w-2xl mx-auto p-8">
          <ErrorMessage
            title="Record not found"
            message={`No reactivation record was found for ID ${id}. It may have been deleted.`}
          />
        </div>
      )}

      {/* Print Form */}
      {!isLoading && record && (
        <div className="max-w-[800px] mx-auto p-10 print:p-6 bg-card print:bg-white">
          {/* ── Header ── */}
          <div className="flex items-start gap-5 pb-5 border-b-2 border-foreground/20 mb-6">
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
              <img
                src="/barb_logo.png"
                alt="BAWJIASE COMMUNITY BANK PLC logo"
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-foreground text-lg leading-tight">
                BAWJIASE COMMUNITY BANK PLC
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your Community. Your Bank.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-display font-bold text-foreground text-base uppercase tracking-wide">
                Dormant Account
              </p>
              <p className="font-display font-bold text-foreground text-base uppercase tracking-wide">
                Reactivation Form
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Ref:{" "}
                <span className="font-mono font-semibold">{refNumber}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Date: {formatDate(record.createdAt)}
              </p>
            </div>
          </div>

          {/* ── Customer Information ── */}
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b border-border">
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <PrintField label="Full Name" value={record.fullName} />
              <PrintField label="Phone Number" value={record.phoneNumber} />
              <PrintField
                label="Account Number"
                value={record.accountNumber}
                className="font-mono"
              />
              {record.extraInfo && (
                <PrintField
                  label="Additional Information"
                  value={record.extraInfo}
                />
              )}
              <PrintField label="Submission Date" value={submittedDate} />
              {activated && (
                <PrintField
                  label="Exported / Reactivation Date"
                  value={exportedDate}
                />
              )}
            </div>
          </section>

          {/* ── Ghana Card Images ── */}
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-1 border-b border-border">
              Ghana Card Images
            </h2>
            <div className="flex flex-wrap gap-4 justify-start">
              {[
                { url: frontUrl, label: "Ghana Card Front" },
                { url: backUrl, label: "Ghana Card Back" },
                { url: selfieUrl, label: "Selfie with Ghana Card" },
              ].map(({ url, label }) =>
                url ? (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="w-44 h-32 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                      <img
                        src={url}
                        alt={label}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/assets/images/placeholder.svg";
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {label}
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          </section>

          {/* ── Signature / Approval ── */}
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 pb-1 border-b border-border">
              Signatures & Approval
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <SignatureBlock label="Customer Signature" />
              <div className="space-y-3">
                <PrintField label="Bank Officer Name" value="" blank />
                <PrintField label="Branch" value="" blank />
                <PrintField label="Date" value="" blank />
              </div>
            </div>
            <div className="mt-6">
              <SignatureBlock label="Bank Officer Signature" />
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="pt-5 border-t border-border text-center space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              BAWJIASE COMMUNITY BANK PLC — Dormant Account Reactivation Portal
            </p>
            <p className="text-xs text-muted-foreground">
              This form was generated by the BAWJIASE COMMUNITY BANK PLC
              Reactivation Portal. Generated on{" "}
              <span className="font-medium">
                {new Date().toLocaleDateString("en-GH", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              .
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              This document is confidential and intended for authorized bank
              staff only.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}

function PrintField({
  label,
  value,
  className = "",
  blank = false,
}: {
  label: string;
  value: string;
  className?: string;
  blank?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </p>
      {blank ? (
        <div className="border-b border-foreground/40 h-6 min-w-32" />
      ) : (
        <p className={`text-sm font-medium text-foreground ${className}`}>
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function SignatureBlock({ label }: { label: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-8">
        {label}
      </p>
      <div className="border-b border-foreground/40 w-full" />
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
