import { fetchWithAuth } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssessmentsTableClient } from "./AssessmentsTableClient";

export default async function AssessmentsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const token = await getToken();
  if (!token) redirect("/login");

  const searchParams = await props.searchParams;
  const page = searchParams.page || "1";
  const zone = searchParams.zone || "";
  const source = searchParams.source || "";

  let data = { data: [], meta: { total: 0, totalPages: 1 } };

  try {
    const query = new URLSearchParams({ page, limit: "20" });
    if (zone) query.append("zone", zone);
    if (source) query.append("source", source);

    data = await fetchWithAuth(`/assessments?${query.toString()}`, token, { next: { revalidate: 0 } });
  } catch (error) {
    console.error("Failed to fetch assessments", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assessments</h1>
        <p className="mt-2 text-sm text-slate-600">
          View all patient submissions, including both opted-in and anonymous users.
        </p>
      </div>

      <AssessmentsTableClient
        initialData={data.data || []}
        meta={data.meta || { total: 0, totalPages: 1 }}
        currentPage={parseInt(page)}
        currentZone={zone}
        currentSource={source}
      />
    </div>
  );
}
