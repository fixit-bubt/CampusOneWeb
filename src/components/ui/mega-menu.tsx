import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type MegaMenuSubItem = {
  label: string;
  description?: string;
  icon: React.ElementType;
  path?: string;
  badge?: number | string;
  isActive?: boolean;
  onClick?: () => void;
};

export type MegaMenuItem = {
  id: number | string;
  label: string;
  items?: MegaMenuSubItem[];
  subMenus?: {
    title: string;
    items: MegaMenuSubItem[];
  }[];
  link?: string;
  isActive?: boolean;
  badge?: number | string;
  align?: "left" | "right";
  onClick?: () => void;
};

export interface MegaMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  items: MegaMenuItem[];
  className?: string;
}

const MegaMenu = React.forwardRef<HTMLUListElement, MegaMenuProps>(
  ({ items, className, ...props }, ref) => {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const [isHover, setIsHover] = React.useState<number | string | null>(null);
    const containerRef = React.useRef<HTMLUListElement | null>(null);

    React.useImperativeHandle(ref, () => containerRef.current!);

    React.useEffect(() => {
      if (!openMenu) return;
      const onDown = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpenMenu(null);
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpenMenu(null);
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [openMenu]);

    const handleHover = (menuLabel: string | null) => {
      setOpenMenu(menuLabel);
    };

    return (
      <ul
        ref={containerRef}
        className={`relative flex items-center space-x-0.5 ${className || ""}`}
        {...props}
      >
        {items.map((navItem) => {
          const isCurrentActive = Boolean(navItem.isActive);
          const isOpen = openMenu === navItem.label;
          const isHovered = isHover === navItem.id;
          const hasDropdown = Boolean(
            (navItem.items && navItem.items.length > 0) ||
            (navItem.subMenus && navItem.subMenus.length > 0)
          );

          return (
            <li
              key={navItem.label}
              className="relative"
              onMouseEnter={() => handleHover(navItem.label)}
              onMouseLeave={() => handleHover(null)}
            >
              <button
                type="button"
                onClick={() => {
                  if (navItem.onClick) {
                    handleHover(null);
                    navItem.onClick();
                  } else if (hasDropdown) {
                    setOpenMenu((prev) => (prev === navItem.label ? null : navItem.label));
                  }
                }}
                className={`relative flex cursor-pointer items-center justify-center gap-1 py-1.5 px-2.5 text-xs sm:text-sm transition-colors duration-200 group font-semibold rounded-full ${
                  isCurrentActive
                    ? "text-white bg-brand shadow-xs"
                    : "text-white/80 hover:text-white"
                }`}
                onMouseEnter={() => setIsHover(navItem.id)}
                onMouseLeave={() => setIsHover(null)}
              >
                <span className="relative z-10">{navItem.label}</span>
                {Boolean(navItem.badge) && (
                  <span className="relative z-10 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-none text-white">
                    {navItem.badge}
                  </span>
                )}
                {hasDropdown && (
                  <ChevronDown
                    className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 text-white/70 group-hover:rotate-180 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
                {(isHovered || isOpen) && !isCurrentActive && (
                  <motion.div
                    layoutId="hover-bg"
                    className="absolute inset-0 size-full bg-white/10"
                    style={{
                      borderRadius: 99,
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {isOpen && hasDropdown && (
                  <div
                    className={`absolute top-full w-auto pt-2 z-50 ${
                      navItem.align === "right" ? "right-0" : "left-0"
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="w-72 max-w-[90vw] rounded-2xl border border-brd bg-surface p-2 shadow-2xl"
                      layoutId="menu"
                    >
                      {navItem.items && navItem.items.length > 0 ? (
                        <ul className="space-y-1">
                          {navItem.items.map((item) => {
                            const Icon = item.icon;
                            const isSubActive = Boolean(item.isActive);
                            return (
                              <li key={item.label}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleHover(null);
                                    if (item.onClick) item.onClick();
                                  }}
                                  className={`flex w-full items-center space-x-3 rounded-xl p-2 text-left transition-colors duration-150 group ${
                                    isSubActive
                                      ? "bg-surface-2 font-semibold"
                                      : "hover:bg-surface-2"
                                  }`}
                                >
                                  <div
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 ${
                                      isSubActive
                                        ? "border-brand bg-brand text-white"
                                        : "border-brd bg-surface-2 text-ink group-hover:bg-brand group-hover:text-white group-hover:border-brand"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4 flex-none" />
                                  </div>
                                  <div className="min-w-0 flex-1 leading-4">
                                    <div className="flex items-center gap-1.5">
                                      <p
                                        className={`truncate text-xs font-semibold transition-colors ${
                                          isSubActive
                                            ? "text-brand"
                                            : "text-ink group-hover:text-brand"
                                        }`}
                                      >
                                        {item.label}
                                      </p>
                                      {Boolean(item.badge) && (
                                        <span className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-3 transition-colors duration-150">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="flex w-fit shrink-0 space-x-6 overflow-hidden">
                          {navItem.subMenus?.map((sub) => (
                            <motion.div layout className="w-full min-w-[210px]" key={sub.title}>
                              {sub.title && (
                                <h3 className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-3 border-b border-brd pb-1">
                                  {sub.title}
                                </h3>
                              )}
                              <ul className="space-y-1">
                                {sub.items.map((item) => {
                                  const Icon = item.icon;
                                  const isSubActive = Boolean(item.isActive);
                                  return (
                                    <li key={item.label}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleHover(null);
                                          if (item.onClick) item.onClick();
                                        }}
                                        className={`flex w-full items-start space-x-3 rounded-lg p-2 text-left transition-colors duration-150 group ${
                                          isSubActive
                                            ? "bg-surface-2 font-semibold"
                                            : "hover:bg-surface-2"
                                        }`}
                                      >
                                        <div
                                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 ${
                                            isSubActive
                                              ? "border-brand bg-brand text-white"
                                              : "border-brd bg-surface-2 text-ink group-hover:bg-brand group-hover:text-white group-hover:border-brand"
                                          }`}
                                        >
                                          <Icon className="h-4 w-4 flex-none" />
                                        </div>
                                        <div className="min-w-0 flex-1 leading-4">
                                          <div className="flex items-center gap-1.5">
                                            <p
                                              className={`truncate text-xs font-semibold transition-colors ${
                                                isSubActive
                                                  ? "text-brand"
                                                  : "text-ink group-hover:text-brand"
                                              }`}
                                            >
                                              {item.label}
                                            </p>
                                            {Boolean(item.badge) && (
                                              <span className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                                                {item.badge}
                                              </span>
                                            )}
                                          </div>
                                          {item.description && (
                                            <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-3 transition-colors duration-150">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    );
  }
);

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;
