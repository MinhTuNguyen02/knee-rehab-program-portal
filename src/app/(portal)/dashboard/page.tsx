import { fetchWithAuth } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { KPICard } from "@/components/KPICard";
import { ZoneBadge } from "@/components/ZoneBadge";
import { ChartLineUp, Users, PresentationChart, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const token = await getToken();

  if (!token) {
    redirect("/login");
  }

  try {
    const [stats, recentAssessments] = await Promise.all([
      fetchWithAuth("/dashboard/stats", token, { next: { revalidate: 0 } }),
      fetchWithAuth("/assessments?limit=5", token, { next: { revalidate: 0 } })
    ]);

    const conversionRate = stats.totalSubmissions > 0
      ? Math.round((stats.totalOptedIn / stats.totalSubmissions) * 100)
      : 0;

    const totalGreen = stats.byZone?.green || 0;
    const totalAmber = stats.byZone?.amber || 0;
    const totalRed = stats.byZone?.red || 0;
    const totalSubmissions = stats.totalSubmissions || 1; // prevent div zero

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Overview of knee rehab program performance and recent activity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Submissions"
            value={stats.totalSubmissions || 0}
            icon={<ChartLineUp size={20} />}
          />
          <KPICard
            title="Opted-In Patients"
            value={stats.totalOptedIn || 0}
            icon={<Users size={20} />}
            description="Patients who provided contact info"
          />
          <KPICard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={<PresentationChart size={20} />}
          />
          <KPICard
            title="Red Zone Alerts"
            value={totalRed}
            icon={<CheckCircle size={20} className="text-red-500" />}
            description="Critical severity assessments"
          />
        </div>

        {/* Zone Distribution Bar */}
        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Assessment Zone Distribution</h3>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div style={{ width: `${(totalGreen / totalSubmissions) * 100}%` }} className="bg-emerald-500 transition-all"></div>
            <div style={{ width: `${(totalAmber / totalSubmissions) * 100}%` }} className="bg-amber-500 transition-all"></div>
            <div style={{ width: `${(totalRed / totalSubmissions) * 100}%` }} className="bg-red-500 transition-all"></div>
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Green ({totalGreen})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Amber ({totalAmber})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Red ({totalRed})</span>
            </div>
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">Recent Assessments</h3>
            <Link href="/assessments" className="text-sm font-medium text-primary hover:text-primary-hover">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Zone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {recentAssessments.data?.map((assessment: any) => (
                  <tr key={assessment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-white font-mono">{assessment.displayId || assessment.id.substring(0, 8)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(assessment.createdAt).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 font-mono dark:text-slate-400">{assessment.score}</td>
                    <td className="whitespace-nowrap px-6 py-4"><ZoneBadge zone={assessment.zone} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{assessment.patientId ? "Opted In" : "Anonymous"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!recentAssessments.data || recentAssessments.data.length === 0) && (
              <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No recent assessments found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Failed to load dashboard data</h3>
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">Please make sure the backend is running and you are authenticated.</p>
      </div>
    );
  }
}
