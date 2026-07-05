"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { ZoneFilter } from "@/components/ZoneFilter";
import { Pagination } from "@/components/Pagination";
import { ZoneBadge } from "@/components/ZoneBadge";
import { CaretUp, CaretDown, ArrowsDownUp } from "@phosphor-icons/react";

export function LeadsTableClient({ initialData, meta, currentPage, currentZone }: any) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleZoneChange = (zone: string) => {
    const query = new URLSearchParams();
    if (zone) query.append("zone", zone);
    router.push(`/leads?${query.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    if (currentZone) query.append("zone", currentZone);
    router.push(`/leads?${query.toString()}`);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...initialData];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(lead =>
        (lead.firstName?.toLowerCase() || "").includes(q) ||
        (lead.lastName?.toLowerCase() || "").includes(q) ||
        (lead.email?.toLowerCase() || "").includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "name") {
        valA = `${a.firstName} ${a.lastName}`;
        valB = `${b.firstName} ${b.lastName}`;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialData, searchQuery, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowsDownUp size={14} className="text-slate-400" />;
    return sortDirection === "asc" ? <CaretUp size={14} className="text-primary" /> : <CaretDown size={14} className="text-primary" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name or email..." />
        <ZoneFilter value={currentZone} onChange={handleZoneChange} />
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-2">Name <SortIcon field="name" /></div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-2">Email <SortIcon field="email" /></div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort("zone")}>
                  <div className="flex items-center gap-2">Zone <SortIcon field="zone" /></div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  <div className="flex items-center gap-2">Knee Side</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-2">Date <SortIcon field="createdAt" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {filteredAndSortedData.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => router.push(`/leads/${lead.id}`)}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{lead.email}</td>
                  <td className="whitespace-nowrap px-6 py-4"><ZoneBadge zone={lead.assessments?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.zone} /></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400 capitalize">{lead.kneeSide || "Unknown"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAndSortedData.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No leads found matching your criteria.
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          totalCount={meta.total}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
