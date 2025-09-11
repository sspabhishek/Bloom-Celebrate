import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/config";
import { utils, write } from "xlsx";
import { saveAs } from "file-saver";

export type Lead = {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string; // ISO or date string
  designId?: string;
  message?: string;
  createdAt?: string; // ISO string
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatOnlyDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export default function LeadsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useQuery<Lead[]>({
    queryKey: ["contact"],
    queryFn: async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("admin_token")
          : null;
  
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
  
      const res = await fetch(`${API_BASE_URL}/contact`, { headers });
  
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(text || "Failed to fetch contact");
      }
  
      return (await res.json()) as Lead[];
    },
  });
  

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!data) return [] as Lead[];
    if (!q) return data;
    return data.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const msg = (item.message || '').toLowerCase();
      return name.includes(q) || email.includes(q) || msg.includes(q);
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = filtered.slice(start, start + pageSize);

  function exportToExcel() {
    const rows = visibleRows.map((r) => ({
      Name: r.name || "",
      Email: r.email || "",
      Phone: r.phone || "",
      "Event Date": formatOnlyDate(r.eventDate),
      "Design ID": r.designId || "",
      Message: r.message || "",
      "Created At": formatDate(r.createdAt),
    }));

    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Leads");
    const wbout = write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "leads.xlsx");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <h3 className="text-lg font-semibold">Leads</h3>
        <div className="flex gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search by name, email, message"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-80"
          />
          <Button onClick={exportToExcel} variant="outline" className="ml-auto h-9 px-3 sm:h-10 sm:px-4">
            <i className="fas fa-file-export mr-2" /> Export to Excel
          </Button>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden">
        <div className="space-y-3">
          {isLoading && (
            <div className="border rounded-lg p-6 text-center">
              <div className="mx-auto h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              <div className="text-sm text-muted-foreground mt-2">Loading...</div>
            </div>
          )}

          {isError && !isLoading && (
            <div className="border rounded-lg p-4 text-destructive text-sm">
              Failed to load leads{error instanceof Error ? `: ${error.message}` : ''}
            </div>
          )}

          {!isLoading && !isError && visibleRows.length === 0 && (
            <div className="border rounded-lg p-4 text-muted-foreground text-sm">
              No leads found.
            </div>
          )}

          {!isLoading && !isError && visibleRows.map((lead, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-card text-card-foreground">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-base">{lead.name || '—'}</div>
                  <div className="text-sm text-muted-foreground break-all">{lead.email || '—'}</div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{formatOnlyDate(lead.eventDate)}</div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                {lead.phone && (
                  <div><span className="font-medium">Phone:</span> {lead.phone}</div>
                )}
                {lead.designId && (
                  <div><span className="font-medium">Design ID:</span> {lead.designId}</div>
                )}
                {lead.message && (
                  <div className="line-clamp-4"><span className="font-medium">Message:</span> {lead.message}</div>
                )}
                <div className="text-xs text-muted-foreground">Created: {formatDate(lead.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table (Desktop/Tablet) */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="">Email</TableHead>
                <TableHead className="md:table-cell">Phone</TableHead>
                <TableHead className="lg:table-cell">Event Date</TableHead>
                <TableHead className="xl:table-cell">Design ID</TableHead>
                <TableHead className="">Message</TableHead>
                <TableHead className="lg:table-cell">Created At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="mx-auto h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm text-muted-foreground mt-2">Loading...</div>
                  </TableCell>
                </TableRow>
              )}

              {isError && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-destructive">
                    Failed to load leads{error instanceof Error ? `: ${error.message}` : ''}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && visibleRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && visibleRows.map((lead, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50 align-top">
                  <TableCell className="whitespace-nowrap">{lead.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{lead.email}</TableCell>
                  <TableCell className="whitespace-nowrap md:table-cell">{lead.phone || ''}</TableCell>
                  <TableCell className="whitespace-nowrap lg:table-cell">{formatOnlyDate(lead.eventDate)}</TableCell>
                  <TableCell className="whitespace-nowrap xl:table-cell">{lead.designId || ''}</TableCell>
                  <TableCell className="max-w-[24rem] truncate" title={lead.message}>{lead.message}</TableCell>
                  <TableCell className="whitespace-nowrap lg:table-cell">{formatDate(lead.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Page {currentPage} of {totalPages} • Showing {visibleRows.length} of {filtered.length}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(1)}>First</Button>
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>Last</Button>
        </div>
      </div>
    </div>
  );
}
