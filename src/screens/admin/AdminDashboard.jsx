import React, { useState } from "react";
import { FileText, CircleDot, Loader, CircleCheck, CheckCheck, Image as ImageIcon, ChevronRight } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate, Link } from "../../lib/router.jsx";
import { EmptyState, StatCard, Loading } from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { ReportsTable } from "../../components/ReportsTable.jsx";
import { AssignModal } from "../../components/AssignModal.jsx";
import { CampusToday } from "../../components/CampusToday.jsx";

export default function AdminDashboard() {
  const { reports, announcements = [], dataLoading } = useApp();
  const count = (s) => reports.filter((r) => r.status === s).length;
  const unassigned = reports
    .filter((r) => r.status === "Open" && !r.assignedStaffId)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  const [assignTarget, setAssignTarget] = useState(null);

  const bannerCount = Math.min(6, announcements.filter((a) => a.inBanner || a.pinned).length || 6);

  return (
    <AppShell activeKey="dashboard" title="Dashboard">
      <PageHeader title="Admin overview" subtitle="Everything happening across campus, at a glance." />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard label="Total reports" value={reports.length} icon={FileText} tone="slate" />
        <StatCard label="Open" value={count("Open")} icon={CircleDot} tone="amber" />
        <StatCard label="In Progress" value={count("In Progress")} icon={Loader} tone="blue" />
        <StatCard label="Resolved" value={count("Resolved")} icon={CircleCheck} tone="emerald" />
      </div>

      {/* Dashboard Banner Quick Management Strip */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-lg border border-brd bg-surface p-3 sm:p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400">
            <ImageIcon size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-ink">Dashboard Banner Carousel</h4>
              <span className="rounded bg-brand-50 px-1.5 py-0.2 text-[10px] font-bold text-brand dark:bg-brand-900/30">
                {bannerCount} / 6 active
              </span>
            </div>
            <p className="text-[11px] text-ink-3">Select and remove which announcements appear on the student dashboard.</p>
          </div>
        </div>
        <Link
          to="/admin/banner"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand hover:text-brand-700 hover:underline"
        >
          <span>Manage Banner</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-ink-3">Needs assignment</h3>
            <p className="text-xs text-ink-3">Open reports waiting for a staff member.</p>
          </div>
          <Link to="/admin/reports" className="text-base font-semibold text-brand hover:text-brand-700">All reports</Link>
        </div>
        {dataLoading ? (
          <Loading />
        ) : unassigned.length === 0 ? (
          <EmptyState icon={CheckCheck} title="Nothing waiting" message="Every open report has been assigned." />
        ) : (
          <ReportsTable rows={unassigned} onAssign={setAssignTarget} onOpen={(r) => navigate(`/reports/${r.id}`)} />
        )}
      </div>

      <CampusToday className="mt-4 sm:mt-5" />

      <AssignModal report={assignTarget} onClose={() => setAssignTarget(null)} />
    </AppShell>
  );
}
