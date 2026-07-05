import { fetchWithAuth } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LeadsTableClient } from "./LeadsTableClient";

export default async function LeadsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const token = await getToken();
  if (!token) redirect("/login");

  const searchParams = await props.searchParams;
  const page = searchParams.page || "1";
  const zone = searchParams.zone || "";

  let data = { data: [], meta: { total: 0, totalPages: 1 } };
  
  try {
    const query = new URLSearchParams({ page, limit: "20" });
    if (zone) query.append("zone", zone);
    
    data = await fetchWithAuth(`/leads?${query.toString()}`, token, { next: { revalidate: 0 } });
  } catch (error) {
    console.error("Failed to fetch leads", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Leads</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage opted-in patients from the knee rehab assessment.
        </p>
      </div>

      <LeadsTableClient 
        initialData={data.data || []} 
        meta={data.meta || { total: 0, totalPages: 1 }}
        currentPage={parseInt(page)}
        currentZone={zone}
      />
    </div>
  );
}
