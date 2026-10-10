import React, { useState, useEffect } from "react";
import { Search, SearchX, Mail, MessageCircle, EyeOff, UserPlus, Check, X, Clock, Users } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate } from "../../lib/router.jsx";
import { Avatar, Badge, EmptyState, Loading, Modal, Button, useToast } from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { waHref, mailHref } from "../../components/featureKit.jsx";

// Read-only label like "Intake 49 · Section 5"
function metaLine(s, full = false) {
  return (
    [
      s.intake && `Intake ${s.intake}`,
      s.section && `${full ? "Section" : "Sec"} ${s.section}`,
      full ? s.department : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Student"
  );
}

function StatusBadge({ status }) {
  if (status === "accepted") return <Badge tone="emerald" icon={Check}>Connected</Badge>;
  if (status === "pending_outgoing") return <Badge tone="amber" icon={Clock}>Requested</Badge>;
  if (status === "pending_incoming") return <Badge tone="blue" icon={UserPlus}>Wants to connect</Badge>;
  return null;
}

export default function StudentDirectory() {
  const { currentUser, getStudentDirectory, sendConnectionRequest, respondConnection, cancelConnectionRequest, disconnectStudent } = useApp();
  const toast = useToast();
  if (!currentUser) return null;
  const hidden = currentUser.directoryVisible === false;
  const [list, setList] = useState(null); // null = still loading
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [classmatesOnly, setClassmatesOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (hidden) { setList([]); setLoadError(false); return; }
    setLoadError(false);
    getStudentDirectory()
      .then((rows) => { if (active) setList(rows); })
      .catch(() => { if (active) { setLoadError(true); setList([]); } });
    return () => { active = false; };
  }, [hidden]);

  async function refresh() {
    try {
      const rows = await getStudentDirectory();
      setLoadError(false);
      setList(rows);
      setSelected((sel) => (sel ? rows.find((r) => r.id === sel.id) || null : null));
    } catch {
      setLoadError(true);
    }
  }

  async function connect(s) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await sendConnectionRequest(s.id);
      if (res.ok) toast({ type: "success", title: "Request sent", message: `${s.name} will see your connection request.` });
      else toast({ type: "error", title: "Couldn't send request", message: res.error });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function respond(s, accept) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await respondConnection(s.id, accept);
      if (res.ok) {
        toast({
          type: "success",
          title: accept ? "Connected" : "Request declined",
          message: accept ? `You and ${s.name} can now see each other's contact.` : "",
        });
      } else {
        toast({ type: "error", title: "Couldn't update", message: res.error });
      }
      await refresh();
      if (res.ok && !accept) setSelected(null); // declined — don't leave a "Connect" prompt open
    } finally {
      setBusy(false);
    }
  }

  async function cancel(s) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await cancelConnectionRequest(s.id);
      if (!res.ok) toast({ type: "error", title: "Couldn't cancel", message: res.error });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(s) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await disconnectStudent(s.id);
      if (res.ok) {
        toast({ type: "info", title: "Connection removed", message: `You are no longer connected with ${s.name}.` });
        setSelected(null);
      } else {
        toast({ type: "error", title: "Couldn't disconnect", message: res.error });
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const all = list || [];
  const incoming = all.filter((s) => s.status === "pending_incoming");
  const filtered = all
    .filter((s) => s.status !== "pending_incoming") // shown in the Requests section above
    .filter((s) => {
      if (deptFilter !== "All" && s.department?.toLowerCase() !== deptFilter.toLowerCase()) return false;
      if (classmatesOnly && currentUser?.intake && currentUser?.section) {
        if (s.intake !== currentUser.intake || s.section !== currentUser.section) return false;
      }
      const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return true;
      const haystack = [
        s.name,
        s.department,
        s.intake ? `intake ${s.intake} ${s.intake}` : "",
        s.section ? `section ${s.section} sec ${s.section}` : "",
        s.intake && s.section ? `${s.intake}-${s.section} ${s.intake}/${s.section}` : "",
        s.bloodGroup,
        s.studentId,
        s.program,
        s.isCr ? "cr class representative" : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    });

  return (
    <AppShell activeKey="directory" title="Students">
      <PageHeader title="Student Directory" subtitle="Find classmates, seniors and juniors — connect to share contact details." />

      {hidden ? (
        <EmptyState
          icon={EyeOff}
          title="Your profile is hidden"
          message="You've turned off 'Show me in the Student Directory', so you can't browse other students. Turn it back on in your profile to use the directory."
          action={<Button onClick={() => navigate("/profile")}>Go to My Profile</Button>}
        />
      ) : loadError ? (
        <EmptyState
          icon={SearchX}
          title="Couldn't load the directory"
          message="Something went wrong reaching the server."
          action={<Button onClick={refresh}>Try again</Button>}
        />
      ) : list === null ? (
        <Loading />
      ) : (
        <>
          {/* Incoming connection requests */}
          {incoming.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-base font-semibold text-ink">Connection requests</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {incoming.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-md border border-brand-100 bg-brand-50 p-4">
                    <button onClick={() => setSelected(s)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <Avatar name={s.name} src={s.avatar} size={40} />
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-ink">{s.name}</p>
                        <p className="truncate text-xs text-ink-3">{metaLine(s)}</p>
                      </div>
                    </button>
                    <div className="flex shrink-0 gap-1.5">
                      <Button size="sm" variant="secondary" icon={X} className="text-danger" disabled={busy} onClick={() => respond(s, false)}>Decline</Button>
                      <Button size="sm" icon={Check} disabled={busy} onClick={() => respond(s, true)}>Accept</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search students"
                placeholder="Search by name, intake, section…"
                className="h-10 w-full rounded-md border border-brd bg-surface pl-9 pr-3 text-base placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-10 rounded-md border border-brd bg-surface px-3 text-base text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="All">All Departments</option>
              <option value="CSE">CSE · Computer Science</option>
              <option value="EEE">EEE · Electrical & Electronic</option>
              <option value="BBA">BBA · Business Administration</option>
              <option value="Law">Law · Department of Law</option>
              <option value="English">English · Department of English</option>
              <option value="Civil">Civil · Civil Engineering</option>
              <option value="Textile">Textile · Textile Engineering</option>
              <option value="Economics">Economics · Social Sciences</option>
            </select>

            {currentUser?.intake && currentUser?.section && (
              <button
                type="button"
                onClick={() => setClassmatesOnly(!classmatesOnly)}
                className={`h-10 rounded-md border px-3 text-base font-medium transition-colors ${
                  classmatesOnly
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-brd bg-surface text-ink-2 hover:bg-surface-2"
                }`}
              >
                {classmatesOnly
                  ? `My Sec (${currentUser.intake}-${currentUser.section})`
                  : `✨ My Sec (${currentUser.intake}-${currentUser.section})`}
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={query ? SearchX : Users}
              title={query ? "No students found" : "No students yet"}
              message={query ? "Try a different search." : "No other students are visible in the directory yet."}
              action={
                (query || deptFilter !== "All" || classmatesOnly) ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setDeptFilter("All");
                      setClassmatesOnly(false);
                    }}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="flex items-center gap-3 rounded-md border border-brd bg-surface p-4 text-left shadow-sm transition-colors hover:border-brd-2 hover:bg-surface-2"
                >
                  <Avatar name={s.name} src={s.avatar} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-ink">{s.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="truncate text-xs text-ink-3">{metaLine(s)}</p>
                      {s.isCr && <Badge size="sm" tone="amber">CR</Badge>}
                      {s.bloodGroup && <Badge size="sm" tone="rose">{s.bloodGroup}</Badge>}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Student detail + connection actions */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || "Student"} size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.name} src={selected.avatar} size={56} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-ink">{selected.name}</p>
                <p className="truncate text-xs text-ink-3">{metaLine(selected, true)}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {selected.isCr && <Badge size="sm" tone="amber">CR</Badge>}
                  {selected.bloodGroup && <Badge size="sm" tone="rose">{selected.bloodGroup}</Badge>}
                  {selected.studentId && <span className="text-xs text-ink-3 font-mono">ID: {selected.studentId}</span>}
                </div>
              </div>
            </div>

            {selected.status === "accepted" ? (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <Check size={14} /> You're connected — contact unlocked
                </p>
                {selected.email && (
                  <a href={mailHref(selected.email) || `mailto:${selected.email}`} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 rounded-md border border-brd bg-surface-2 p-3 text-base text-brand hover:bg-surface-3">
                    <Mail size={15} className="shrink-0" /> <span className="truncate">{selected.email}</span>
                  </a>
                )}
                {waHref(selected.whatsapp) ? (
                  <a href={waHref(selected.whatsapp)} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 rounded-md border border-brd bg-surface-2 p-3 text-base text-success hover:bg-surface-3">
                    <MessageCircle size={15} className="shrink-0" /> <span className="truncate">{selected.whatsapp}</span>
                  </a>
                ) : (
                  <p className="text-xs text-ink-3">This student hasn't shared a WhatsApp number.</p>
                )}
                <div className="pt-2 border-t border-brd flex justify-end">
                  <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-50" disabled={busy} onClick={() => disconnect(selected)}>
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : selected.status === "pending_incoming" ? (
              <div className="space-y-3">
                <p className="text-base text-ink-2">{selected.name} wants to connect with you. Accept to share contact details with each other.</p>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" icon={X} className="text-danger" disabled={busy} onClick={() => respond(selected, false)}>Decline</Button>
                  <Button icon={Check} disabled={busy} onClick={() => respond(selected, true)}>Accept</Button>
                </div>
              </div>
            ) : selected.status === "pending_outgoing" ? (
              <div className="space-y-3">
                <p className="flex items-center gap-1.5 text-base text-warn"><Clock size={15} /> Request sent — waiting for {selected.name} to accept.</p>
                <div className="flex justify-end">
                  <Button variant="secondary" disabled={busy} onClick={() => cancel(selected)}>Cancel request</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-base text-ink-2">Send a connection request to share contact details. {selected.name} will need to accept first.</p>
                <div className="flex justify-end">
                  <Button icon={UserPlus} disabled={busy} onClick={() => connect(selected)}>Connect</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
