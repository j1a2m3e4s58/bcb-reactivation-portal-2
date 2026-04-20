import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDormantAccounts,
  useSubmitFollowup,
  useVerifyAccount,
} from "@/lib/backend";
import type { DormantAccount } from "@/lib/backend";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  PhoneCall,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Step = "idle" | "verify" | "followup" | "success";

interface FlowState {
  step: Step;
  account: DormantAccount | null;
  verifiedAccountNumber: string;
  verifiedAccountName: string;
}

const INITIAL_FLOW: FlowState = {
  step: "idle",
  account: null,
  verifiedAccountNumber: "",
  verifiedAccountName: "",
};

function AccountCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <Skeleton className="h-5 w-48 mb-3" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

function AccountCard({
  account,
  onRequest,
}: { account: DormantAccount; onRequest: () => void }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-smooth group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {account.accountName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {account.branch}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="flex-shrink-0 gap-1.5 group-hover:border-primary/50 transition-smooth"
          onClick={onRequest}
          data-ocid="reactivation.request_button"
          aria-label={`Request reactivation for ${account.accountName}`}
        >
          Request
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function ReactivationPortalPage() {
  const [search, setSearch] = useState("");
  const [flow, setFlow] = useState<FlowState>(INITIAL_FLOW);
  const [accountNumberInput, setAccountNumberInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const navigate = useNavigate();
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useDormantAccounts();
  const verifyMutation = useVerifyAccount();
  const followupMutation = useSubmitFollowup();

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter((a) => a.accountName.toLowerCase().includes(q));
  }, [accounts, search]);

  function openVerify(account: DormantAccount) {
    setFlow({
      step: "verify",
      account,
      verifiedAccountNumber: "",
      verifiedAccountName: "",
    });
    setAccountNumberInput("");
    setVerifyError("");
  }

  function closeFlow() {
    setFlow(INITIAL_FLOW);
    setAccountNumberInput("");
    setPhoneInput("");
    setVerifyError("");
    setPhoneError("");
    verifyMutation.reset();
    followupMutation.reset();
  }

  async function handleVerify() {
    const num = accountNumberInput.trim();
    if (!num) {
      setVerifyError("Please enter your account number.");
      return;
    }
    setVerifyError("");
    try {
      const result = await verifyMutation.mutateAsync(num);
      if (!result.found) {
        setVerifyError(
          result.message ||
            "Account number not found. Please check and try again.",
        );
        return;
      }
      setFlow((prev) => ({
        ...prev,
        step: "followup",
        verifiedAccountNumber: result.accountNumber ?? num,
        verifiedAccountName:
          result.accountName ?? prev.account?.accountName ?? "",
      }));
      setPhoneInput("");
      setPhoneError("");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Verification failed. Please try again.";
      toast.error(msg);
    }
  }

  async function handleSubmitFollowup() {
    const phone = phoneInput.trim();
    if (!phone) {
      setPhoneError("Phone number is required.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError(
        "Enter a valid 10-digit Ghana phone number (digits only, no spaces or dashes).",
      );
      return;
    }
    setPhoneError("");
    try {
      const result = await followupMutation.mutateAsync({
        accountNumber: flow.verifiedAccountNumber,
        phoneNumber: phone,
      });
      if (result.__kind__ === "err") {
        toast.error(result.err);
        return;
      }
      setFlow((prev) => ({ ...prev, step: "success" }));
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Submission failed. Please try again.";
      toast.error(msg);
    }
  }

  function goToOnlineReactivation() {
    navigate({
      to: "/reactivate",
      search: {
        account: flow.verifiedAccountNumber,
        name: flow.verifiedAccountName,
      } as Record<string, string>,
    });
    closeFlow();
  }

  return (
    <PublicLayout>
      {/* Header section */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
                Customer Portal
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight mt-1">
                Account Reactivation Portal
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
                Find your dormant account below, verify ownership, and request
                reactivation. A bank staff member will follow up with you.
              </p>
            </div>
          </div>
          <div className="mt-5 relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by account name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="reactivation.search_input"
              aria-label="Search accounts by name"
            />
          </div>
        </div>
      </section>

      {/* Account list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isError && (
          <ErrorMessage
            title="Failed to load accounts"
            message={
              error instanceof Error ? error.message : "Please try again later."
            }
            className="mb-6"
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <AccountCardSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={PhoneCall}
            title={
              search
                ? "No accounts match your search"
                : "No dormant accounts found"
            }
            description={
              search
                ? `No results for "${search}". Try a different name.`
                : "There are currently no accounts in the reactivation portal."
            }
            data-ocid="reactivation.empty_state"
          />
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            data-ocid="reactivation.list"
          >
            {filtered.map((account) => (
              <AccountCard
                key={account.accountNumber}
                account={account}
                onRequest={() => openVerify(account)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Step 1: Verify Account Modal */}
      <Dialog
        open={flow.step === "verify"}
        onOpenChange={(o) => !o && closeFlow()}
      >
        <DialogContent
          className="max-w-md bg-card border border-border"
          data-ocid="verify.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-semibold text-foreground">
              Verify Your Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              To proceed with reactivating{" "}
              <span className="font-semibold text-foreground">
                {flow.account?.accountName}
              </span>
              , please enter your account number to verify ownership.
            </p>
            <div className="space-y-1.5">
              <Label
                htmlFor="verify-account-number"
                className="text-sm font-medium"
              >
                Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="verify-account-number"
                placeholder="Enter your account number"
                value={accountNumberInput}
                onChange={(e) => {
                  setAccountNumberInput(e.target.value);
                  setVerifyError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                data-ocid="verify.account_number_input"
                disabled={verifyMutation.isPending}
                aria-describedby={verifyError ? "verify-error" : undefined}
              />
              {verifyError && (
                <div
                  id="verify-error"
                  className="flex items-start gap-2 text-sm text-destructive mt-1"
                  data-ocid="verify.error_state"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeFlow}
              disabled={verifyMutation.isPending}
              data-ocid="verify.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifyMutation.isPending || !accountNumberInput.trim()}
              data-ocid="verify.submit_button"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying…
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 2: Submit Phone Follow-Up Modal */}
      <Dialog
        open={flow.step === "followup"}
        onOpenChange={(o) => !o && closeFlow()}
      >
        <DialogContent
          className="max-w-md bg-card border border-border"
          data-ocid="followup.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-semibold text-foreground">
              Submit Phone Follow-Up
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/40 border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Verified Account
              </p>
              <p className="font-semibold text-foreground text-sm">
                {flow.verifiedAccountName}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {flow.verifiedAccountNumber}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone-number" className="text-sm font-medium">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone-number"
                type="tel"
                inputMode="numeric"
                placeholder="e.g. 0241234567"
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setPhoneError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitFollowup()}
                data-ocid="followup.phone_input"
                disabled={followupMutation.isPending}
                aria-describedby={phoneError ? "phone-error" : undefined}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Ghana number: exactly 10 digits
              </p>
              {phoneError && (
                <div
                  id="phone-error"
                  className="flex items-start gap-2 text-sm text-destructive mt-1"
                  data-ocid="followup.error_state"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{phoneError}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closeFlow}
              disabled={followupMutation.isPending}
              data-ocid="followup.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFollowup}
              disabled={followupMutation.isPending || phoneInput.length !== 10}
              data-ocid="followup.submit_button"
            >
              {followupMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 3: Success Modal */}
      <Dialog
        open={flow.step === "success"}
        onOpenChange={(o) => !o && closeFlow()}
      >
        <DialogContent
          className="max-w-md bg-card border border-border"
          data-ocid="success.dialog"
        >
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2
                className="w-8 h-8 text-success"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                Request Submitted!
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Your request has been submitted successfully. A bank staff
                member will contact you shortly on the provided phone number.
              </p>
            </div>
            <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 w-full text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Account
              </p>
              <p className="font-semibold text-foreground text-sm">
                {flow.verifiedAccountName}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You can also submit a full online reactivation with your Ghana
              Card documents now.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={closeFlow}
              className="w-full sm:w-auto"
              data-ocid="success.done_button"
            >
              Done
            </Button>
            <Button
              onClick={goToOnlineReactivation}
              className="w-full sm:w-auto gap-2"
              data-ocid="success.online_reactivation_button"
            >
              Continue to Online Reactivation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
