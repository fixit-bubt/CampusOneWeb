import React, { useState } from "react";
import { Save, Mail, Check, Lock, Info, Share2, ChevronDown } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Button, Field, Input, Select, FileUpload, Avatar, Badge, Spinner, useToast } from "../components/ui.jsx";
import { AppShell, ROLE_TONE } from "../components/AppShell.jsx";
import { Icon } from "../components/Icon.jsx";
import { useT } from "../i18n/index.js";
import { version as appVersion } from "../../package.json";

// Small on/off switch.
function Toggle({ checked, onChange, label, hint }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-start justify-between gap-3 text-left">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-2">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-3">{hint}</span>}
      </span>
      <span className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-brand" : "bg-brd-2"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

export default function Profile() {
  const { currentUser, updateProfile, changePassword } = useApp();
  const toast = useToast();
  const t = useT();

  // Collapsible sections
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Change-password form state
  const [pwForm, setPwForm] = useState({ newPw: "", confirmPw: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  async function submitPassword(e) {
    e.preventDefault();
    if (pwSaving) return;
    if (pwForm.newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (pwForm.newPw !== pwForm.confirmPw) { setPwError("Passwords don't match."); return; }
    setPwError("");
    setPwSaving(true);
    try {
      const res = await changePassword(pwForm.newPw);
      if (!res.ok) { setPwError(res.error); return; }
      toast({ type: "success", title: "Password changed", message: "Your new password is active." });
      setPwForm({ newPw: "", confirmPw: "" });
      setShowPassword(false);
    } finally {
      setPwSaving(false);
    }
  }

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    whatsapp: currentUser?.whatsapp || "",
    phone: currentUser?.phone || "",
    bloodGroup: currentUser?.bloodGroup || "",
    address: currentUser?.address || "",
    intake: currentUser?.intake || "",
    section: currentUser?.section || "",
    studentId: currentUser?.studentId || "",
    program: currentUser?.program || "",
    avatar: currentUser?.avatar || null,
    avatarFile: null,
    directoryVisible: currentUser?.directoryVisible !== false,
    showWhatsapp: currentUser?.showWhatsapp === true,
    allowDms: currentUser?.allowDms !== false,
  });

  async function shareApp() {
    const shareData = { title: "CampusOne", text: "CampusOne - the BUBT campus app.", url: window.location.origin };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast({ type: "success", title: t.settings.shareCopied });
    } catch {
      toast({ type: "error", title: "Couldn't copy the link" });
    }
  }

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!currentUser) return null;
  const isStudent = currentUser.role === "Student";
  const set = (k) => (e) => { setSaved(false); setForm((f) => ({ ...f, [k]: e.target.value })); };
  const setToggle = (k) => (v) => { setSaved(false); setForm((f) => ({ ...f, [k]: v })); };

  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    const er = {};
    if (!form.name.trim()) er.name = "Enter your name.";
    if (isStudent && !form.studentId.trim()) er.studentId = "Student ID is required.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    try {
      const res = await updateProfile(form);
      if (!res.ok) {
        toast({ type: "error", title: "Couldn't save profile", message: res.error });
        return;
      }
      toast({ type: "success", title: "Profile saved" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell activeKey="profile" title="Profile">
      <div className="mx-auto max-w-xl space-y-4 px-2 sm:px-4 py-2">
        {/* Simple Identity Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <Avatar name={form.name} src={form.avatar} size={52} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-base sm:text-lg font-bold text-ink">{form.name || "Your name"}</p>
                <Badge tone={ROLE_TONE[currentUser.role]}>{currentUser.role}</Badge>
              </div>
              <p className="truncate text-xs text-ink-3 mt-0.5">{currentUser.email}</p>
              {isStudent && form.studentId && (
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-2">
                  <span className="font-mono font-semibold">ID: {form.studentId}</span>
                  {form.intake && <span>· Intake {form.intake}</span>}
                  {form.section && <span>({form.section})</span>}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPhotoUpload((v) => !v)}
              className="rounded-lg border border-brd bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-2 transition-colors shrink-0"
            >
              {showPhotoUpload ? "Close" : "Change Photo"}
            </button>
          </div>

          {showPhotoUpload && (
            <div className="mt-4 pt-4 border-t border-brd">
              <FileUpload
                id="pf-photo"
                value={form.avatar}
                onChange={(url, file) => { setSaved(false); setForm((f) => ({ ...f, avatar: url, avatarFile: file })); }}
              />
            </div>
          )}
        </Card>

        {/* Edit Details Form */}
        <form onSubmit={submit} className="space-y-4">
          <Card className="p-4 sm:p-5 space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="pf-name" required error={errors.name}>
                <Input id="pf-name" value={form.name} error={!!errors.name} onChange={set("name")} />
              </Field>

              {isStudent ? (
                <Field label="Student ID" htmlFor="pf-sid" required error={errors.studentId}>
                  <Input id="pf-sid" placeholder="e.g. 20214103001" value={form.studentId} error={!!errors.studentId} onChange={set("studentId")} />
                </Field>
              ) : (
                <Field label="Email" htmlFor="pf-email">
                  <div className="flex h-10 items-center gap-2 rounded-md border border-brd bg-surface-2 px-3 text-sm text-ink-3 truncate">
                    <Mail size={14} />
                    <span className="truncate">{currentUser.email}</span>
                  </div>
                </Field>
              )}
            </div>

            {isStudent && (
              <div className="grid gap-3 grid-cols-3">
                <Field label="Program" htmlFor="pf-program">
                  <Input id="pf-program" placeholder="CSE" value={form.program} onChange={set("program")} />
                </Field>
                <Field label="Intake" htmlFor="pf-intake">
                  <Input id="pf-intake" placeholder="49" value={form.intake} onChange={set("intake")} />
                </Field>
                <Field label="Section" htmlFor="pf-section">
                  <Input id="pf-section" placeholder="5" value={form.section} onChange={set("section")} />
                </Field>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Phone" htmlFor="pf-phone">
                <Input id="pf-phone" type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={set("phone")} />
              </Field>
              <Field label="WhatsApp" htmlFor="pf-wa">
                <Input id="pf-wa" type="tel" placeholder="+8801..." value={form.whatsapp} onChange={set("whatsapp")} />
              </Field>
              <Field label="Blood Group" htmlFor="pf-blood">
                <Select id="pf-blood" value={form.bloodGroup} onChange={set("bloodGroup")}>
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Address" htmlFor="pf-address">
              <Input id="pf-address" placeholder="e.g. Mirpur, Dhaka" value={form.address} onChange={set("address")} />
            </Field>

            {isStudent && (
              <div className="space-y-3 border-t border-brd pt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">Privacy</p>
                <Toggle
                  checked={form.directoryVisible}
                  onChange={setToggle("directoryVisible")}
                  label="Show profile in Student Directory"
                />
                <Toggle
                  checked={form.allowDms}
                  onChange={setToggle("allowDms")}
                  label="Allow direct messages from classmates"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              {saved && !saving && (
                <span className="text-sm font-semibold text-success">Saved!</span>
              )}
              <Button type="submit" variant={saved ? "secondary" : "primary"} icon={saved ? Check : Save} disabled={saving}>
                {saving ? <Spinner size={14} /> : saved ? "Saved" : "Save Changes"}
              </Button>
            </div>
          </Card>
        </form>

        {/* Collapsible Change Password */}
        <Card className="p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-ink-3" />
              <span className="text-sm font-bold text-ink">Change Password</span>
            </div>
            <ChevronDown size={16} className={`text-ink-3 transition-transform ${showPassword ? "rotate-180" : ""}`} />
          </button>

          {showPassword && (
            <form onSubmit={submitPassword} className="mt-4 pt-3 border-t border-brd space-y-3">
              <Field label="New Password" htmlFor="pw-new" hint="Minimum 8 characters.">
                <Input id="pw-new" type="password" placeholder="Enter new password" value={pwForm.newPw}
                  onChange={(e) => { setPwError(""); setPwForm((f) => ({ ...f, newPw: e.target.value })); }} />
              </Field>
              <Field label="Confirm Password" htmlFor="pw-confirm" error={pwError || undefined}>
                <Input id="pw-confirm" type="password" placeholder="Repeat new password" value={pwForm.confirmPw} error={!!pwError}
                  onChange={(e) => { setPwError(""); setPwForm((f) => ({ ...f, confirmPw: e.target.value })); }} />
              </Field>
              <div className="flex justify-end pt-1">
                <Button type="submit" icon={Lock} disabled={pwSaving || !pwForm.newPw}>
                  {pwSaving ? <Spinner size={14} /> : "Update Password"}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Clean Footer info */}
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-ink-3">
          <span>CampusOne v{appVersion}</span>
          <button onClick={shareApp} className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">
            <Share2 size={13} /> Share App
          </button>
        </div>
      </div>
    </AppShell>
  );
}
