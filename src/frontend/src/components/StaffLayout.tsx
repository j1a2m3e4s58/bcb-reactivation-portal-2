import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  LogOut,
  Menu,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface StaffLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { label: "Follow-Ups", to: "/staff/followups", icon: Users },
  {
    label: "Online Reactivations",
    to: "/staff/reactivations",
    icon: RefreshCw,
  },
  { label: "Activated Accounts", to: "/staff/activated", icon: CheckCircle2 },
];

export function StaffLayout({ children, title }: StaffLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useStaffAuth();

  function handleLogout() {
    logout();
    navigate({ to: "/staff/login" });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
              <img
                src="/barb_logo.png"
                alt="Bank logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="leading-tight min-w-0">
              <span className="block font-display font-bold text-sm text-sidebar-foreground truncate">
                BAWJIASE
              </span>
              <span className="block text-[10px] font-body text-muted-foreground uppercase tracking-widest leading-none">
                Community Bank PLC
              </span>
            </div>
          </Link>
        </div>

        {/* Staff badge */}
        <div className="px-5 py-3">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Staff Portal
          </span>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 px-3 pb-4 space-y-1"
          aria-label="Staff navigation"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={`staff.nav.${item.label.toLowerCase().replace(/\s+/g, "_")}_link`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* Bottom */}
        <div className="p-3 flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
            onClick={handleLogout}
            data-ocid="staff.nav.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border sticky top-0 z-30 h-14 flex items-center px-4 gap-3">
          {/* Mobile sidebar trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open staff navigation"
                data-ocid="staff.nav.mobile_menu_button"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar pt-0 px-0">
              <div className="p-5 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex-shrink-0">
                    <img
                      src="/barb_logo.png"
                      alt="Bank logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                  <div>
                    <span className="block font-display font-bold text-sm text-sidebar-foreground">
                      BAWJIASE
                    </span>
                    <span className="block text-[10px] text-muted-foreground uppercase tracking-widest">
                      Staff Portal
                    </span>
                  </div>
                </div>
              </div>
              <nav className="p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      data-ocid={`staff.nav.mobile.${item.label.toLowerCase().replace(/\s+/g, "_")}_link`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth ${
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Separator className="my-2 bg-sidebar-border" />
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  data-ocid="staff.nav.mobile.logout_button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-smooth"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 rounded overflow-hidden bg-primary/10">
              <img
                src="/barb_logo.png"
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>

          {title && (
            <h1 className="font-display font-semibold text-foreground text-base truncate">
              {title}
            </h1>
          )}

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-background">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/40 px-6 py-4">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-smooth"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
