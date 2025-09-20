import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteLeadMutation = useMutation({
    mutationFn: async (phone: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete lead');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact'] });
      toast({
        title: "Success",
        description: "Lead closed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close lead",
        variant: "destructive",
      });
    },
  });

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
    <div className="flex flex-col gap-4 h-[calc(100vh-180px)] overflow-y-auto">
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
      <div className="sm:hidden h-[calc(100vh-180px)] overflow-y-auto pb-4 px-3">
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
            <div className="border rounded-lg p-4 text-muted-foreground text-sm text-center">
              No leads found.
            </div>
          )}

          {!isLoading && !isError && visibleRows.map((lead, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm hover:shadow transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{lead.name || '—'}</h3>
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="text-sm text-blue-600 hover:underline break-all block mt-1"
                  >
                    {lead.email || '—'}
                  </a>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                  {formatOnlyDate(lead.eventDate)}
                </div>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                {lead.phone && (
                  <div className="truncate">
                    <span className="font-medium">Phone: </span>
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.designId && (
                  <div className="truncate">
                    <span className="font-medium">Design ID: </span>
                    {lead.designId}
                  </div>
                )}
                {lead.message && (
                  <div className="line-clamp-3 text-sm">
                    <span className="font-medium">Message: </span>
                    <span className="text-muted-foreground">{lead.message}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-1">
                  {formatDate(lead.createdAt)}
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    lead.phone && deleteLeadMutation.mutate(lead.phone);
                  }}
                  disabled={deleteLeadMutation.isPending}
                  className="w-full"
                >
                  {deleteLeadMutation.isPending ? "Closing..." : "Close Lead"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table (Desktop/Tablet) */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <div className="overflow-auto max-h-[70vh] w-full">
          <Table className="min-w-[1000px] lg:min-w-0">
            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[120px]">Name</TableHead>
                <TableHead className="w-[180px]">Email</TableHead>
                <TableHead className="w-[120px] md:table-cell">Phone</TableHead>
                <TableHead className="w-[100px] lg:table-cell">Event Date</TableHead>
                <TableHead className="w-[100px] xl:table-cell">Design ID</TableHead>
                <TableHead className="min-w-[150px]">Message</TableHead>
                <TableHead className="w-[150px] lg:table-cell">Created At</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="mx-auto h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm text-muted-foreground mt-2">Loading...</div>
                  </TableCell>
                </TableRow>
              )}

              {isError && !isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-destructive">
                    Failed to load leads{error instanceof Error ? `: ${error.message}` : ''}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && visibleRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && visibleRows.map((lead, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50 align-top">
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">{lead.name || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                        {lead.phone}
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">{formatOnlyDate(lead.eventDate) || '-'}</TableCell>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">{lead.designId || '-'}</TableCell>
                  <TableCell className="max-w-[200px] overflow-hidden text-ellipsis" title={lead.message}>
                    <span className="line-clamp-2">{lead.message || '-'}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis">{formatDate(lead.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => lead.phone && deleteLeadMutation.mutate(lead.phone)}
                      disabled={deleteLeadMutation.isPending}
                    >
                      {deleteLeadMutation.isPending ? "Closing..." : "Close"}
                    </Button>
                  </TableCell>
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
