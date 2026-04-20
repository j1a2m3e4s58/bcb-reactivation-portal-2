import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useNavigate } from "@tanstack/react-router";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useStaffAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/staff/followups" });
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin() {
    await login();
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="staff_login.page"
    >
      {/* Top bar */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="card-elevated rounded-2xl p-8 shadow-lg">
            {/* Bank branding */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center ring-4 ring-primary/20 shadow-md">
                <img
                  src="/barb_logo.png"
                  alt="BAWJIASE COMMUNITY BANK PLC logo"
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
              <div className="text-center">
                <h1 className="font-display font-bold text-foreground text-lg leading-tight">
                  BAWJIASE COMMUNITY BANK PLC
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  Dormant Account Reactivation System
                </p>
              </div>
            </div>

            <div className="border-t border-border mb-8" />

            {/* Login section */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                <ShieldCheck
                  className="w-6 h-6 text-primary"
                  aria-hidden="true"
                />
              </div>
              <h2 className="font-display font-semibold text-foreground text-xl mb-2">
                Staff Portal Login
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Authorized staff only. Please sign in using Internet Identity to
                access the staff management portal.
              </p>
            </div>

            {isLoading ? (
              <LoadingSpinner size="md" label="Signing in…" className="py-4" />
            ) : (
              <Button
                onClick={handleLogin}
                className="w-full h-12 text-base font-semibold gap-2 transition-smooth"
                data-ocid="staff_login.submit_button"
                disabled={isLoading}
              >
                <Fingerprint className="w-5 h-5" aria-hidden="true" />
                Sign In with Internet Identity
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
              Internet Identity provides secure, cryptographic authentication.
              Your identity is never shared with third parties.
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            &copy; {new Date().getFullYear()} BAWJIASE COMMUNITY BANK PLC. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
