"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ZoneFilter } from "@/components/ZoneFilter";
import { Pagination } from "@/components/Pagination";
import { ZoneBadge } from "@/components/ZoneBadge";
import { CaretUp, CaretDown, ArrowsDownUp } from "@phosphor-icons/react";

export function AssessmentsTableClient({ initialData, meta, currentPage, currentZone, currentSource }: any) {
  const router = useRouter();

  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleFilterChange = (zone: string, source: string) => {
    const query = new URLSearchParams();
    if (zone) query.append("zone", zone);
    if (source) query.append("source", source);
    router.push(`/assessments?${query.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    if (currentZone) query.append("zone", currentZone);
    if (currentSource) query.append("source", currentSource);
    router.push(`/assessments?${query.toString()}`);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    let result = [...initialData];

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "patient") {
        valA = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : "Anonymous";
        valB = b.patient ? `${b.patient.firstName} ${b.patient.lastName}` : "Anonymous";
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialData, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowsDownUp size={14} className="text-slate-400" />;
    return sortDirection === "asc" ? <CaretUp size={14} className="text-primary" /> : <CaretDown size={14} className="text-primary" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4">
          <ZoneFilter value={currentZone} onChange={(val) => handleFilterChange(val, currentSource)} />
          <select
            value={currentSource}
            onChange={(e) => handleFilterChange(currentZone, e.target.value)}
            className="block w-40 rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="QR_CODE">QR Code</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-2">Date <SortIcon field="createdAt" /></div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort("score")}>
                  <div className="flex items-center gap-2">Score <SortIcon field="score" /></div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort("zone")}>
                  <div className="flex items-center gap-2">Zone <SortIcon field="zone" /></div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort("patient")}>
                  <div className="flex items-center gap-2">Linked Patient <SortIcon field="patient" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sortedData.map((assessment: any) => (
                <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 font-mono">
                    {assessment.displayId || assessment.id.substring(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 font-mono">
                    {assessment.score}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <ZoneBadge zone={assessment.zone} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 capitalize">
                    {assessment.source?.replace('_', ' ') || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                    {assessment.patient ? (
                      <button
                        onClick={() => router.push(`/leads/${assessment.patient.id}`)}
                        className="text-primary hover:text-primary-hover font-medium underline-offset-2 hover:underline"
                      >
                        {assessment.patient.firstName} {assessment.patient.lastName}
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Anonymous</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedData.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No assessments found matching your criteria.
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
