import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "@tanstack/react-router";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { label: "Publication List", to: "/" },
  { label: "Reactivation Portal", to: "/reactivation" },
];

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group"
              data-ocid="nav.logo_link"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-primary/10 flex-shrink-0">
                <img
                  src="/barb_logo.png"
                  alt="BAWJIASE COMMUNITY BANK PLC"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                <Building2
                  className="w-5 h-5 text-primary hidden"
                  aria-hidden="true"
                  style={{ display: "none" }}
                />
              </div>
              <div className="leading-tight">
                <span className="block font-display font-bold text-sm text-foreground tracking-tight">
                  BAWJIASE
                </span>
                <span className="block text-[10px] font-body text-muted-foreground uppercase tracking-widest leading-none">
                  Community Bank PLC
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={`nav.${link.label.toLowerCase().replace(/\s+/g, "_")}_link`}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/staff/login"
                className="hidden md:block"
                data-ocid="nav.login_button"
              >
                <Button variant="outline" size="sm" className="font-medium">
                  Staff Login
                </Button>
              </Link>

              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                    data-ocid="nav.mobile_menu_button"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-card pt-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 pb-4 mb-2 border-b border-border">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                        <img
                          src="/barb_logo.png"
                          alt="Bank logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (
                              e.currentTarget as HTMLImageElement
                            ).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        BAWJIASE
                      </span>
                    </div>
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          data-ocid={`nav.mobile.${link.label.toLowerCase().replace(/\s+/g, "_")}_link`}
                          className={`px-4 py-3 rounded-md text-sm font-medium transition-smooth ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                    <div className="mt-2 pt-2 border-t border-border">
                      <Link
                        to="/staff/login"
                        onClick={() => setMobileOpen(false)}
                        data-ocid="nav.mobile.login_button"
                      >
                        <Button
                          variant="outline"
                          className="w-full font-medium"
                        >
                          Staff Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden bg-primary/10">
                <img
                  src="/barb_logo.png"
                  alt=""
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
              <span className="font-medium">BAWJIASE COMMUNITY BANK PLC</span>
            </div>
            <p>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
