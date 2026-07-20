"use client";

import { useState } from "react";
import { ZoneBadge } from "@/components/ui/ZoneBadge";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { AssessmentDetails } from "@/components/management/AssessmentDetails";
import { DataTable } from "@/components/data-display/DataTable";

import { useMemo } from "react";

interface LeadAssessmentsClientProps {
  assessments: any[];
}

export function LeadAssessmentsClient({ assessments }: LeadAssessmentsClientProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentCursor, setCurrentCursor] = useState<string>("");
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const PAGE_SIZE = 10;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCursorHistory([]);
    setCurrentCursor("");
  };

  const sortedData = useMemo(() => {
    const result = [...(assessments || [])];
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) valA = sortDirection === "asc" ? Infinity : -Infinity;
      if (valB === null || valB === undefined) valB = sortDirection === "asc" ? Infinity : -Infinity;

      if (sortField === "createdAt") {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [assessments, sortField, sortDirection]);

  const startIndex = useMemo(() => {
    if (!currentCursor) return 0;
    const index = sortedData.findIndex((a) => a.id === currentCursor);
    return index !== -1 ? index + 1 : 0;
  }, [sortedData, currentCursor]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedData, startIndex]);

  const hasMore = startIndex + PAGE_SIZE < sortedData.length;
  const endCursor = paginatedData.length > 0 ? paginatedData[paginatedData.length - 1].id : "";

  const handleNextPage = () => {
    if (!hasMore || !endCursor) return;
    setCursorHistory((prev) => [...prev, currentCursor]);
    setCurrentCursor(endCursor);
  };

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) return;
    const newHistory = [...cursorHistory];
    const prevCursor = newHistory.pop() || "";
    setCursorHistory(newHistory);
    setCurrentCursor(prevCursor);
  };

  return (
    <>
      <DataTable
        columns={[
          { key: "displayId", label: "ID", sortable: false, className: "font-medium text-slate-900 font-mono", render: (a) => a.displayId || a.id.substring(0, 8) },
          { key: "pain", label: "Pain", sortable: false, render: (a) => a.pain !== null && a.pain !== undefined ? a.pain : "N/A" },
          { key: "functionScore", label: "Function", sortable: false, render: (a) => a.functionScore !== null && a.functionScore !== undefined ? a.functionScore : "N/A" },
          { key: "score", label: "Score", sortable: false, className: "font-medium text-slate-900 font-mono" },
          { key: "zone", label: "Zone", sortable: false, render: (a) => <ZoneBadge zone={a.zone} /> },
          { key: "createdAt", label: "Date", sortable: false, render: (a) => formatDate(a.createdAt) },
        ]}
        data={paginatedData}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(assessment) => { setSelectedAssessment(assessment); setIsModalOpen(true); }}
        emptyStateMessage="No assessments recorded for this patient."
        pagination={{
          hasMore: hasMore,
          canGoPrev: cursorHistory.length > 0,
          onNext: handleNextPage,
          onPrev: handlePrevPage,
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assessment Details"
      >
        <AssessmentDetails assessment={selectedAssessment} />
      </Modal>
    </>
  );
}
