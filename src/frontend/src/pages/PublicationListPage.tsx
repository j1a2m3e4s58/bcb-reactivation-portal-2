import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { PublicLayout } from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicationAccounts } from "@/lib/backend";
import type { PublicationAccount } from "@/lib/backend";
import { Building2, CalendarDays, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"].map((k) => (
        <div key={k} className="flex gap-4 px-4 py-3">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </div>
  );
}

function AccountRow({
  account,
  index,
}: { account: PublicationAccount; index: number }) {
  return (
    <tr
      className={`border-b border-border transition-colors hover:bg-muted/30 ${
        index % 2 === 0 ? "bg-card" : "bg-background"
      }`}
      data-ocid={`publication.item.${index + 1}`}
    >
      <td className="px-5 py-3.5 text-sm text-foreground font-medium">
        {account.accountName}
      </td>
      <td className="px-5 py-3.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {account.branch}
        </span>
      </td>
      <td className="px-5 py-3.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays
            className="w-3.5 h-3.5 flex-shrink-0"
            aria-hidden="true"
          />
          {account.dateOfDormancy}
        </span>
      </td>
    </tr>
  );
}

function AccountCard({
  account,
  index,
}: { account: PublicationAccount; index: number }) {
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 shadow-sm"
      data-ocid={`publication.item.${index + 1}`}
    >
      <p className="font-semibold text-foreground text-sm">
        {account.accountName}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Building2 className="w-3 h-3" aria-hidden="true" />
          {account.branch}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3" aria-hidden="true" />
          {account.dateOfDormancy}
        </span>
      </div>
    </div>
  );
}

export default function PublicationListPage() {
  const [search, setSearch] = useState("");
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = usePublicationAccounts();

  const filtered = useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter((a) => a.accountName.toLowerCase().includes(q));
  }, [accounts, search]);

  return (
    <PublicLayout>
      {/* Hero section */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">
                  Official Notice
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Dormant Account Publication List
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
                BAWJIASE COMMUNITY BANK PLC — accounts that have been dormant as
                required by Bank of Ghana guidelines. If your account appears
                here, please visit the nearest branch or use the Reactivation
                Portal.
              </p>
            </div>
            {!isLoading && !isError && accounts.length > 0 && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-sm"
              >
                <Users className="w-3.5 h-3.5" />
                {filtered.length} / {accounts.length} accounts
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="mt-5 relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by customer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-ocid="publication.search_input"
              aria-label="Search accounts by customer name"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isError && (
          <ErrorMessage
            title="Failed to load publication list"
            message={
              error instanceof Error ? error.message : "Please try again later."
            }
            className="mb-6"
          />
        )}

        {isLoading ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-border bg-muted/40">
              <Skeleton className="h-4 w-64" />
            </div>
            <TableSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              search
                ? "No accounts match your search"
                : "No accounts published yet"
            }
            description={
              search
                ? `No results for "${search}". Try a different name.`
                : "The publication list is currently empty. Please check back later."
            }
            data-ocid="publication.empty_state"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table
                  className="w-full"
                  aria-label="Dormant accounts publication list"
                >
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Name of Customer
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Branch Name
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        Date of Dormancy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((account, i) => (
                      <AccountRow
                        key={account.accountName}
                        account={account}
                        index={i}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {accounts.length}
                </span>{" "}
                accounts
              </div>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3" data-ocid="publication.list">
              {filtered.map((account, i) => (
                <AccountCard
                  key={account.accountName}
                  account={account}
                  index={i}
                />
              ))}
              <p className="text-center text-xs text-muted-foreground pt-2">
                Showing {filtered.length} of {accounts.length} accounts
              </p>
            </div>
          </>
        )}
      </section>
    </PublicLayout>
  );
}
