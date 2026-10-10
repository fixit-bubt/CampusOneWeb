import React from "react";
import { Icon } from "../../components/Icon.jsx";
import {
  Button, Card, StatCard, Field, Input, Textarea, Select, Modal, EmptyState, Avatar, Spinner, Loading, useToast,
} from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { FilterTabs } from "../../components/FilterTabs.jsx";
import { AccentTile, SegmentToggle } from "../../components/featureKit.jsx";
import { useApp } from "../../data/store.jsx";
import { navigate } from "../../lib/router.jsx";
import { relativeDate, downloadFile } from "../../lib/helpers.js";

// ============================================================================
// FEATURE — Study Hub  (signature accent: teal)  — LIVE on Supabase (0046, 0051)
// An OPEN, department-wide study library. Each subject (course) holds Notes,
// Questions, and Books. VIEW is open to any approved student in the department
// (across all intakes, so juniors can study seniors' materials); UPLOAD is
// limited to approved members of your own section; pinned notices stay private
// to a section. Admins assign CRs but never see content. All data via useApp().
// ============================================================================

const ACCENT = "teal";
const isCR = (role) => role === "cr";
const canContribute = (role) => role === "cr" || role === "editor";

const BOOK_KIND_ICON = { Textbook: "BookMarked", Reference: "BookOpen", Syllabus: "ScrollText" };
const BOOK_FILTERS = ["All", "Textbook", "Reference", "Syllabus"];
const BOOK_KINDS = ["Textbook", "Reference", "Syllabus"];
const QB_EXAMS = ["CT 1", "CT 2", "Midterm", "Final"];
const MATERIAL_TYPES = ["Class Note", "Lecture Slide", "Assignment", "Reference", "Lab Manual"];
const FILE_ICON = { pdf: "FileText", doc: "FileType", docx: "FileType", ppt: "Presentation", pptx: "Presentation", img: "Image", zip: "FileArchive", link: "Link" };
const fileIcon = (kind) => FILE_ICON[kind] || "File";
const fmtFileSize = (mb) => (mb == null ? "" : mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`);

const shortDept = (name = "") => name.replace(/^Department of\s+/i, "");
const deptCode = (name = "") => {
  const s = shortDept(name);
  const words = s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w) && !/^(&|and|of|the|in|for)$/i.test(w));
  return words.length >= 2 ? words.map((w) => w[0].toUpperCase()).join("") : s;
};

// One glyph per faculty/branch (tone stays teal; only the icon varies).
const BRANCH_ICON = {
  "Engineering & Applied Sciences": "Cpu",
  "Business": "Briefcase",
  "Social Sciences": "Globe",
  "Science / Social Sciences": "Sigma",
  "Arts & Humanities": "BookOpenText",
  "Law": "Scale",
};
const BRANCH_ORDER = [
  "Engineering & Applied Sciences",
  "Business",
  "Science / Social Sciences",
  "Social Sciences",
  "Arts & Humanities",
  "Law",
];

// Resolves the enrolled student's department from their active section, pending request, or profile
function useStudentDept() {
  const { currentUser, departments, studyMembers, studySections, studyIntakes, resolveMySection } = useApp();
  const mine = resolveMySection();

  return React.useMemo(() => {
    if (!departments || departments.length === 0) return null;

    // 1. Approved home section
    if (mine?.section?.deptId) {
      const d = departments.find((dept) => dept.id === mine.section.deptId);
      if (d) return d;
    }

    // 2. Pending membership section
    const pendingSecId = studyMembers.find((m) => m.userId === currentUser?.id)?.sectionId;
    if (pendingSecId) {
      const s = studySections.find((x) => x.id === pendingSecId);
      const intake = s && studyIntakes.find((i) => i.id === s.intakeId);
      const d = intake && departments.find((dept) => dept.id === intake.deptId);
      if (d) return d;
    }

    // 3. User profile department or program string
    const userDeptStr = (currentUser?.dept || currentUser?.program || "").trim().toLowerCase();
    if (userDeptStr) {
      const matched = departments.find((d) => {
        const n = d.name.toLowerCase();
        const c = deptCode(d.name).toLowerCase();
        return n.includes(userDeptStr) || userDeptStr.includes(c) || userDeptStr.includes(n);
      });
      if (matched) return matched;
    }

    // 4. Default to CSE (dept_number '27') or first department in list
    return departments.find((d) => d.deptNumber === "27") || departments[0] || null;
  }, [currentUser, departments, studyMembers, studySections, studyIntakes, mine]);
}

// --- Shared: download a private file via a signed URL -----------------------
function DownloadButton({ path, name }) {
  const { getStudyFileUrl } = useApp();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  async function go() {
    if (busy) return;
    setBusy(true);
    try {
      const url = await getStudyFileUrl(path);
      if (!url) { toast({ type: "error", title: "Couldn't open file", message: "Please try again." }); return; }
      await downloadFile(url, name);
    } catch {
      toast({ type: "error", title: "Download failed", message: "Please try again." });
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button size="sm" variant="secondary" icon="Download" onClick={go} disabled={busy}>
      {busy ? <Spinner size={14} /> : "Download"}
    </Button>
  );
}

// --- Shared: any-file picker (captures the actual File) ---------------------
function DocField({ file, onChange }) {
  const inputRef = React.useRef(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current && inputRef.current.click()}
        className="flex w-full items-center gap-3 rounded-md border border-dashed border-brd-2 bg-surface-2 px-4 py-3 text-left transition-colors hover:bg-surface-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface text-ink-3 shadow-sm">
          <Icon name="Paperclip" size={16} />
        </span>
        <span className="min-w-0 flex-1">
          {file
            ? <span className="block truncate text-base font-semibold text-ink-2">{file.name}</span>
            : <span className="block text-base text-ink-3">Choose a file</span>}
          <span className="block text-xs text-ink-3">PDF, DOC, PPT, ZIP · up to 10 MB</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onChange(f); }}
      />
    </div>
  );
}

// --- Recent-activity row ----------------------------------------------------
function ActivityRow({ ev }) {
  const { studyPersonName } = useApp();
  return (
    <div className="flex items-center gap-3 p-4">
      <AccentTile icon={ev.kind === "pin" ? "Pin" : "FileText"} tone={ACCENT} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{ev.title}</p>
        <p className="truncate text-xs text-ink-3">
          {ev.context}{ev.context && " · "}{studyPersonName(ev.byId)}
        </p>
      </div>
      <span className="shrink-0 text-xs text-ink-3">{relativeDate(ev.createdAt)}</span>
    </div>
  );
}

// --- Course row -------------------------------------------------------------
function CourseRow({ course, sectionId, onDelete }) {
  const { studyFilesIn, studyQuestionsIn, studyBooksInCourse } = useApp();
  const allFiles = studyFilesIn(course.id);
  const notesCount = allFiles.filter((f) => f.type !== "Lecture Slide" && !["ppt", "pptx"].includes(f.kind)).length;
  const slidesCount = allFiles.filter((f) => f.type === "Lecture Slide" || ["ppt", "pptx"].includes(f.kind)).length;
  const qbCount = studyQuestionsIn(course.id).length;
  const booksCount = studyBooksInCourse(course.id).length;

  const parts = [];
  if (notesCount > 0) parts.push(`${notesCount} note${notesCount === 1 ? "" : "s"}`);
  if (slidesCount > 0) parts.push(`${slidesCount} slide${slidesCount === 1 ? "" : "s"}`);
  if (qbCount > 0) parts.push(`${qbCount} question${qbCount === 1 ? "" : "s"}`);
  if (booksCount > 0) parts.push(`${booksCount} book${booksCount === 1 ? "" : "s"}`);
  const summary = parts.length > 0 ? parts.join(" · ") : "No materials yet";

  return (
    <div className="group flex items-center transition-colors hover:bg-surface-2">
      <button
        onClick={() => navigate(`/study-hub/section/${sectionId}/course/${course.id}`)}
        className="flex min-w-0 flex-1 items-center gap-3.5 p-4 text-left"
      >
        <AccentTile icon="BookOpen" tone={ACCENT} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink text-base group-hover:text-teal-600 dark:group-hover:text-teal-300">
              {course.code}
            </span>
            <span className="text-ink-3">·</span>
            <span className="truncate text-base font-medium text-ink">
              {course.name}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-3">{summary}</p>
        </div>
        {!onDelete && (
          <Icon name="ChevronRight" size={18} className="shrink-0 text-ink-3 group-hover:text-teal-500 dark:group-hover:text-teal-300" />
        )}
      </button>
      {onDelete && (
        <div className="pr-3">
          <DeleteIcon onClick={() => onDelete(course)} title="Remove course" />
        </div>
      )}
    </div>
  );
}

// --- CR quick-actions banner ------------------------------------------------
function CRBanner({ section, sectionNumber }) {
  const { studyMembers } = useApp();
  const pending = studyMembers.filter((m) => m.sectionId === section.id && m.status === "pending").length;
  const editors = (section.editorIds || []).length;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-md border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/15 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <AccentTile icon="ShieldCheck" tone={ACCENT} size={40} />
        <div className="min-w-0">
          <p className="text-base font-semibold text-ink">You're the CR of Section {sectionNumber}</p>
          <p className="text-xs text-ink-2">
            {pending} join request{pending === 1 ? "" : "s"} pending · {editors} editor{editors === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <Button className="shrink-0" icon="Settings" onClick={() => navigate(`/study-hub/section/${section.id}/manage`)}>
        Manage section
      </Button>
    </div>
  );
}

// ============================================================================
// Academic Semesters (1 to 12) & Intake progression cards
// ============================================================================
const SEMESTER_INFO = [
  { num: 1, label: "1st Semester", phase: "1st Year · Freshman Term 1" },
  { num: 2, label: "2nd Semester", phase: "1st Year · Freshman Term 2" },
  { num: 3, label: "3rd Semester", phase: "1st Year · Freshman Term 3" },
  { num: 4, label: "4th Semester", phase: "2nd Year · Sophomore Term 1" },
  { num: 5, label: "5th Semester", phase: "2nd Year · Sophomore Term 2" },
  { num: 6, label: "6th Semester", phase: "2nd Year · Sophomore Term 3" },
  { num: 7, label: "7th Semester", phase: "3rd Year · Junior Term 1" },
  { num: 8, label: "8th Semester", phase: "3rd Year · Junior Term 2" },
  { num: 9, label: "9th Semester", phase: "3rd Year · Junior Term 3" },
  { num: 10, label: "10th Semester", phase: "4th Year · Senior Term 1" },
  { num: 11, label: "11th Semester", phase: "4th Year · Senior Term 2" },
  { num: 12, label: "12th Semester", phase: "4th Year · Capstone & Final" },
];

function SemesterCard({ sem, deptId, completedCount, currentCount }) {
  return (
    <button
      onClick={() => navigate(`/study-hub/dept/${deptId}/semester/${sem.num}`)}
      className="group flex items-center gap-4 rounded-md border border-brd bg-surface p-5 text-left shadow-sm transition-colors hover:border-teal-300 dark:hover:border-teal-500/40 hover:bg-teal-50/40 dark:hover:bg-teal-500/10"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-500/15 font-bold text-teal-700 dark:text-teal-300 text-sm border border-teal-200 dark:border-teal-500/30">
        {sem.num}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink group-hover:text-teal-600 dark:group-hover:text-teal-300">
          {sem.label}
        </p>
        <p className="truncate text-xs text-ink-3">{sem.phase}</p>
        <p className="mt-1 truncate text-xs text-ink-2">
          {completedCount > 0
            ? `${completedCount} intake${completedCount === 1 ? "" : "s"} completed${currentCount > 0 ? " · current active" : ""}`
            : currentCount > 0
            ? "Current intake active"
            : "No intakes completed yet"}
        </p>
      </div>
      <Icon name="ArrowRight" size={18} className="text-ink-3 group-hover:text-teal-500 dark:group-hover:text-teal-300 shrink-0" />
    </button>
  );
}

// ============================================================================
// Landing - Student's department study library & 12-semester archive
// ============================================================================
export function StudyHub() {
  const {
    currentUser, studyMembers, studySections, resolveMySection,
    studyCoursesIn, studyPinsIn, deleteStudyPin, removeMember,
    dataLoading, myPendingCreateRequest,
  } = useApp();
  const toast = useToast();
  const [query, setQuery] = React.useState("");
  const [unpinBusy, setUnpinBusy] = React.useState(false);
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  const mine = resolveMySection();
  const studentDept = useStudentDept();

  if (dataLoading && (!studentDept || studySections.length === 0)) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <Loading />
      </AppShell>
    );
  }

  const dept = studentDept;
  if (!dept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <EmptyState
          icon="GraduationCap"
          title="Department not found"
          message="Could not load your department. Please check back later."
        />
      </AppShell>
    );
  }

  if (!mine) {
    const pendingCreate = myPendingCreateRequest();
    const myRow = studyMembers.find((m) => m.userId === currentUser?.id && m.status === "pending");
    if (myRow) return <StudyHubPending dept={dept} />;
    if (pendingCreate) return <StudyHubPending pendingCreate dept={dept} />;
    return <StudyHubSetup dept={dept} />;
  }

  const { section: mySection, deptCode: code, intakeNumber, sectionNumber, myRole } = mine;
  const manager = isCR(myRole);
  const pins = studyPinsIn(mySection.id);
  const courses = studyCoursesIn(mySection.id);
  const myMembership = studyMembers.find(
    (m) => m.sectionId === mySection.id && m.userId === currentUser?.id && m.status === "approved"
  );

  async function unpin(pin) {
    if (unpinBusy) return;
    setUnpinBusy(true);
    try {
      const r = await deleteStudyPin(pin.id);
      if (!r.ok) { toast({ type: "error", title: "Couldn't unpin", message: r.error }); return; }
      toast({ type: "success", title: "Unpinned" });
    } catch {
      toast({ type: "error", title: "Couldn't unpin", message: "Please try again." });
    } finally {
      setUnpinBusy(false);
    }
  }

  async function doLeave() {
    if (leaving || !myMembership) return;
    setLeaving(true);
    try {
      const r = await removeMember(myMembership.id);
      if (!r.ok) { toast({ type: "error", title: "Couldn't leave", message: r.error }); return; }
      toast({ type: "success", title: "Left section" });
      setLeaveOpen(false);
    } finally {
      setLeaving(false);
    }
  }

  const q = query.trim().toLowerCase();
  const filteredCourses = courses.filter(
    (c) => !q || (c.code || "").toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q)
  );

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <PageHeader
        title="Study Hub"
        subtitle={`${code} · Intake ${intakeNumber} · Section ${sectionNumber}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              icon="Users"
              onClick={() => navigate(`/study-hub/intake/${mySection.intakeId}`)}
            >
              Other Sections
            </Button>
            <Button
              variant="secondary"
              icon="GraduationCap"
              onClick={() => navigate(`/study-hub/dept/${dept.id}`)}
            >
              All 12 Semesters
            </Button>
            {myMembership && !manager && (
              <Button variant="secondary" icon="LogOut" onClick={() => setLeaveOpen(true)}>
                Leave
              </Button>
            )}
          </div>
        }
      />

      {/* CR Banner if manager */}
      {manager && <CRBanner section={mySection} sectionNumber={sectionNumber} />}

      {/* Pinned notices (clean and prominent when pins exist; hidden when empty) */}
      {pins.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            <Icon name="Pin" size={14} /> Pinned Notices
          </div>
          <div className="space-y-2">
            {pins.map((p) => (
              <PinRow key={p.id} pin={p} manager={manager} onUnpin={unpin} />
            ))}
          </div>
        </div>
      )}

      {/* Primary View: Own Intake/Section Courses */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">
              Courses <span className="text-xs font-normal text-ink-3">({courses.length})</span>
            </h3>
            <p className="text-xs text-ink-3">
              Section {sectionNumber} curriculum, lecture notes, CT questions & books
            </p>
          </div>
          {courses.length > 2 && (
            <div className="relative w-full sm:max-w-xs">
              <Icon name="Search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses…"
                className="h-10 w-full rounded-md border border-brd bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )}
        </div>

        {courses.length === 0 ? (
          <EmptyState
            icon="BookOpen"
            title="No courses yet"
            message={manager ? "Add your section's courses in Manage section." : "Your CR will add courses here."}
            action={manager ? (
              <Button icon="Plus" onClick={() => navigate(`/study-hub/section/${mySection.id}/manage`)}>
                Add courses
              </Button>
            ) : null}
          />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon="Search"
            title="No matching courses"
            message="Try searching with another course code or name."
          />
        ) : (
          <Card className="divide-y divide-brd overflow-hidden">
            {filteredCourses.map((c) => (
              <CourseRow key={c.id} course={c} sectionId={mySection.id} />
            ))}
          </Card>
        )}
      </div>

      {/* Leave Section Modal */}
      <Modal
        open={leaveOpen} onClose={() => setLeaveOpen(false)} icon="LogOut" tone="red"
        title="Leave this section?"
        description="You'll lose access to this section's materials. You can rejoin later."
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaveOpen(false)} disabled={leaving}>Cancel</Button>
            <Button variant="destructive" loading={leaving} onClick={doLeave}>Leave section</Button>
          </>
        }
      />
    </AppShell>
  );
}

// ============================================================================
// First-run setup — join by code / find section / request new section
// ============================================================================
function StudyHubSetup({ dept: propDept, onClose, isModal }) {
  const { departments, studyIntakesIn, studySectionsIn, requestJoinSection, joinByCode, requestCreateSection } = useApp();
  const toast = useToast();

  const [mode, setMode] = React.useState("join");       // "join" | "create"
  const [joinMode, setJoinMode] = React.useState("code"); // "code" | "find"

  // Join-by-code state
  const [code, setCode] = React.useState("");
  const [codeError, setCodeError] = React.useState("");
  const [codeSaving, setCodeSaving] = React.useState(false);

  // Find-section state
  const [deptId, setDeptId] = React.useState(propDept?.id || "");
  const [intakeId, setIntakeId] = React.useState("");
  const [sectionId, setSectionId] = React.useState("");
  const [findSaving, setFindSaving] = React.useState(false);

  // Create-section state
  const [crDeptId, setCrDeptId] = React.useState(propDept?.id || "");
  const [crIntakeId, setCrIntakeId] = React.useState("");
  const [crNumber, setCrNumber] = React.useState("");
  const [crError, setCrError] = React.useState("");
  const [crSaving, setCrSaving] = React.useState(false);

  // Filter departments if scoped to student's department
  const availableDepts = propDept ? [propDept] : departments;

  // Derived — find
  const activeDeptId = deptId || propDept?.id || availableDepts[0]?.id || "";
  const intakes = activeDeptId ? studyIntakesIn(activeDeptId) : [];
  const activeIntakeId = intakeId && intakes.some((i) => i.id === intakeId) ? intakeId : (intakes[0]?.id || "");
  const sections = activeIntakeId ? studySectionsIn(activeIntakeId) : [];
  const activeSectionId = sectionId && sections.some((s) => s.id === sectionId) ? sectionId : (sections[0]?.id || "");

  // Derived — create
  const crActiveDeptId = crDeptId || propDept?.id || availableDepts[0]?.id || "";
  const crIntakes = crActiveDeptId ? studyIntakesIn(crActiveDeptId) : [];
  const crActiveIntakeId = crIntakeId && crIntakes.some((i) => i.id === crIntakeId) ? crIntakeId : (crIntakes[0]?.id || "");

  async function submitCode(e) {
    if (e) e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6 || trimmed.length > 8) { setCodeError("Enter the 6–8 character code from your CR."); return; }
    if (codeSaving) return;
    setCodeSaving(true); setCodeError("");
    try {
      const r = await joinByCode(trimmed);
      if (!r.ok) { setCodeError(r.error || "Invalid code — check it and try again."); return; }
      toast({ type: "success", title: "Joined!", message: "You're now a member of the section." });
      if (onClose) onClose();
    } finally { setCodeSaving(false); }
  }

  async function submitFind(e) {
    if (e) e.preventDefault();
    if (!activeSectionId || findSaving) return;
    setFindSaving(true);
    try {
      const r = await requestJoinSection(activeSectionId);
      if (!r.ok) { toast({ type: "error", title: "Couldn't send request", message: r.error }); return; }
      toast({ type: "success", title: "Request sent", message: "Your CR will approve you shortly." });
      if (onClose) onClose();
    } finally { setFindSaving(false); }
  }

  async function submitCreate(e) {
    if (e) e.preventDefault();
    const num = parseInt(crNumber, 10);
    const crIntakeNumber = crIntakes.find((i) => i.id === crActiveIntakeId)?.number;
    if (!crActiveIntakeId || !crIntakeNumber) { setCrError("Select an intake."); return; }
    if (!num || num < 1 || num > 99) { setCrError("Enter a valid section number (1–99)."); return; }
    if (crSaving) return;
    setCrSaving(true); setCrError("");
    try {
      const r = await requestCreateSection(crActiveDeptId, crIntakeNumber, num);
      if (!r.ok) { setCrError(r.error || "Couldn't send request."); return; }
      toast({ type: "success", title: "Request sent", message: "Admin will review and create your section." });
      if (onClose) onClose();
    } finally { setCrSaving(false); }
  }

  const formBody = (
    <div>
      {!isModal && (
        <div className="mb-6 flex items-start gap-4">
          <AccentTile icon="BookMarked" tone={ACCENT} size={48} />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-ink">Get started</h3>
            <p className="mt-1 text-base text-ink-3">Join your class section to share notes, questions, and books — or request a new section if yours hasn't been created yet.</p>
          </div>
        </div>
      )}

      <SegmentToggle
        options={[{ value: "join", label: "Join a section", icon: "LogIn" }, { value: "create", label: "Request new section", icon: "Plus" }]}
        value={mode}
        onChange={(v) => { setMode(v); setCodeError(""); setCrError(""); }}
      />

      {mode === "join" && (
        <div className="mt-5 space-y-5">
          <SegmentToggle
            options={[{ value: "code", label: "I have a code", icon: "Hash" }, { value: "find", label: "Find my section", icon: "Search" }]}
            value={joinMode}
            onChange={(v) => { setJoinMode(v); setCodeError(""); }}
          />

          {joinMode === "code" && (
            <form onSubmit={submitCode} className="space-y-4">
              <Field label="Join code" htmlFor="su-code" error={codeError} hint="6–8 character code from your CR.">
                <Input
                  id="su-code" value={code} error={!!codeError} maxLength={8}
                  onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setCodeError(""); }}
                  placeholder="e.g. A3B7C2"
                  className="tracking-widest font-mono text-center text-2xl"
                />
              </Field>
              <div className="flex justify-end gap-2">
                {onClose && <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>}
                <Button type="submit" icon="LogIn" disabled={codeSaving || code.length < 6}>
                  {codeSaving ? <Spinner size={16} /> : "Join now"}
                </Button>
              </div>
            </form>
          )}

          {joinMode === "find" && (
            <form onSubmit={submitFind} className="space-y-4">
              {!propDept && (
                <Field label="Department" htmlFor="su-dept">
                  <Select id="su-dept" value={activeDeptId} onChange={(e) => { setDeptId(e.target.value); setIntakeId(""); setSectionId(""); }}>
                    {availableDepts.map((d) => <option key={d.id} value={d.id}>{shortDept(d.name)}</option>)}
                  </Select>
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Intake" htmlFor="su-intake">
                  <Select id="su-intake" value={activeIntakeId} onChange={(e) => { setIntakeId(e.target.value); setSectionId(""); }} disabled={!intakes.length}>
                    {intakes.length ? intakes.map((i) => <option key={i.id} value={i.id}>Intake {i.number}</option>) : <option value="">No intakes</option>}
                  </Select>
                </Field>
                <Field label="Section" htmlFor="su-section">
                  <Select id="su-section" value={activeSectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!sections.length}>
                    {sections.length ? sections.map((s) => <option key={s.id} value={s.id}>Section {s.number}</option>) : <option value="">No sections</option>}
                  </Select>
                </Field>
              </div>
              {!sections.length && (
                <p className="text-xs text-ink-3">No sections here yet — switch to "Request new section" to create yours.</p>
              )}
              <div className="flex items-center justify-between gap-3 pt-1">
                {onClose ? (
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                ) : (
                  <button type="button" onClick={() => navigate("/study-hub")} className="text-base font-semibold text-ink-3 hover:text-ink-2">Back to Study Hub</button>
                )}
                <Button type="submit" icon="Send" disabled={findSaving || !activeSectionId}>
                  {findSaving ? <Spinner size={16} /> : "Request to join"}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {mode === "create" && (
        <form onSubmit={submitCreate} className="mt-5 space-y-4">
          <p className="text-xs text-ink-3">Tell us your intake and the section number you want. Admin will review and set you as Class Representative.</p>
          {!propDept && (
            <Field label="Department" htmlFor="cr-dept">
              <Select id="cr-dept" value={crActiveDeptId} onChange={(e) => { setCrDeptId(e.target.value); setCrIntakeId(""); }}>
                {availableDepts.map((d) => <option key={d.id} value={d.id}>{shortDept(d.name)}</option>)}
              </Select>
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Intake" htmlFor="cr-intake">
              <Select id="cr-intake" value={crActiveIntakeId} onChange={(e) => setCrIntakeId(e.target.value)} disabled={!crIntakes.length}>
                {crIntakes.length ? crIntakes.map((i) => <option key={i.id} value={i.id}>Intake {i.number}</option>) : <option value="">No intakes</option>}
              </Select>
            </Field>
            <Field label="Section number" htmlFor="cr-num" error={crError}>
              <Input id="cr-num" type="number" min={1} max={99} value={crNumber} error={!!crError}
                onChange={(e) => { setCrNumber(e.target.value); setCrError(""); }} placeholder="e.g. 3" />
            </Field>
          </div>
          {crError && <p className="text-xs text-danger">{crError}</p>}
          <div className="flex justify-end gap-2 pt-1">
            {onClose && <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>}
            <Button type="submit" icon="Send" disabled={crSaving}>
              {crSaving ? <Spinner size={16} /> : "Request to create"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  if (isModal) return formBody;

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <div className="mx-auto max-w-lg">
        <PageHeader title="Study Hub" />
        <Card className="p-6">
          {formBody}
        </Card>
      </div>
    </AppShell>
  );
}

// --- Pending: awaiting CR approval (join) or admin approval (section creation) ---
function StudyHubPending({ pendingCreate }) {
  const { currentUser, studyMembers, studySectionById } = useApp();
  if (pendingCreate) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <div className="mx-auto max-w-lg">
          <PageHeader title="Study Hub" />
          <EmptyState
            icon="Clock"
            title="Section creation request pending"
            message="Admin is reviewing your request to create a new section. You'll become the Class Representative once it's approved."
            action={<Button variant="secondary" icon="LayoutGrid" onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>}
          />
        </div>
      </AppShell>
    );
  }
  const row = studyMembers.find((m) => m.userId === currentUser?.id && m.status === "pending");
  const section = row && studySectionById(row.sectionId);
  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <div className="mx-auto max-w-lg">
        <PageHeader title="Study Hub" />
        <EmptyState
          icon="Clock"
          title="Request pending"
          message={section ? `You've asked to join Section ${section.number}. Your CR will approve it soon — you'll get access then.` : "Your request to join is awaiting CR approval."}
          action={<Button variant="secondary" icon="LayoutGrid" onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>}
        />
      </div>
    </AppShell>
  );
}

// ============================================================================
// Browse — department picker
// ============================================================================
function DepartmentCard({ dept, count }) {
  return (
    <button
      onClick={() => navigate(`/study-hub/dept/${dept.id}`)}
      className="group flex items-center gap-4 rounded-md border border-brd bg-surface p-5 text-left shadow-sm transition-colors hover:border-teal-300 dark:hover:border-teal-500/40 hover:bg-teal-50/40 dark:hover:bg-teal-500/10"
    >
      <AccentTile icon={BRANCH_ICON[dept.branch] || "GraduationCap"} tone={ACCENT} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{shortDept(dept.name)}</p>
        <p className="mt-0.5 truncate text-xs text-ink-3">12 Semesters · {count} intake{count === 1 ? "" : "s"}</p>
      </div>
      <Icon name="ArrowRight" size={18} className="text-ink-3 group-hover:text-teal-500 dark:group-hover:text-teal-300" />
    </button>
  );
}

export function StudyHubBrowse() {
  const { currentUser, departments, studyIntakesIn, dataLoading } = useApp();
  const studentDept = useStudentDept();
  const isStudent = !currentUser?.role || currentUser.role.toLowerCase() === "student";

  // If a student navigates to /study-hub/browse, guide them to their own department
  if (isStudent && studentDept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <div className="mx-auto max-w-lg pt-6">
          <PageHeader title="Study Hub" subtitle="Department Scoped" />
          <Card className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <AccentTile icon="GraduationCap" tone={ACCENT} size={52} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">{shortDept(studentDept.name)}</h3>
              <p className="mt-1 text-xs text-ink-3">
                Study Hub is scoped by department. As an enrolled student of {shortDept(studentDept.name)}, you have access to all 12 academic semesters, intakes, and section materials in your department.
              </p>
            </div>
            <div className="pt-2">
              <Button icon="ArrowRight" onClick={() => navigate("/study-hub")}>
                Open {deptCode(studentDept.name)} Study Hub
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  const byBranch = {};
  departments.forEach((d) => { (byBranch[d.branch] ||= []).push(d); });
  const order = [...BRANCH_ORDER, ...Object.keys(byBranch).filter((b) => !BRANCH_ORDER.includes(b))];
  const branches = order.filter((b) => byBranch[b]).map((b) => ({ branch: b, depts: byBranch[b] }));

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <button onClick={() => navigate("/study-hub")} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
        <Icon name="ArrowLeft" size={16} /> Study Hub
      </button>
      <PageHeader title="Browse departments" subtitle="Pick a department to open its intakes and sections." />
      {dataLoading && departments.length === 0 ? (
        <Loading />
      ) : branches.length === 0 ? (
        <EmptyState icon="GraduationCap" title="No departments yet" message="Departments will appear here once they're set up." />
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {branches.map(({ branch, depts }) => (
            <section key={branch}>
              <h3 className="mb-2 text-base font-semibold text-ink">{branch}</h3>
              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {depts.map((d) => <DepartmentCard key={d.id} dept={d} count={studyIntakesIn(d.id).length} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// Level 2: Department -> Semesters (1 to 12)
export function StudyHubDept({ deptId }) {
  const { currentUser, departments, studyIntakesIn, dataLoading } = useApp();
  const dept = departments.find((d) => d.id === deptId);
  const studentDept = useStudentDept();
  const isStudent = !currentUser?.role || currentUser.role.toLowerCase() === "student";

  if (!dept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        {dataLoading ? <Loading /> : (
          <EmptyState icon="GraduationCap" title="Department not found" message="This department may have changed."
            action={<Button onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>} />
        )}
      </AppShell>
    );
  }

  // Cross-department access guard for students
  if (isStudent && studentDept && dept.id !== studentDept.id) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-3">
          <button onClick={() => navigate("/study-hub")} className="hover:text-ink">Study Hub</button>
          <span>/</span>
          <span className="font-semibold text-ink">{deptCode(dept.name)}</span>
        </div>
        <EmptyState
          icon="Lock"
          title="Department Restricted"
          message={`Study Hub is scoped to your enrolled department (${shortDept(studentDept.name)}). Students cannot access study materials from other departments.`}
          action={<Button icon="ArrowLeft" onClick={() => navigate("/study-hub")}>Go to {deptCode(studentDept.name)} Study Hub</Button>}
        />
      </AppShell>
    );
  }

  const intakes = studyIntakesIn(dept.id);
  const maxIntake = intakes.length > 0 ? Math.max(...intakes.map((i) => i.number)) : 54;

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-3">
        <button onClick={() => navigate("/study-hub")} className="hover:text-ink">Study Hub</button>
        <span>/</span>
        <span className="font-semibold text-ink">{deptCode(dept.name)}</span>
      </div>
      <button onClick={() => navigate("/study-hub")} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
        <Icon name="ArrowLeft" size={16} /> Study Hub
      </button>
      <PageHeader
        title={shortDept(dept.name)}
        subtitle="Select an academic semester (1–12) to view completed intakes, sections, and study materials."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SEMESTER_INFO.map((sem) => {
          const completed = intakes.filter((i) => Math.max(1, (maxIntake - i.number) + 1) > sem.num);
          const current = intakes.filter((i) => Math.max(1, (maxIntake - i.number) + 1) === sem.num);
          return (
            <SemesterCard
              key={sem.num}
              sem={sem}
              deptId={dept.id}
              completedCount={completed.length}
              currentCount={current.length}
            />
          );
        })}
      </div>
    </AppShell>
  );
}

// Level 3: Semester -> Intakes completed that semester
export function StudyHubSemester({ deptId, semesterNum }) {
  const { currentUser, departments, studyIntakesIn, studySectionsIn, dataLoading } = useApp();
  const dept = departments.find((d) => d.id === deptId);
  const studentDept = useStudentDept();
  const isStudent = !currentUser?.role || currentUser.role.toLowerCase() === "student";
  const semNum = Number(semesterNum) || 1;
  const semMeta = SEMESTER_INFO.find((s) => s.num === semNum) || { num: semNum, label: `Semester ${semNum}`, phase: "" };

  if (!dept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        {dataLoading ? <Loading /> : (
          <EmptyState icon="GraduationCap" title="Department not found" message="This department may have changed."
            action={<Button onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>} />
        )}
      </AppShell>
    );
  }

  // Cross-department access guard for students
  if (isStudent && studentDept && dept.id !== studentDept.id) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-3">
          <button onClick={() => navigate("/study-hub")} className="hover:text-ink">Study Hub</button>
          <span>/</span>
          <span className="font-semibold text-ink">{deptCode(dept.name)}</span>
        </div>
        <EmptyState
          icon="Lock"
          title="Department Restricted"
          message={`Study Hub is scoped to your enrolled department (${shortDept(studentDept.name)}). Students cannot access study materials from other departments.`}
          action={<Button icon="ArrowLeft" onClick={() => navigate("/study-hub")}>Go to {deptCode(studentDept.name)} Study Hub</Button>}
        />
      </AppShell>
    );
  }

  const intakes = studyIntakesIn(dept.id);
  const maxIntake = intakes.length > 0 ? Math.max(...intakes.map((i) => i.number)) : 54;

  const enrichedIntakes = intakes.map((i) => {
    const currentSem = Math.max(1, (maxIntake - i.number) + 1);
    const isCompleted = currentSem > semNum;
    const isCurrent = currentSem === semNum;
    const isGraduated = currentSem > 12;
    return {
      intake: i,
      currentSem,
      isCompleted,
      isCurrent,
      isGraduated,
      sectionsCount: studySectionsIn(i.id).length,
    };
  });

  const visibleIntakes = enrichedIntakes
    .filter((x) => x.isCompleted || x.isCurrent)
    .sort((a, b) => b.intake.number - a.intake.number);

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-3">
        <button onClick={() => navigate("/study-hub")} className="hover:text-ink">Study Hub</button>
        <span>/</span>
        <button onClick={() => navigate(`/study-hub/dept/${dept.id}`)} className="hover:text-ink">{deptCode(dept.name)}</button>
        <span>/</span>
        <span className="font-semibold text-ink">Semester {semNum}</span>
      </div>
      <button onClick={() => navigate(`/study-hub/dept/${dept.id}`)} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
        <Icon name="ArrowLeft" size={16} /> All Semesters ({deptCode(dept.name)})
      </button>
      <PageHeader
        title={`${semMeta.label} · ${shortDept(dept.name)}`}
        subtitle={`Intakes that completed or are currently in Semester ${semNum}. Pick an intake to see its sections.`}
      />
      {visibleIntakes.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No intakes for this semester yet"
          message={`No senior or current intakes have completed or reached Semester ${semNum} in ${shortDept(dept.name)} yet.`}
          action={<Button variant="secondary" onClick={() => navigate(`/study-hub/dept/${dept.id}`)}>View other semesters</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleIntakes.map(({ intake, currentSem, isCompleted, isCurrent, isGraduated, sectionsCount }) => (
            <button
              key={intake.id}
              onClick={() => navigate(`/study-hub/dept/${dept.id}/semester/${semNum}/intake/${intake.id}`)}
              className="group flex items-center gap-4 rounded-md border border-brd bg-surface p-5 text-left shadow-sm transition-colors hover:border-teal-300 dark:hover:border-teal-500/40 hover:bg-teal-50/40 dark:hover:bg-teal-500/10"
            >
              <AccentTile icon="Users" tone={ACCENT} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="truncate text-base font-semibold text-ink">Intake {intake.number}</p>
                  {isGraduated && (
                    <span className="rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-[10px] font-semibold">
                      Graduated
                    </span>
                  )}
                  {isCompleted && !isGraduated && (
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold">
                      Completed · Now Sem {currentSem}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 px-2 py-0.5 text-[10px] font-semibold">
                      Current Intake
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  {intake.years ? `${intake.years} · ` : ""}{sectionsCount} section{sectionsCount === 1 ? "" : "s"}
                </p>
              </div>
              <Icon name="ArrowRight" size={18} className="text-ink-3 group-hover:text-teal-500 dark:group-hover:text-teal-300 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// Sections + Books — one intake (tabbed)
// ============================================================================
// Open browse: every section in the department is viewable. Your own section's
// roster is RLS-visible (so we can show the CR's name); others show only the
// roster-independent hasCR signal. Content (material count) loads for the whole
// department, so the count is always meaningful.
function SectionCard({ section }) {
  const { studyPersonName, studySectionFileCount } = useApp();
  const crName = section.crIds[0] ? studyPersonName(section.crIds[0]) : null;
  const materials = studySectionFileCount(section);
  const subtitle = crName ? `CR: ${crName}` : section.hasCR ? null : "No CR yet";
  const open = () => navigate(`/study-hub/section/${section.id}`);
  return (
    <div className={`flex flex-col rounded-md border bg-surface p-5 shadow-sm ${section.isMine ? "border-teal-300 dark:border-teal-500/40" : "border-brd"}`}>
      <div className="flex items-start gap-3">
        <AccentTile icon="Users" tone={ACCENT} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate text-base font-semibold text-ink">Section {section.number}</p>
            {section.isMine && <span className="rounded-full bg-teal-50 dark:bg-teal-500/15 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300">You</span>}
            {!section.isPublic && <span className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold text-ink-3"><Icon name="Lock" size={9} /> Private</span>}
          </div>
          {subtitle && <p className="mt-0.5 truncate text-xs text-ink-3">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-brd pt-3">
        <span className="text-xs text-ink-3">{materials} material{materials === 1 ? "" : "s"}</span>
        {section.isMine
          ? <Button size="sm" iconRight="ArrowRight" onClick={open}>Open</Button>
          : <Button size="sm" variant="secondary" iconRight="ArrowRight" onClick={open}>Browse</Button>}
      </div>
    </div>
  );
}

function BookRow({ book, isManager, onDelete, saved, onToggleSave }) {
  const { studyPersonName, currentUser } = useApp();
  const canDelete = isManager || book.byId === currentUser?.id; // RLS: own add or CR
  return (
    <div className="flex items-center gap-3 p-4">
      <AccentTile icon={BOOK_KIND_ICON[book.kind] || "BookOpen"} tone={ACCENT} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{book.title}</p>
        <p className="truncate text-xs text-ink-3">{book.kind}{book.author ? ` · ${book.author}` : ""}{book.edition ? ` · ${book.edition}` : ""}</p>
        <p className="truncate text-xs text-ink-3">{studyPersonName(book.byId)} · {relativeDate(book.createdAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onToggleSave && <BookmarkIcon saved={saved} onClick={() => onToggleSave(book)} />}
        {canDelete && <DeleteIcon onClick={() => onDelete(book)} title="Remove book" />}
        {book.url
          ? <a href={book.url} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-brd bg-surface px-3 text-base font-semibold text-ink-2 shadow-sm hover:bg-surface-2"><Icon name="ExternalLink" size={15} /> Open link</a>
          : <DownloadButton path={book.path} name={book.title} />}
      </div>
    </div>
  );
}

function DeleteIcon({ onClick, title }) {
  return (
    <button onClick={onClick} title={title} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-3 hover:bg-danger-bg hover:text-danger">
      <Icon name="Trash2" size={16} />
    </button>
  );
}

// Bookmark toggle shown on every file/paper/book row (study_bookmarks).
function BookmarkIcon({ saved, onClick }) {
  return (
    <button onClick={onClick} title={saved ? "Remove bookmark" : "Bookmark"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2 ${saved ? "text-warn" : "text-ink-3 hover:text-ink-2"}`}>
      <Icon name="Bookmark" size={16} className={saved ? "fill-amber-400" : ""} />
    </button>
  );
}

function AddBookModal({ open, onClose, courseId, courseCode }) {
  const { addStudyBook } = useApp();
  const toast = useToast();
  const [form, setForm] = React.useState({ title: "", kind: "Textbook", author: "", url: "", file: null });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  function reset() { setForm({ title: "", kind: "Textbook", author: "", url: "", file: null }); setErrors({}); }
  React.useEffect(() => { if (!open) reset(); }, [open]);
  async function submit(e) {
    if (e) e.preventDefault();
    if (saving) return;
    const er = {};
    if (!form.title.trim()) er.title = "Enter a title.";
    if (!form.file && !form.url.trim()) er.url = "Attach a file or add a link.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const r = await addStudyBook(courseId, { title: form.title, kind: form.kind, author: form.author, courseCode, url: form.url, file: form.file });
      if (!r.ok) { toast({ type: "error", title: "Couldn't add book", message: r.error }); return; }
      toast({ type: "success", title: "Book added", message: form.title.trim() });
      reset(); onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open} onClose={onClose} icon="BookPlus" tone="blue" title="Add a book"
      description={courseCode ? `Added to ${courseCode}.` : ""}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon="Plus" onClick={() => submit()} disabled={saving}>Add book</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title" htmlFor="ab-title" required error={errors.title}>
          <Input id="ab-title" value={form.title} error={!!errors.title} onChange={set("title")} placeholder="e.g. Introduction to Algorithms" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type" htmlFor="ab-kind">
            <Select id="ab-kind" value={form.kind} onChange={set("kind")}>{BOOK_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</Select>
          </Field>
          <Field label="Author" htmlFor="ab-author" hint="Optional"><Input id="ab-author" value={form.author} onChange={set("author")} placeholder="e.g. Cormen et al." /></Field>
        </div>
        <Field label="File" hint="Optional — attach a PDF, or leave empty to add a link below.">
          <DocField file={form.file} onChange={(f) => setForm((x) => ({ ...x, file: f }))} />
        </Field>
        <Field label="Link" htmlFor="ab-url" error={errors.url} hint="External URL if there's no file.">
          <Input id="ab-url" value={form.url} error={!!errors.url} onChange={set("url")} placeholder="https://…" />
        </Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

function BooksTab({ books, canAdd, isManager, onAdd, onDelete, saved, onToggleSave }) {
  if (books.length === 0) {
    return (
      <EmptyState
        icon="Library"
        title="No books yet"
        message={canAdd ? "Add textbooks, references, or the syllabus." : "No books have been shared yet."}
        action={canAdd ? <Button icon="Plus" onClick={onAdd}>Add book</Button> : null}
      />
    );
  }
  return (
    <Card className="divide-y divide-brd overflow-hidden">
      {books.map((b) => (
        <BookRow
          key={b.id}
          book={b}
          isManager={isManager}
          onDelete={onDelete}
          saved={saved?.has(b.id)}
          onToggleSave={onToggleSave && (() => onToggleSave("book", b))}
        />
      ))}
    </Card>
  );
}

// Level 4: Intake -> Sections (if created)
export function StudyHubIntake({ intakeId, deptId: propDeptId, semesterNum }) {
  const { currentUser, studyIntakes, departments, studySectionsIn, dataLoading } = useApp();
  const studentDept = useStudentDept();
  const isStudent = !currentUser?.role || currentUser.role.toLowerCase() === "student";

  const intake = studyIntakes.find((i) => i.id === intakeId);
  const dept = intake && departments.find((d) => d.id === (propDeptId || intake.deptId));
  const semNum = semesterNum ? Number(semesterNum) : null;

  if (!intake || !dept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        {dataLoading ? <Loading /> : (
          <EmptyState icon="Users" title="Intake not found" message="This intake may have changed."
            action={<Button onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>} />
        )}
      </AppShell>
    );
  }

  // Cross-department access guard for students
  if (isStudent && studentDept && dept.id !== studentDept.id) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-3">
          <button onClick={() => navigate("/study-hub")} className="hover:text-ink">Study Hub</button>
          <span>/</span>
          <span className="font-semibold text-ink">{deptCode(dept.name)}</span>
        </div>
        <EmptyState
          icon="Lock"
          title="Department Restricted"
          message={`Study Hub is scoped to your enrolled department (${shortDept(studentDept.name)}). Students cannot access study materials from other departments.`}
          action={<Button icon="ArrowLeft" onClick={() => navigate("/study-hub")}>Go to {deptCode(studentDept.name)} Study Hub</Button>}
        />
      </AppShell>
    );
  }

  const sections = studySectionsIn(intake.id);
  const backTarget = semNum
    ? `/study-hub/dept/${dept.id}/semester/${semNum}`
    : `/study-hub/dept/${dept.id}`;

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <div className="mb-3 flex items-center gap-1.5 text-xs text-ink-3">
        <button onClick={() => navigate("/study-hub")} className="hover:text-ink">Study Hub</button>
        <span>/</span>
        <button onClick={() => navigate(`/study-hub/dept/${dept.id}`)} className="hover:text-ink">{deptCode(dept.name)}</button>
        {semNum && (
          <>
            <span>/</span>
            <button onClick={() => navigate(`/study-hub/dept/${dept.id}/semester/${semNum}`)} className="hover:text-ink">Semester {semNum}</button>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-ink">Intake {intake.number}</span>
      </div>
      <button onClick={() => navigate(backTarget)} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
        <Icon name="ArrowLeft" size={16} /> {semNum ? `Semester ${semNum} Intakes` : deptCode(dept.name)}
      </button>
      <PageHeader
        title={`Intake ${intake.number} · Sections`}
        subtitle={`${shortDept(dept.name)}${semNum ? ` · Semester ${semNum}` : ""} — browse section study rooms`}
      />

      {sections.length === 0 ? (
        <EmptyState
          icon="Users"
          title="No sections created yet"
          message={`Section rooms for Intake ${intake.number} haven't been created on Study Hub yet.`}
          action={<Button variant="secondary" onClick={() => navigate("/study-hub")}>Request section creation</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((s) => <SectionCard key={s.id} section={s} />)}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// Section home — pinned notices / subjects (courses)
// ============================================================================
function PinModal({ open, onClose, sectionId }) {
  const { addStudyPin } = useApp();
  const toast = useToast();
  const [kind, setKind] = React.useState("text");
  const [message, setMessage] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (!open) { setMessage(""); setFile(null); setKind("text"); setError(""); } }, [open]);
  async function submit() {
    if (saving) return;
    if (!message.trim()) { setError("Enter a message."); return; }
    if (kind === "file" && !file) { setError("Choose a file."); return; }
    setSaving(true);
    try {
      const r = await addStudyPin(sectionId, { kind, message, file });
      if (!r.ok) { toast({ type: "error", title: "Couldn't pin", message: r.error }); return; }
      toast({ type: "success", title: "Pinned" });
      setMessage(""); setFile(null); setKind("text"); setError(""); onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open} onClose={onClose} icon="Pin" tone="blue" title="Pin to your section"
      description="Pinned items show at the top for everyone in your section."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon="Pin" onClick={submit} disabled={saving}>Pin</Button></>}
    >
      <div className="space-y-4">
        <SegmentToggle options={[{ value: "text", label: "Text note", icon: "Type" }, { value: "file", label: "File", icon: "Paperclip" }]} value={kind} onChange={(v) => { setKind(v); setError(""); }} />
        <Field label="Message" error={error}>
          <Textarea rows={3} value={message} onChange={(e) => { setMessage(e.target.value); setError(""); }} placeholder="e.g. Final exam covers chapters 1–8." />
        </Field>
        {kind === "file" && (
          <Field label="File"><DocField file={file} onChange={(f) => { setFile(f); setError(""); }} /></Field>
        )}
      </div>
    </Modal>
  );
}

function AddCourseModal({ open, onClose, sectionId }) {
  const { addStudyCourse } = useApp();
  const toast = useToast();
  const [form, setForm] = React.useState({ code: "", name: "" });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (!open) { setForm({ code: "", name: "" }); setErrors({}); } }, [open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  async function submit(e) {
    if (e) e.preventDefault();
    if (saving) return;
    const er = {};
    if (!form.code.trim()) er.code = "Enter a course code.";
    if (!form.name.trim()) er.name = "Enter a course name.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const r = await addStudyCourse(sectionId, { code: form.code, name: form.name });
      if (!r.ok) { toast({ type: "error", title: "Couldn't add course", message: r.error }); return; }
      toast({ type: "success", title: "Course added", message: `${form.code.trim()} — ${form.name.trim()}` });
      setForm({ code: "", name: "" }); setErrors({}); onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open} onClose={onClose} icon="BookPlus" tone="blue" title="Add a course"
      description="Add a course so classmates can upload its materials."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon="Plus" onClick={() => submit()} disabled={saving}>Add course</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Course code" htmlFor="ac-code" required error={errors.code}><Input id="ac-code" value={form.code} error={!!errors.code} onChange={set("code")} placeholder="e.g. CSE 318" /></Field>
        <Field label="Course name" htmlFor="ac-name" required error={errors.name}><Input id="ac-name" value={form.name} error={!!errors.name} onChange={set("name")} placeholder="e.g. System Analysis & Design" /></Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

function UploadQBModal({ open, onClose, courseId }) {
  const { uploadStudyQB } = useApp();
  const toast = useToast();
  const [form, setForm] = React.useState({ exam: "CT 1", title: "", file: null });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (!open) { setForm({ exam: "CT 1", title: "", file: null }); setErrors({}); } }, [open]);
  async function submit(e) {
    if (e) e.preventDefault();
    if (saving) return;
    const er = {};
    if (!form.title.trim()) er.title = "Enter a title.";
    if (!form.file) er.file = "Choose a file.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const r = await uploadStudyQB(courseId, { exam: form.exam, title: form.title, file: form.file });
      if (!r.ok) { toast({ type: "error", title: "Upload failed", message: r.error }); return; }
      toast({ type: "success", title: "Uploaded", message: form.title.trim() });
      setForm({ exam: "CT 1", title: "", file: null }); setErrors({}); onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open} onClose={onClose} icon="Upload" tone="blue" title="Upload a question paper"
      description="Add a past CT, midterm, or final to the question bank."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon="Upload" onClick={() => submit()} disabled={saving}>Upload</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Exam" htmlFor="qb-exam"><Select id="qb-exam" value={form.exam} onChange={(e) => setForm((f) => ({ ...f, exam: e.target.value }))}>{QB_EXAMS.map((x) => <option key={x} value={x}>{x}</option>)}</Select></Field>
        <Field label="Title" htmlFor="qb-title" required error={errors.title}><Input id="qb-title" value={form.title} error={!!errors.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. CSE 318 — CT1 2024" /></Field>
        <Field label="File" required error={errors.file}><DocField file={form.file} onChange={(f) => setForm((x) => ({ ...x, file: f }))} /></Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

function PinRow({ pin, manager, onUnpin }) {
  const { studyPersonName } = useApp();
  return (
    <div className="flex items-start gap-3 p-4">
      <AccentTile icon={pin.kind === "file" ? "Paperclip" : "Pin"} tone={ACCENT} size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-ink">{pin.message}</p>
        {pin.kind === "file" && pin.fileName && (
          <div className="mt-1.5"><DownloadButton path={pin.path} name={pin.fileName} /></div>
        )}
        <p className="mt-1 text-xs text-ink-3">{studyPersonName(pin.byId)} · {relativeDate(pin.createdAt)}</p>
      </div>
      {manager && (
        <button onClick={() => onUnpin(pin)} title="Unpin" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2 hover:text-ink-2"><Icon name="X" size={16} /></button>
      )}
    </div>
  );
}

function PinnedTab({ pins, manager, onPin, onUnpin }) {
  // Pins are CR-only (RLS): gate on manager, not canEdit.
  return (
    <div>
      {manager && <div className="mb-4 flex justify-end"><Button icon="Pin" onClick={onPin}>Add a pin</Button></div>}
      {pins.length === 0 ? (
        <EmptyState icon="Pin" title="Nothing pinned" message={manager ? "Pin a note or file to surface it for your section." : "Your CR hasn't pinned anything yet."} />
      ) : (
        <Card className="divide-y divide-brd overflow-hidden">
          {pins.map((p) => <PinRow key={p.id} pin={p} manager={manager} onUnpin={onUnpin} />)}
        </Card>
      )}
    </div>
  );
}

function CoursesTab({ section, courses, canEdit, manager, onAddCourse, onDeleteCourse }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const filtered = courses.filter((c) =>
    !q || (c.code || "").toLowerCase().includes(q) || (c.name || "").toLowerCase().includes(q)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-ink">
          Courses <span className="text-xs font-normal text-ink-3">({courses.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          {courses.length > 2 && (
            <div className="relative w-full sm:w-64">
              <Icon name="Search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses…"
                className="h-10 w-full rounded-md border border-brd bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )}
          {canEdit && <Button icon="Plus" onClick={onAddCourse}>Add course</Button>}
        </div>
      </div>
      {courses.length === 0 ? (
        <EmptyState
          icon="BookOpen"
          title="No courses yet"
          message={canEdit ? "Add a course so classmates can upload its materials." : "No courses have been added to this section yet."}
          action={canEdit ? <Button icon="Plus" onClick={onAddCourse}>Add course</Button> : null}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="Search" title="No matching courses" message="Try another search term." />
      ) : (
        <Card className="divide-y divide-brd overflow-hidden">
          {filtered.map((c) => <CourseRow key={c.id} course={c} sectionId={section.id} onDelete={manager ? onDeleteCourse : undefined} />)}
        </Card>
      )}
    </div>
  );
}

function QBPaperRow({ paper, isManager, onVerify, onDelete, saved, onToggleSave }) {
  const { studyPersonName, currentUser } = useApp();
  const canDelete = isManager || paper.byId === currentUser?.id; // RLS: own upload or CR
  return (
    <div className="flex items-center gap-3 p-4">
      <AccentTile icon={fileIcon(paper.kind)} tone={ACCENT} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-semibold text-ink">{paper.title}</p>
          {paper.verified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success"><Icon name="BadgeCheck" size={11} /> Verified</span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-3">{studyPersonName(paper.byId)} · {relativeDate(paper.createdAt)} · {fmtFileSize(paper.sizeMB)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onToggleSave && <BookmarkIcon saved={saved} onClick={() => onToggleSave(paper)} />}
        {isManager && (
          <button onClick={() => onVerify(paper)} title={paper.verified ? "Unverify" : "Mark verified"} className={`inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-2 ${paper.verified ? "text-success" : "text-ink-3"}`}><Icon name="BadgeCheck" size={16} /></button>
        )}
        {canDelete && <DeleteIcon onClick={() => onDelete(paper)} title="Remove paper" />}
        <DownloadButton path={paper.path} name={paper.title} />
      </div>
    </div>
  );
}

function QuestionBankTab({ qb, canEdit, isManager, onUpload, onVerify, onDelete, saved, onToggleSave }) {
  if (qb.length === 0) {
    return (
      <EmptyState
        icon="FileQuestion"
        title="No question papers yet"
        message={canEdit ? "Upload a past paper to start the bank." : "Nothing has been uploaded yet."}
        action={canEdit ? <Button icon="Upload" onClick={onUpload}>Upload</Button> : null}
      />
    );
  }
  return (
    <Card className="divide-y divide-brd overflow-hidden">
      {qb.map((q) => (
        <QBPaperRow
          key={q.id}
          paper={q}
          isManager={isManager}
          onVerify={onVerify}
          onDelete={onDelete}
          saved={saved?.has(q.id)}
          onToggleSave={onToggleSave && (() => onToggleSave("question", q))}
        />
      ))}
    </Card>
  );
}

export function StudyHubSection({ sectionId }) {
  const {
    currentUser, studyMembers, departments, studyIntakes, studySectionById, resolveMySection,
    studyPinsIn, studyCoursesIn, deleteStudyPin, deleteStudyCourse, removeMember, dataLoading,
  } = useApp();
  const toast = useToast();
  const [tab, setTab] = React.useState("Courses");
  const [pinOpen, setPinOpen] = React.useState(false);
  const [courseOpen, setCourseOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null); // { item } — subject (course) delete
  const [confirmBusy, setConfirmBusy] = React.useState(false);
  const [unpinBusy, setUnpinBusy] = React.useState(false);
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  const section = studySectionById(sectionId);
  const intake = section && studyIntakes.find((i) => i.id === section.intakeId);
  const dept = intake && departments.find((d) => d.id === intake.deptId);

  if (!section || !intake || !dept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        {dataLoading ? <Loading /> : (
          <EmptyState icon="Users" title="Section not found" message="This section may have changed."
            action={<Button onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>} />
        )}
      </AppShell>
    );
  }

  const mine = resolveMySection();
  const myDeptId = mine?.section?.deptId;
  const myIntakeId = mine?.section?.intakeId;
  const sectionIntake = studyIntakes.find((i) => i.id === section.intakeId);
  const myRole = section.isMine ? (mine?.myRole || "member") : "viewer";
  const canView =
    section.isMine ||
    (section.isPublic && section.intakeId === myIntakeId) ||
    (section.isPublic && sectionIntake?.isPublic && myDeptId != null && section.deptId === myDeptId);
  const canAddCourse = section.isMine && canContribute(myRole);
  const manager = section.isMine && isCR(myRole);
  // The membership row for THIS section — not resolveMySection()'s, which is
  // only the user's first approved membership and would delete the wrong row
  // for anyone approved in more than one section.
  const myMembership = studyMembers.find(
    (m) => m.sectionId === section.id && m.userId === currentUser?.id && m.status === "approved"
  );
  const back = () => navigate(section.isMine ? "/study-hub" : `/study-hub/intake/${section.intakeId}`);

  if (!canView) {
    const noMembership = !mine;
    const isPrivate = !section.isPublic;
    const message = noMembership
      ? "Join a section first to browse Study Hub materials."
      : isPrivate
      ? "This section is private — only its members can view the content."
      : "These materials belong to another department.";
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <button onClick={() => navigate("/study-hub")} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
          <Icon name="ArrowLeft" size={16} /> Study Hub
        </button>
        <EmptyState
          icon="Lock"
          title={isPrivate ? "Private section" : "Not available"}
          message={message}
          action={noMembership ? <Button onClick={() => navigate("/study-hub")}>Go to Study Hub</Button> : null}
        />
      </AppShell>
    );
  }

  const pins = studyPinsIn(section.id);
  const courses = studyCoursesIn(section.id);

  async function unpin(pin) {
    if (unpinBusy) return;
    setUnpinBusy(true);
    try {
      const r = await deleteStudyPin(pin.id);
      if (!r.ok) { toast({ type: "error", title: "Couldn't unpin", message: r.error }); return; }
      toast({ type: "success", title: "Unpinned" });
    } catch {
      toast({ type: "error", title: "Couldn't unpin", message: "Please try again." });
    } finally {
      setUnpinBusy(false);
    }
  }
  async function doConfirm() {
    if (!confirm || confirmBusy) return;
    setConfirmBusy(true);
    try {
      const r = await deleteStudyCourse(confirm.item.id);
      if (!r.ok) { toast({ type: "error", title: "Couldn't remove", message: r.error }); return; }
      toast({ type: "success", title: "Subject removed", message: confirm.item.code });
      setConfirm(null);
    } catch {
      toast({ type: "error", title: "Couldn't remove", message: "Please try again." });
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }
  async function doLeave() {
    if (leaving || !myMembership) return;
    setLeaving(true);
    try {
      const r = await removeMember(myMembership.id);
      if (!r.ok) { toast({ type: "error", title: "Couldn't leave", message: r.error }); return; }
      toast({ type: "success", title: "Left section", message: `${dept && deptCode(dept.name)} · Intake ${intake.number} · Section ${section.number}` });
      navigate("/study-hub");
    } finally {
      setLeaving(false);
    }
  }

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <button onClick={back} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
        <Icon name="ArrowLeft" size={16} /> {section.isMine ? "Study Hub" : `Intake ${intake.number}`}
      </button>
      <SectionHeader section={section} dept={dept} intake={intake} manager={manager} onLeave={myMembership ? () => setLeaveOpen(true) : null} />

      {section.isMine ? (
        <>
          <div className="mb-5">
            <FilterTabs options={["Pinned", "Courses"]} value={tab} onChange={setTab} counts={{ Pinned: pins.length, Courses: courses.length }} />
          </div>
          {tab === "Pinned" && <PinnedTab pins={pins} manager={manager} onPin={() => setPinOpen(true)} onUnpin={unpin} />}
          {tab === "Courses" && <CoursesTab section={section} courses={courses} canEdit={canAddCourse} manager={manager} onAddCourse={() => setCourseOpen(true)} onDeleteCourse={(item) => setConfirm({ item })} />}
        </>
      ) : (
        <CoursesTab section={section} courses={courses} canEdit={false} manager={false} onAddCourse={() => {}} onDeleteCourse={() => {}} />
      )}

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} sectionId={section.id} />
      <AddCourseModal open={courseOpen} onClose={() => setCourseOpen(false)} sectionId={section.id} />
      <Modal
        open={!!confirm} onClose={() => setConfirm(null)} icon="Trash2" tone="red"
        title="Remove this subject?"
        description={confirm ? `"${confirm.item.code} — ${confirm.item.name}" and all its notes, questions, and books will be removed for the section.` : ""}
        footer={<><Button variant="secondary" onClick={() => setConfirm(null)} disabled={confirmBusy}>Cancel</Button><Button variant="destructive" onClick={doConfirm} disabled={confirmBusy}>Remove</Button></>}
      />
      <Modal
        open={leaveOpen} onClose={() => setLeaveOpen(false)} icon="LogOut" tone="red"
        title="Leave this section?"
        description={
          manager
            ? "You're this section's Class Rep — leaving removes your CR status and the section will have no CR until an admin reassigns one. You'll lose access to its private materials and can rejoin later by requesting or with a join code."
            : "You'll lose access to this section's private materials and pinned notices. You can rejoin later by requesting or with a join code."
        }
        footer={<><Button variant="secondary" onClick={() => setLeaveOpen(false)} disabled={leaving}>Cancel</Button><Button variant="destructive" loading={leaving} onClick={doLeave}>Leave section</Button></>}
      />
    </AppShell>
  );
}

// Section header with a CR-name subtitle (needs studyPersonName).
function SectionHeader({ section, dept, intake, manager, onLeave }) {
  const { studyPersonName } = useApp();
  const crName = section.crIds[0] ? studyPersonName(section.crIds[0]) : null;
  const editors = (section.editorIds || []).length;
  const subtitle = [
    crName ? `${crName} (CR)` : section.hasCR ? null : "No CR yet",
    editors > 0 ? `${editors} editor${editors === 1 ? "" : "s"}` : null,
    !section.isMine ? "Read-only" : null,
  ].filter(Boolean).join(" · ");
  return (
    <PageHeader
      title={`${deptCode(dept.name)} · Intake ${intake.number} · Section ${section.number}`}
      subtitle={subtitle}
      action={onLeave ? (
        <div className="flex gap-2">
          {manager && <Button icon="Settings" onClick={() => navigate(`/study-hub/section/${section.id}/manage`)}>Manage section</Button>}
          <Button variant="secondary" icon="LogOut" onClick={onLeave}>Leave section</Button>
        </div>
      ) : null}
    />
  );
}

// ============================================================================
// Course files — one course's materials
// ============================================================================
const NOTE_TYPES = ["Class Note", "Assignment", "Lab Manual", "Reference"];

function UploadFileModal({ open, onClose, courseId, courseCode }) {
  const { uploadStudyMaterial } = useApp();
  const toast = useToast();
  const [form, setForm] = React.useState({ type: "Class Note", title: "", file: null });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (!open) { setForm({ type: "Class Note", title: "", file: null }); setErrors({}); } }, [open]);
  async function submit(e) {
    if (e) e.preventDefault();
    if (saving) return;
    const er = {};
    if (!form.title.trim()) er.title = "Enter a title.";
    if (!form.file) er.file = "Choose a file.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const r = await uploadStudyMaterial(courseId, { title: form.title, type: form.type, file: form.file });
      if (!r.ok) { toast({ type: "error", title: "Upload failed", message: r.error }); return; }
      toast({ type: "success", title: "Uploaded", message: form.title.trim() });
      setForm({ type: "Class Note", title: "", file: null }); setErrors({}); onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open} onClose={onClose} icon="Upload" tone="blue" title="Upload class note"
      description={courseCode ? `Add a study note, assignment, or manual to ${courseCode}.` : ""}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon="Upload" onClick={() => submit()} disabled={saving}>Upload</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Type" htmlFor="uf-type">
          <Select id="uf-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Title" htmlFor="uf-title" required error={errors.title}>
          <Input id="uf-title" value={form.title} error={!!errors.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 3 — DFD Notes" />
        </Field>
        <Field label="File" required error={errors.file}><DocField file={form.file} onChange={(f) => setForm((x) => ({ ...x, file: f }))} /></Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

function UploadSlideModal({ open, onClose, courseId, courseCode }) {
  const { uploadStudyMaterial } = useApp();
  const toast = useToast();
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (!open) { setTitle(""); setFile(null); setErrors({}); } }, [open]);
  async function submit(e) {
    if (e) e.preventDefault();
    if (saving) return;
    const er = {};
    if (!title.trim()) er.title = "Enter a title for the presentation.";
    if (!file) er.file = "Choose a presentation file.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const r = await uploadStudyMaterial(courseId, { title, type: "Lecture Slide", file });
      if (!r.ok) { toast({ type: "error", title: "Upload failed", message: r.error }); return; }
      toast({ type: "success", title: "Slide uploaded", message: title.trim() });
      setTitle(""); setFile(null); setErrors({}); onClose();
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      open={open} onClose={onClose} icon="Presentation" tone="blue" title="Upload lecture slide"
      description={courseCode ? `Add presentation slides or lecture decks to ${courseCode}.` : ""}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon="Upload" onClick={() => submit()} disabled={saving}>Upload slide</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Slide Title" htmlFor="us-title" required error={errors.title}>
          <Input id="us-title" value={title} error={!!errors.title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lecture 05 — Tree Traversals & BST" />
        </Field>
        <Field label="Slide File" required error={errors.file} hint="PPT, PPTX, or PDF presentation up to 10 MB">
          <DocField file={file} onChange={(f) => setFile(f)} />
        </Field>
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}

function FileRow({ file, isManager, onDelete, saved, onToggleSave }) {
  const { studyPersonName, currentUser } = useApp();
  const canDelete = isManager || file.byId === currentUser?.id; // RLS: own upload or CR
  return (
    <div className="flex items-center gap-3 p-4">
      <AccentTile icon={fileIcon(file.kind)} tone={ACCENT} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{file.title}</p>
        <p className="mt-0.5 truncate text-xs text-ink-3">{file.type} · {studyPersonName(file.byId)} · {relativeDate(file.createdAt)} · {fmtFileSize(file.sizeMB)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onToggleSave && <BookmarkIcon saved={saved} onClick={() => onToggleSave(file)} />}
        {canDelete && <DeleteIcon onClick={() => onDelete(file)} title="Remove" />}
        <DownloadButton path={file.path} name={file.title} />
      </div>
    </div>
  );
}

// Class Notes tab — clean note/file list.
function NotesTab({ files, canUpload, manager, onUpload, onDelete, saved, onToggleSave }) {
  if (files.length === 0) {
    return (
      <EmptyState
        icon="FileText"
        title="No class notes yet"
        message={canUpload ? "Upload class notes, lab manuals, or assignments for this subject." : "No class notes have been uploaded yet."}
        action={canUpload ? <Button icon="Upload" onClick={onUpload}>Upload note</Button> : null}
      />
    );
  }
  return (
    <Card className="divide-y divide-brd overflow-hidden">
      {files.map((f) => (
        <FileRow
          key={f.id}
          file={f}
          isManager={manager}
          onDelete={onDelete}
          saved={saved?.has(f.id)}
          onToggleSave={onToggleSave && (() => onToggleSave("material", f))}
        />
      ))}
    </Card>
  );
}

// Lecture Slides tab - presentation decks.
function SlidesTab({ slides, canUpload, manager, onUpload, onDelete, saved, onToggleSave }) {
  if (slides.length === 0) {
    return (
      <EmptyState
        icon="Presentation"
        title="No slides yet"
        message={canUpload ? "Upload lecture slide decks or PowerPoint presentations for this subject." : "No presentation slides have been uploaded yet."}
        action={canUpload ? <Button icon="Presentation" onClick={onUpload}>Upload slide</Button> : null}
      />
    );
  }
  return (
    <Card className="divide-y divide-brd overflow-hidden">
      {slides.map((f) => (
        <FileRow
          key={f.id}
          file={f}
          isManager={manager}
          onDelete={onDelete}
          saved={saved?.has(f.id)}
          onToggleSave={onToggleSave && (() => onToggleSave("material", f))}
        />
      ))}
    </Card>
  );
}

// ============================================================================
// Subject view - one course: Notes / Questions / Books
// ============================================================================
export function StudyHubCourse({ sectionId, courseId }) {
  const {
    studyCourseById, studySectionById, studyIntakes, studyFilesIn, studyQuestionsIn, studyBooksInCourse,
    resolveMySection, deleteStudyMaterial, deleteStudyQB, setQBVerified, deleteStudyBook, dataLoading,
    getStudyBookmarks, toggleStudyBookmark, listings = [],
  } = useApp();
  const toast = useToast();
  const [tab, setTab] = React.useState("Class Notes");
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [qbOpen, setQbOpen] = React.useState(false);
  const [bookOpen, setBookOpen] = React.useState(false);
  const [slideOpen, setSlideOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null); // { kind: 'note'|'slide'|'qb'|'book', item }
  const [confirmBusy, setConfirmBusy] = React.useState(false);
  const [verifyBusy, setVerifyBusy] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [saved, setSaved] = React.useState(() => new Set());

  // Saved state for everything visible in this subject (study_bookmarks is
  // own-only under RLS, so the ids are all we need to send).
  const allItems = [...studyFilesIn(courseId), ...studyQuestionsIn(courseId), ...studyBooksInCourse(courseId)];
  const idsKey = allItems.map((x) => x.id).sort().join(",");
  React.useEffect(() => {
    let live = true;
    if (!idsKey) { setSaved(new Set()); return; }
    getStudyBookmarks(idsKey.split(",")).then((s) => { if (live) setSaved(s); });
    return () => { live = false; };
  }, [idsKey]);

  // Optimistic toggle; reverts if the write fails.
  async function toggleSave(itemType, item) {
    const wasSaved = saved.has(item.id);
    const flip = (set, on) => { const n = new Set(set); on ? n.add(item.id) : n.delete(item.id); return n; };
    setSaved((prev) => flip(prev, !wasSaved));
    const r = await toggleStudyBookmark(itemType, item.id, wasSaved);
    if (!r.ok) {
      setSaved((prev) => flip(prev, wasSaved));
      toast({ type: "error", title: "Couldn't update bookmark", message: r.error });
    }
  }

  const course = studyCourseById(courseId);
  const section = course && studySectionById(course.sectionId);

  if (!course || !section) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        {dataLoading ? <Loading /> : (
          <EmptyState icon="BookOpen" title="Subject not found" message="This subject may have been removed."
            action={<Button onClick={() => navigate(sectionId ? `/study-hub/section/${sectionId}` : "/study-hub")}>Back</Button>} />
        )}
      </AppShell>
    );
  }

  const mine = resolveMySection();
  const myDeptId = mine?.section?.deptId;
  const myIntakeId = mine?.section?.intakeId;
  const sectionIntake = studyIntakes.find((i) => i.id === section.intakeId);
  const myRole = section.isMine ? (mine?.myRole || "member") : "viewer";
  const canView =
    section.isMine ||
    (section.isPublic && section.intakeId === myIntakeId) ||
    (section.isPublic && sectionIntake?.isPublic && myDeptId != null && section.deptId === myDeptId);
  const canUpload = section.isMine && canContribute(myRole);
  const manager = section.isMine && isCR(myRole);

  if (!canView) {
    const noMembership = !mine;
    const isPrivate = !section.isPublic;
    const message = noMembership
      ? "Join a section first to browse Study Hub materials."
      : isPrivate
      ? "This section is private — only its members can view the content."
      : "These materials belong to another department.";
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <EmptyState
          icon="Lock"
          title={isPrivate ? "Private section" : "Not available"}
          message={message}
          action={<Button onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>}
        />
      </AppShell>
    );
  }

  // Search (title) applies to every tab's list, sorted newest first.
  const q = query.trim().toLowerCase();
  const byNewest = (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  const refine = (list) => list.filter((x) => !q || (x.title ?? "").toLowerCase().includes(q)).sort(byNewest);
  const allFiles = studyFilesIn(course.id);
  const notes = refine(allFiles.filter((f) => f.type !== "Lecture Slide" && !["ppt", "pptx"].includes(f.kind)));
  const slides = refine(allFiles.filter((f) => f.type === "Lecture Slide" || ["ppt", "pptx"].includes(f.kind)));
  const qb = refine(studyQuestionsIn(course.id));
  const books = refine(studyBooksInCourse(course.id));

  async function verifyQB(paper) {
    if (verifyBusy) return;
    setVerifyBusy(true);
    try {
      const r = await setQBVerified(paper.id, !paper.verified);
      if (!r.ok) { toast({ type: "error", title: "Couldn't update", message: r.error }); return; }
      toast({ type: "success", title: paper.verified ? "Marked unverified" : "Marked verified" });
    } catch {
      toast({ type: "error", title: "Couldn't update", message: "Please try again." });
    } finally {
      setVerifyBusy(false);
    }
  }
  async function doConfirm() {
    if (!confirm || confirmBusy) return;
    setConfirmBusy(true);
    try {
      const { kind, item } = confirm;
      const r = (kind === "note" || kind === "slide") ? await deleteStudyMaterial(item.id)
              : kind === "qb"   ? await deleteStudyQB(item.id)
              :                   await deleteStudyBook(item.id);
      if (!r.ok) { toast({ type: "error", title: "Couldn't remove", message: r.error }); return; }
      toast({ type: "success", title: "Removed", message: item.title });
      setConfirm(null);
    } catch {
      toast({ type: "error", title: "Couldn't remove", message: "Please try again." });
      setConfirm(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  const confirmLabel = { note: "class note", slide: "lecture slide", qb: "question paper", book: "book" }[confirm?.kind] || "item";

  // Marketplace cross-link: Available listings tagged with this course code
  // (0077). Codes compared ignoring case/spacing so "CSE101" matches "CSE 101".
  const normCode = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const courseListings = listings.filter(
    (l) => l.status === "Available" && l.courseCode && normCode(l.courseCode) === normCode(course.code)
  );

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <button
        onClick={() => navigate(section.isMine ? "/study-hub" : `/study-hub/section/${section.id}`)}
        className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2"
      >
        <Icon name="ArrowLeft" size={16} /> {section.isMine ? "Courses" : `Section ${section.number}`}
      </button>
      <PageHeader
        title={`${course.code} — ${course.name}`}
        subtitle={section.isMine ? null : `Section ${section.number} · read-only`}
      />

      {/* Used books/notes for this course on the marketplace */}
      {courseListings.length > 0 && (
        <Card className="mb-5 p-4">
          <p className="text-base font-bold text-ink">
            For sale on the marketplace <span className="font-semibold text-ink-3">· {courseListings.length}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {courseListings.slice(0, 6).map((l) => (
              <button
                key={l.id}
                onClick={() => navigate(`/marketplace/${l.id}`)}
                className="inline-flex items-center gap-2 rounded-md border border-brd bg-surface px-3 py-2 text-left hover:bg-surface-2"
              >
                <Icon name={l.category === "Books" ? "BookOpen" : "NotebookPen"} size={15} className="text-violet-600 dark:text-violet-300" />
                <span className="max-w-[180px] truncate text-base font-semibold text-ink">{l.title}</span>
                <span className="text-base font-bold text-violet-600 dark:text-violet-300">৳{l.price}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          options={["Class Notes", "CT Questions", "Books", "Slides"]}
          value={tab}
          onChange={setTab}
          counts={{ "Class Notes": notes.length, "CT Questions": qb.length, Books: books.length, Slides: slides.length }}
        />
        <div className="flex items-center gap-2">
          {(notes.length > 2 || qb.length > 2 || books.length > 2 || slides.length > 2 || query) && (
            <div className="relative w-full sm:w-56">
              <Icon name="Search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-10 w-full rounded-md border border-brd bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )}
          {canUpload && tab === "Class Notes" && <Button icon="Upload" onClick={() => setUploadOpen(true)}>Upload note</Button>}
          {canUpload && tab === "CT Questions" && <Button icon="Upload" onClick={() => setQbOpen(true)}>Upload question</Button>}
          {canUpload && tab === "Books" && <Button icon="Plus" onClick={() => setBookOpen(true)}>Add book</Button>}
          {canUpload && tab === "Slides" && <Button icon="Presentation" onClick={() => setSlideOpen(true)}>Upload slide</Button>}
        </div>
      </div>

      {tab === "Class Notes" && (
        <NotesTab files={notes} canUpload={canUpload} manager={manager}
          onUpload={() => setUploadOpen(true)} onDelete={(item) => setConfirm({ kind: "note", item })}
          saved={saved} onToggleSave={toggleSave} />
      )}
      {tab === "CT Questions" && (
        <QuestionBankTab qb={qb} canEdit={canUpload} isManager={manager}
          onUpload={() => setQbOpen(true)} onVerify={verifyQB} onDelete={(item) => setConfirm({ kind: "qb", item })}
          saved={saved} onToggleSave={toggleSave} />
      )}
      {tab === "Books" && (
        <BooksTab books={books} canAdd={canUpload} isManager={manager}
          onAdd={() => setBookOpen(true)} onDelete={(item) => setConfirm({ kind: "book", item })}
          saved={saved} onToggleSave={toggleSave} />
      )}
      {tab === "Slides" && (
        <SlidesTab slides={slides} canUpload={canUpload} manager={manager}
          onUpload={() => setSlideOpen(true)} onDelete={(item) => setConfirm({ kind: "slide", item })}
          saved={saved} onToggleSave={toggleSave} />
      )}

      <UploadFileModal open={uploadOpen} onClose={() => setUploadOpen(false)} courseId={course.id} courseCode={course.code} />
      <UploadQBModal open={qbOpen} onClose={() => setQbOpen(false)} courseId={course.id} />
      <AddBookModal open={bookOpen} onClose={() => setBookOpen(false)} courseId={course.id} courseCode={course.code} />
      <UploadSlideModal open={slideOpen} onClose={() => setSlideOpen(false)} courseId={course.id} courseCode={course.code} />
      <Modal
        open={!!confirm} onClose={() => setConfirm(null)} icon="Trash2" tone="red"
        title={`Remove this ${confirmLabel}?`}
        description={confirm ? `"${confirm.item.title}" will be removed for everyone in the section.` : ""}
        footer={<><Button variant="secondary" onClick={() => setConfirm(null)} disabled={confirmBusy}>Cancel</Button><Button variant="destructive" onClick={doConfirm} disabled={confirmBusy}>Remove</Button></>}
      />
    </AppShell>
  );
}

// ============================================================================
// Manage section — CR only (members)
// ============================================================================
function MemberRow({ member, label, actions }) {
  const { studyPersonName } = useApp();
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar name={studyPersonName(member.userId)} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{studyPersonName(member.userId)}</p>
        <p className="text-xs text-ink-3">{label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  );
}

function MembersTab({ section, members, onAct, actBusy }) {
  const pending = members.filter((m) => m.status === "pending");
  const approved = members.filter((m) => m.status === "approved");
  const crs = approved.filter((m) => m.role === "cr");
  const editors = approved.filter((m) => m.role === "editor");
  const plain = approved.filter((m) => m.role === "member");

  return (
    <div className="space-y-4 sm:space-y-5">
      <section>
        <h3 className="mb-3 text-base font-semibold text-ink">Join requests {pending.length > 0 && <span className="text-ink-3">· {pending.length}</span>}</h3>
        {pending.length === 0 ? (
          <EmptyState icon="Inbox" title="No pending requests" message="Students who ask to join your section show up here." />
        ) : (
          <Card className="divide-y divide-brd overflow-hidden">
            {pending.map((m) => (
              <MemberRow key={m.id} member={m} label="Wants to join"
                actions={<><Button size="sm" variant="secondary" onClick={() => onAct("deny", m)} disabled={actBusy}>Deny</Button><Button size="sm" icon="Check" onClick={() => onAct("approve", m)} disabled={actBusy}>Approve</Button></>} />
            ))}
          </Card>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-ink">Roster <span className="text-ink-3">· {approved.length}</span></h3>
        <Card className="divide-y divide-brd overflow-hidden">
          {crs.map((m) => (
            <MemberRow key={m.id} member={m} label="Class representative"
              actions={<span className="rounded-full bg-teal-50 dark:bg-teal-500/15 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300">CR</span>} />
          ))}
          {editors.map((m) => (
            <MemberRow key={m.id} member={m} label="Editor"
              actions={<><Button size="sm" variant="secondary" onClick={() => onAct("demote", m)} disabled={actBusy}>Make member</Button><Button size="sm" variant="secondary" icon="UserMinus" onClick={() => onAct("remove", m)} disabled={actBusy}>Remove</Button></>} />
          ))}
          {plain.map((m) => (
            <MemberRow key={m.id} member={m} label="Member"
              actions={<><Button size="sm" variant="secondary" icon="UserPlus" onClick={() => onAct("promote", m)} disabled={actBusy}>Make editor</Button><Button size="sm" variant="secondary" icon="UserMinus" onClick={() => onAct("remove", m)} disabled={actBusy}>Remove</Button></>} />
          ))}
          {approved.length === 0 && <div className="p-4 text-base text-ink-3">No approved members yet.</div>}
        </Card>
      </section>
    </div>
  );
}

// ============================================================================
// Settings tab — join code, section privacy, intake vote
// ============================================================================
function SettingsTab({ section, intake, onTogglePublic, toggleBusy }) {
  const { intakeVoteFor, lastIntakeVoteFor, intakeBallotsFor, myBallotFor, initiateIntakeVote, castIntakeVote } = useApp();
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);
  const [voteLoading, setVoteLoading] = React.useState(false);

  const vote = intakeVoteFor(intake.id);
  const lastVote = vote ? null : lastIntakeVoteFor(intake.id);
  const ballots = vote ? intakeBallotsFor(vote.id) : [];
  const myBallot = vote ? myBallotFor(vote.id) : null;

  async function copyCode() {
    if (!section.joinCode) return;
    try {
      await navigator.clipboard.writeText(section.joinCode);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { toast({ type: "error", title: "Copy failed", message: "Copy the code manually." }); }
  }

  async function startVote(targetPublic) {
    setVoteLoading(true);
    try {
      const r = await initiateIntakeVote(intake.id, targetPublic);
      if (!r.ok) { toast({ type: "error", title: "Couldn't start vote", message: r.error }); return; }
      toast({ type: "success", title: "Vote started", message: "All CRs in this intake can now cast their ballot." });
    } finally { setVoteLoading(false); }
  }

  async function castVote(inFavor) {
    setVoteLoading(true);
    try {
      const r = await castIntakeVote(vote.id, inFavor);
      if (!r.ok) { toast({ type: "error", title: "Vote failed", message: r.error }); return; }
      toast({ type: "success", title: "Vote recorded" });
    } finally { setVoteLoading(false); }
  }

  const inFavorCount = ballots.filter((b) => b.inFavor).length;
  const againstCount = ballots.filter((b) => !b.inFavor).length;
  const closesAt = vote ? new Date(vote.closesAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Join code */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-ink">Join code</h3>
        <Card className="p-4">
          {section.joinCode ? (
            <div className="flex items-center gap-3">
              <span className="min-w-0 flex-1 break-all rounded-md bg-surface-3 px-4 py-2.5 text-center font-mono text-2xl font-bold tracking-[0.15em] text-ink sm:text-3xl sm:tracking-[0.25em]">{section.joinCode}</span>
              <Button variant="secondary" className="shrink-0" icon={copied ? "Check" : "Copy"} onClick={copyCode}>{copied ? "Copied!" : "Copy"}</Button>
            </div>
          ) : (
            <p className="text-base text-ink-3">No join code assigned yet — contact admin.</p>
          )}
          <p className="mt-2 text-xs text-ink-3">Share this with students so they can join your section instantly.</p>
        </Card>
      </section>

      {/* Section visibility */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-ink">Section visibility</h3>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink">{section.isPublic ? "Public" : "Private"}</p>
              <p className="mt-0.5 text-xs text-ink-3">
                {section.isPublic
                  ? "Same-intake students (or whole dept if intake is public) can browse your section's materials."
                  : "Only approved members can see this section's content."}
              </p>
            </div>
            <Button size="sm" variant="secondary" icon={section.isPublic ? "Lock" : "Unlock"} onClick={() => onTogglePublic(!section.isPublic)} disabled={toggleBusy}>
              {section.isPublic ? "Make private" : "Make public"}
            </Button>
          </div>
        </Card>
      </section>

      {/* Intake visibility vote */}
      <section>
        <h3 className="mb-3 text-base font-semibold text-ink">Intake visibility</h3>
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${intake.isPublic ? "bg-success-bg text-success" : "bg-surface-3 text-ink-2"}`}>
              <Icon name={intake.isPublic ? "Globe" : "Lock"} size={10} />
              {intake.isPublic ? "Public intake" : "Private intake"}
            </span>
          </div>
          <p className="text-xs text-ink-3">
            {intake.isPublic
              ? "Students from other intakes in your department can see your sections (when they're public)."
              : "Only same-intake students can see public sections here."}
          </p>

          {vote ? (
            <>
              <p className="text-base font-semibold text-ink">Active vote: make intake {vote.targetPublic ? "public" : "private"}</p>
              <div className="flex gap-4 text-base">
                <span className="text-success font-semibold">{inFavorCount} in favour</span>
                <span className="text-danger font-semibold">{againstCount} against</span>
              </div>
              <p className="text-xs text-ink-3">Closes {closesAt}</p>
              {vote.status !== "open" ? (
                <p className="text-xs text-ink-3">Vote closed · result: <strong>{vote.result ?? "—"}</strong></p>
              ) : myBallot ? (
                <p className="text-xs text-ink-3">Your vote: <strong>{myBallot.inFavor ? "In favour" : "Against"}</strong></p>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" icon="ThumbsDown" onClick={() => castVote(false)} disabled={voteLoading}>Against</Button>
                  <Button size="sm" icon="ThumbsUp" onClick={() => castVote(true)} disabled={voteLoading}>In favour</Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {lastVote && (
                <p className="text-xs text-ink-3">
                  Last vote ({lastVote.targetPublic ? "make public" : "make private"}) closed · result: <strong>{lastVote.result ?? "no quorum"}</strong>
                </p>
              )}
              {intake.isPublic
                ? <Button size="sm" variant="secondary" icon="Lock" onClick={() => startVote(false)} disabled={voteLoading}>Vote to make private</Button>
                : <Button size="sm" icon="Globe" onClick={() => startVote(true)} disabled={voteLoading}>Vote to make public</Button>}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

export function StudyHubManage({ sectionId }) {
  const {
    departments, studyIntakes, studySectionById, studyMembers, resolveMySection,
    approveMember, removeMember, setMemberRole, toggleSectionPublic, checkExpiredVotes, dataLoading,
  } = useApp();
  const toast = useToast();
  const [tab, setTab] = React.useState("Members");
  const [actBusy, setActBusy] = React.useState(false);
  const [toggleBusy, setToggleBusy] = React.useState(false);

  const section = studySectionById(sectionId);
  const intake = section && studyIntakes.find((i) => i.id === section.intakeId);
  const dept = intake && departments.find((d) => d.id === intake.deptId);

  React.useEffect(() => { if (intake?.id) checkExpiredVotes(intake.id); }, [intake?.id]); // auto-close expired intake votes on load

  if (!section || !intake || !dept) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        {dataLoading ? <Loading /> : (
          <EmptyState icon="Users" title="Section not found" message="This section may have changed."
            action={<Button onClick={() => navigate("/study-hub")}>Back to Study Hub</Button>} />
        )}
      </AppShell>
    );
  }

  const mine = resolveMySection();
  const isManager = section.isMine && !!(mine && isCR(mine.myRole));

  if (!isManager) {
    return (
      <AppShell activeKey="study-hub" title="Study Hub">
        <EmptyState icon="Lock" title="You don't manage this section" message="Only a section's CR can manage its members."
          action={<Button onClick={() => navigate(`/study-hub/section/${section.id}`)}>Back to section</Button>} />
      </AppShell>
    );
  }

  const members = studyMembers.filter((m) => m.sectionId === section.id);
  const pendingCount = members.filter((m) => m.status === "pending").length;

  async function onAct(kind, m) {
    if (actBusy) return;
    setActBusy(true);
    try {
      let r;
      if (kind === "approve") r = await approveMember(m.id);
      else if (kind === "deny" || kind === "remove") r = await removeMember(m.id);
      else if (kind === "promote") r = await setMemberRole(m.id, "editor");
      else if (kind === "demote") r = await setMemberRole(m.id, "member");
      if (!r || !r.ok) { toast({ type: "error", title: "Couldn't update", message: r?.error }); return; }
      const titles = { approve: "Member approved", deny: "Request denied", remove: "Member removed", promote: "Promoted to editor", demote: "Set to member" };
      toast({ type: "success", title: titles[kind] });
    } catch {
      toast({ type: "error", title: "Couldn't update", message: "Please try again." });
    } finally {
      setActBusy(false);
    }
  }

  async function handleTogglePublic(isPublic) {
    if (toggleBusy) return;
    setToggleBusy(true);
    try {
      const r = await toggleSectionPublic(section.id, isPublic);
      if (!r.ok) { toast({ type: "error", title: "Couldn't update", message: r.error }); return; }
      toast({ type: "success", title: isPublic ? "Section is now public" : "Section is now private" });
    } catch {
      toast({ type: "error", title: "Couldn't update visibility", message: "Please try again." });
    } finally {
      setToggleBusy(false);
    }
  }

  return (
    <AppShell activeKey="study-hub" title="Study Hub">
      <button onClick={() => navigate(`/study-hub/section/${section.id}`)} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
        <Icon name="ArrowLeft" size={16} /> Section {section.number}
      </button>
      <PageHeader title={`Manage Section ${section.number}`} subtitle={`${deptCode(dept.name)} · Intake ${intake.number}`} />
      <div className="mb-5">
        <FilterTabs
          options={["Members", "Settings"]}
          value={tab} onChange={setTab}
          counts={{ Members: pendingCount > 0 ? pendingCount : undefined }}
        />
      </div>
      {tab === "Members" && <MembersTab section={section} members={members} onAct={onAct} actBusy={actBusy} />}
      {tab === "Settings" && <SettingsTab section={section} intake={intake} onTogglePublic={handleTogglePublic} toggleBusy={toggleBusy} />}
    </AppShell>
  );
}
