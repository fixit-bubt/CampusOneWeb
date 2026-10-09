import React, { useState, useEffect, useRef } from "react";
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
import { useApp } from "../../data/store.jsx";

// Core default tools (always available)
const DEFAULT_TOOLS = [
  {
    id: "cover-page",
    title: "Cover Page",
    subtitle: "Assignment & Lab",
    iconName: "FileBadge",
    path: "/cover-page",
    iconBg: "bg-surface-2 text-ink border border-brd",
    glowBorder: "hover:border-ink-3",
    badge: "Instant PDF",
    badgeTone: "bg-surface-3 text-ink-2",
    isDefault: true,
  },
  {
    id: "pdf-maker",
    title: "PDF Maker",
    subtitle: "Merge & Compress",
    iconName: "FileStack",
    path: "/pdf-maker",
    iconBg: "bg-surface-2 text-ink border border-brd",
    glowBorder: "hover:border-ink-3",
    badge: "Client-side",
    badgeTone: "bg-surface-3 text-ink-2",
    isDefault: true,
  },
  {
    id: "cgpa",
    title: "CGPA Calculator",
    subtitle: "Semester & Total",
    iconName: "Calculator",
    path: "/cgpa",
    iconBg: "bg-surface-2 text-ink border border-brd",
    glowBorder: "hover:border-ink-3",
    badge: "BUBT 4.0",
    badgeTone: "bg-surface-3 text-ink-2",
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
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "calendar",
    title: "Academic Calendar",
    iconName: "CalendarRange",
    path: "/calendar",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "study-hub",
    title: "Study Hub",
    iconName: "BookMarked",
    path: "/study-hub",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "annex",
    title: "Annex Portal",
    iconName: "ExternalLink",
    path: "/annex",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "bus",
    title: "Bus Schedule",
    iconName: "Bus",
    path: "/bus",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "prayer",
    title: "Prayer Times",
    iconName: "Moon",
    path: "/prayer",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "lost-found",
    title: "Lost & Found",
    iconName: "PackageSearch",
    path: "/lost-found",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    iconName: "Store",
    path: "/marketplace",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "blood",
    title: "Blood Registry",
    iconName: "Droplet",
    path: "/blood",
    iconBg: "bg-surface-2 text-ink border border-brd",
  },
  {
    id: "faculty",
    title: "Faculty Directory",
    iconName: "GraduationCap",
    path: "/faculty",
    iconBg: "bg-surface-2 text-ink border border-brd",
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
  const { currentUser, updatePinnedTools } = useApp();
  const [pinnedTools, setPinnedTools] = useState(() => {
    if (Array.isArray(currentUser?.pinnedTools) && currentUser.pinnedTools.length > 0) {
      return currentUser.pinnedTools;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore parsing errors
    }
    return [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("features"); // 'features' | 'custom'

  // Custom link form
  const [customTitle, setCustomTitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [formError, setFormError] = useState("");

  const autoMigratedRef = useRef(false);

  // Sync between user profile in Supabase and local cache
  useEffect(() => {
    if (!currentUser) return;
    const dbTools = Array.isArray(currentUser.pinnedTools) ? currentUser.pinnedTools : [];

    let localTools = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localTools = parsed;
      }
    } catch {
      // ignore parsing errors
    }

    if (dbTools.length > 0) {
      // Database has user's tools -> ensure local state and local cache match
      setPinnedTools(dbTools);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbTools));
      } catch {
        // ignore storage errors
      }
    } else if (localTools.length > 0 && !autoMigratedRef.current) {
      // Phone/browser had tools saved locally before cloud sync was added -> auto-migrate to DB
      autoMigratedRef.current = true;
      setPinnedTools(localTools);
      if (updatePinnedTools) {
        updatePinnedTools(localTools);
      }
    }
  }, [currentUser?.id, currentUser?.pinnedTools, updatePinnedTools]);

  // Save pinned tools to state, localStorage, and Supabase
  const savePinned = (newList) => {
    setPinnedTools(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch {
      // ignore storage errors
    }
    if (updatePinnedTools) {
      updatePinnedTools(newList);
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
      iconBg: "bg-surface-2 text-ink border border-brd",
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
      <div className="mx-auto max-w-4xl px-3 py-1 sm:px-6 sm:py-2">
        <div className="mb-2 sm:mb-2.5 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">Tools</h2>
        </div>

        {/* 1. The 3 Fixed Core Tools */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {DEFAULT_TOOLS.map((tool) => {
            const IconComp = ICON_MAP[tool.iconName] || Globe;

            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="group relative flex aspect-square flex-col items-center justify-center rounded-md border border-brd bg-surface p-2.5 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-sm active:translate-y-0 sm:p-4 cursor-pointer select-none"
              >
                <div
                  className={`mb-2 flex h-11 w-11 items-center justify-center rounded-md transition-transform duration-150 group-hover:scale-105 sm:mb-2.5 sm:h-14 sm:w-14 ${
                    tool.iconBg || "bg-surface-2 text-ink border border-brd"
                  }`}
                >
                  <IconComp className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="line-clamp-1 text-xs font-bold text-ink sm:text-sm">
                  {tool.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Subtle Separator */}
        <div className="my-2.5 sm:my-3 border-t border-brd" />

        {/* 2. Pinned Shortcuts & Add Tool */}
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
          {pinnedTools.map((tool) => {
            const IconComp = ICON_MAP[tool.iconName] || Globe;

            return (
              <div
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="group relative flex aspect-square flex-col items-center justify-center rounded-md border border-brd bg-surface p-2.5 text-center shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-sm active:translate-y-0 sm:p-4 cursor-pointer select-none"
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
                    tool.iconBg || "bg-surface-2 text-ink border border-brd"
                  }`}
                >
                  <IconComp className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="line-clamp-1 text-xs font-bold text-ink sm:text-sm">
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
