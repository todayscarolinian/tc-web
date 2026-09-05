import { PageHeader } from "@/components/staff/page-header";
import { AnalyticsView } from "@/components/staff/analytics-view";
import { AnalyticsComingSoon } from "@/components/staff/analytics-coming-soon";
import { ENABLE_ANALYTICS } from "@/src/lib/flags";

export default function StaffAnalyticsPage() {
  if (ENABLE_ANALYTICS) return <AnalyticsView />;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Traffic overview" />
      <div className="p-5 sm:p-8">
        <AnalyticsComingSoon />
      </div>
    </>
  );
}
