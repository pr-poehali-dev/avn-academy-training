import Icon from "@/components/ui/icon";
import { Section, UserRole, NAV_ITEMS } from "./types";

interface AppHeaderProps {
  role: UserRole;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRoleChange: (role: UserRole) => void;
}

export function AppHeader({ role, sidebarOpen, onToggleSidebar, onRoleChange }: AppHeaderProps) {
  return (
    <header className="border-b border-tactical-border bg-tactical-panel flex-shrink-0 z-20 relative">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={onToggleSidebar}
          >
            <Icon name="Menu" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Icon name="Shield" size={14} className="text-primary" />
            </div>
            <div>
              <h1 className="font-oswald text-base font-semibold tracking-widest uppercase text-foreground leading-none">
                АКАДЕМИЯ АВНГ
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase leading-none mt-0.5">
                Учебный портал · v1.0
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 border border-tactical-border bg-tactical-card px-1 py-1">
            {(["cadet", "instructor"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`rank-badge px-3 py-1 transition-colors ${role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "cadet" ? "Курсант" : "Инструктор"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border border-tactical-border bg-tactical-card px-3 py-1.5">
            <div className="w-5 h-5 bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Icon name="User" size={10} className="text-primary" />
            </div>
            <span className="rank-badge text-foreground hidden md:block">
              {role === "cadet" ? "Алексеев А.В." : "Кап. Воронов В.И."}
            </span>
          </div>
          <button className="text-muted-foreground hover:text-yellow-400 transition-colors relative">
            <Icon name="Bell" size={16} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 text-[7px] font-bold text-black flex items-center justify-center rounded-full">3</span>
          </button>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  );
}

interface AppSidebarProps {
  section: Section;
  role: UserRole;
  sidebarOpen: boolean;
  onNavigate: (s: Section) => void;
  onClose: () => void;
}

export function AppSidebar({ section, role, sidebarOpen, onNavigate, onClose }: AppSidebarProps) {
  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(role));
  return (
    <>
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 md:z-auto
        w-56 bg-tactical-panel border-r border-tactical-border flex-shrink-0
        transform transition-transform duration-300 md:translate-x-0
        top-14 md:top-auto bottom-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <nav className="p-2 space-y-0.5 pt-4">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors group
                ${section === item.id
                  ? "nav-item-active text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                }`}
            >
              <Icon
                name={item.icon}
                size={15}
                className={section === item.id ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}
              />
              <span className="font-ibm text-sm leading-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className="border border-tactical-border bg-tactical-card p-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="rank-badge text-green-400">Система активна</span>
            </div>
            <p className="rank-badge text-muted-foreground">11.06.2026 · База А-7</p>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden top-14" onClick={onClose} />
      )}
    </>
  );
}
