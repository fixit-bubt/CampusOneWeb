import React, { useState, useEffect } from "react";
import {
  FileBadge,
  FileStack,
  Calculator,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Bookmark,
  BookMarked,
  ClipboardList,
  CalendarRange,
  Bus,
  Moon,
  PackageSearch,
  Store,
  Droplet,
  GraduationCap,
  Check,
  Link as LinkIcon,
  Sparkles,
  X,
} from "lucide-react";
import { navigate } from "../../lib/router.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { Modal, Button, Input, Field } from "../../components/ui.jsx";

// Core default tools (always available)
const DEFAULT_TOOLS = [
  {
    id: "cover-page",
    title: "Cover Page",
    subtitle: "Assignment & Lab",
    iconName: "FileBadge",
    path: "/cover-page",
    iconBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    glowBorder: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    badge: "Instant PDF",
    badgeTone: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
    isDefault: true,
  },
  {
    id: "pdf-maker",
    title: "PDF Maker",
    subtitle: "Merge & Compress",
    iconName: "FileStack",
    path: "/pdf-maker",
    iconBg: "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400",
    glowBorder: "hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10",
    badge: "Client-side",
    badgeTone: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
    isDefault: true,
  },
  {
    id: "cgpa",
    title: "CGPA Calculator",
    subtitle: "Semester & Total",
    iconName: "Calculator",
    path: "/cgpa",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    glowBorder: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    badge: "BUBT 4.0",
    badgeTone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    isDefault: true,
  },
];

// Catalogue of Campus Features students can pin to their tools grid
const CAMPUS_FEATURES_CATALOG = [
  {
    id: "routines",
    title: "Class Routines",
    iconName: "ClipboardList",
    path: "/routines",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  },
  {
    id: "calendar",
    title: "Academic Calendar",
    iconName: "CalendarRange",
    path: "/calendar",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    id: "study-hub",
    title: "Study Hub",
    iconName: "BookMarked",
    path: "/study-hub",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
  },
  {
    id: "annex",
    title: "Annex Portal",
    iconName: "ExternalLink",
    path: "/annex",
    iconBg: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  },
  {
    id: "bus",
    title: "Bus Schedule",
    iconName: "Bus",
    path: "/bus",
    iconBg: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
  },
  {
    id: "prayer",
    title: "Prayer Times",
    iconName: "Moon",
    path: "/prayer",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    id: "lost-found",
    title: "Lost & Found",
    iconName: "PackageSearch",
    path: "/lost-found",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    iconName: "Store",
    path: "/marketplace",
    iconBg: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  },
  {
    id: "blood",
    title: "Blood Registry",
    iconName: "Droplet",
    path: "/blood",
    iconBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  },
  {
    id: "faculty",
    title: "Faculty Directory",
    iconName: "GraduationCap",
    path: "/faculty",
    iconBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
  },
];

const ICON_MAP = {
  FileBadge,
  FileStack,
  Calculator,
  ClipboardList,
  CalendarRange,
  BookMarked,
  ExternalLink,
  Bus,
  Moon,
  PackageSearch,
  Store,
  Droplet,
  GraduationCap,
  Globe,
  Bookmark,
  Link: LinkIcon,
  Sparkles,
};

const STORAGE_KEY = "campusone.pinnedTools";

export default function AcademicTools() {
  const [pinnedTools, setPinnedTools] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features"); // 'features' | 'custom'

  // Custom link form
  const [customTitle, setCustomTitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [formError, setFormError] = useState("");

  // Load pinned tools from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPinnedTools(parsed);
        }
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  // Save pinned tools to localStorage
  const savePinned = (newList) => {
    setPinnedTools(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch {
      // ignore storage errors
    }
  };

  const isFeaturePinned = (id) => pinnedTools.some((t) => t.id === id);

  const togglePinFeature = (feature) => {
    if (isFeaturePinned(feature.id)) {
      savePinned(pinnedTools.filter((t) => t.id !== feature.id));
    } else {
      savePinned([
        ...pinnedTools,
        {
          id: feature.id,
          title: feature.title,
          iconName: feature.iconName,
          path: feature.path,
          iconBg: feature.iconBg,
          isExternal: false,
        },
      ]);
    }
  };

  const handleAddCustomLink = (e) => {
    e.preventDefault();
    setFormError("");
    const cleanTitle = customTitle.trim();
    let cleanUrl = customUrl.trim();

    if (!cleanTitle) {
      setFormError("Please enter a name for this tool.");
      return;
    }
    if (!cleanUrl) {
      setFormError("Please enter a URL.");
      return;
    }
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://") && !cleanUrl.startsWith("/")) {
      cleanUrl = "https://" + cleanUrl;
    }

    const newCustomTool = {
      id: "custom-" + Date.now(),
      title: cleanTitle,
      iconName: "Globe",
      path: cleanUrl,
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
      isExternal: cleanUrl.startsWith("http"),
    };

    savePinned([...pinnedTools, newCustomTool]);
    setCustomTitle("");
    setCustomUrl("");
    setModalOpen(false);
  };

  const removeTool = (id, e) => {
    e.stopPropagation();
    savePinned(pinnedTools.filter((t) => t.id !== id));
  };

  const handleToolClick = (tool) => {
    if (tool.isExternal || tool.path.startsWith("http://") || tool.path.startsWith("https://")) {
      window.open(tool.path, "_blank", "noopener,noreferrer");
    } else {
      navigate(tool.path);
    }
  };

  const allTools = [...DEFAULT_TOOLS, ...pinnedTools];

  return (
    <AppShell activeKey="tools" title="Tools">
      <div className="mx-auto max-w-4xl px-3 py-1 sm:px-6 sm:py-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Tools</h2>
        </div>

        {/* 1. The 3 Fixed Core Tools */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {DEFAULT_TOOLS.map((tool) => {
            const IconComp = ICON_MAP[tool.iconName] || Globe;

            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="group relative flex aspect-square flex-col items-center justify-center rounded-md border border-brd bg-surface p-2.5 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm active:translate-y-0 sm:p-4 cursor-pointer select-none"
              >
                <div
                  className={`mb-2 flex h-11 w-11 items-center justify-center rounded-md transition-transform duration-150 group-hover:scale-105 sm:mb-2.5 sm:h-14 sm:w-14 ${
                    tool.iconBg || "bg-brand/10 text-brand"
                  }`}
                >
                  <IconComp className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="line-clamp-1 text-xs font-bold text-ink group-hover:text-brand sm:text-sm">
                  {tool.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Subtle Separator */}
        <div className="my-3 sm:my-4 border-t border-brd" />

        {/* 2. Pinned Shortcuts & Add Tool */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-5">
          {pinnedTools.map((tool) => {
            const IconComp = ICON_MAP[tool.iconName] || Globe;

            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="group relative flex aspect-square flex-col items-center justify-center rounded-md border border-brd bg-surface p-2.5 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm active:translate-y-0 sm:p-4 cursor-pointer select-none"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => removeTool(tool.id, e)}
                  title="Remove shortcut"
                  className="absolute top-1.5 right-1.5 inline-flex h-5 w-5 items-center justify-center rounded bg-surface-2 text-ink-3 opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger group-hover:opacity-100 sm:top-2 sm:right-2"
                >
                  <X size={12} />
                </button>

                <div
                  className={`mb-2 flex h-11 w-11 items-center justify-center rounded-md transition-transform duration-150 group-hover:scale-105 sm:mb-2.5 sm:h-14 sm:w-14 ${
                    tool.iconBg || "bg-brand/10 text-brand"
                  }`}
                >
                  <IconComp className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="line-clamp-1 text-xs font-bold text-ink group-hover:text-brand sm:text-sm">
                  {tool.title}
                </h3>
              </div>
            );
          })}

          {/* Plus (+) Button to Add Features or Shortcuts */}
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setModalOpen(true);
            }}
            aria-label="Add new tool or shortcut"
            className="group relative flex aspect-square flex-col items-center justify-center rounded-md border-2 border-dashed border-brd bg-surface/40 p-2.5 text-center transition-all duration-150 hover:border-brand hover:bg-surface active:scale-95 sm:p-4 cursor-pointer select-none"
          >
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md border border-dashed border-brd bg-surface text-ink-3 transition-colors group-hover:border-brand/40 group-hover:text-brand sm:mb-2.5 sm:h-14 sm:w-14">
              <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="text-xs font-bold text-ink-2 group-hover:text-brand sm:text-sm">
              Add Tool
            </h3>
          </button>
        </div>

        {/* Modal to Add Features or Custom Shortcuts */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Tool"
          size="sm"
        >
          {/* Tab Selector */}
          <div className="mb-3 flex rounded-md border border-brd bg-surface-2 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("features")}
              className={`flex-1 rounded py-1 transition-colors ${
                activeTab === "features"
                  ? "bg-surface text-ink font-bold shadow-xs"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              Campus Features
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`flex-1 rounded py-1 transition-colors ${
                activeTab === "custom"
                  ? "bg-surface text-ink font-bold shadow-xs"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              Custom Link
            </button>
          </div>

          {/* 1. Campus Features Grid */}
          {activeTab === "features" && (
            <div className="grid grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto p-0.5">
              {CAMPUS_FEATURES_CATALOG.map((feat) => {
                const IconC = ICON_MAP[feat.iconName] || Globe;
                const isPinned = isFeaturePinned(feat.id);

                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => togglePinFeature(feat)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-md border p-2 text-center transition-all ${
                      isPinned
                        ? "border-brand bg-brand-50/50 text-brand dark:bg-brand-950/20"
                        : "border-brd bg-surface hover:bg-surface-2 text-ink"
                    }`}
                  >
                    {isPinned && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}

                    <div className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-md ${feat.iconBg}`}>
                      <IconC size={18} />
                    </div>

                    <span className="line-clamp-1 text-xs font-bold">{feat.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Custom Link Simple Form */}
          {activeTab === "custom" && (
            <form onSubmit={handleAddCustomLink} className="space-y-3">
              <Field label="Name" htmlFor="custom-title">
                <Input
                  id="custom-title"
                  placeholder="e.g. BUBT Annex, Moodle"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </Field>

              <Field label="URL" htmlFor="custom-url">
                <Input
                  id="custom-url"
                  placeholder="https://..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </Field>

              {formError && (
                <p className="text-xs font-semibold text-danger">{formError}</p>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-brd">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Link
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
