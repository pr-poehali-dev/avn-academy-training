import Icon from "@/components/ui/icon";
import { Section, UserRole, NAV_ITEMS } from "./types";
import { User } from "@/lib/api";
import { NotificationBell } from "./NotificationBell";

interface AppHeaderProps {
  role: UserRole;
  authUser: User;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export function AppHeader({
  role,
  authUser,
  sidebarOpen,
  onToggleSidebar,
  onLogout,
}: AppHeaderProps) {
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
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/84dc1cae-34e0-44b0-9785-f7d10f314ae9/files/41dd6dcd-ca3d-4d2c-a29f-b653ac515b0e.jpg"
              alt="Эмблема АВНГ"
              className="w-10 h-10 object-contain rounded-full border border-primary/30 bg-tactical-card"
            />
            <div>
              <h1 className="font-oswald text-base font-semibold tracking-widest uppercase text-foreground leading-none">
                РОСГВАРДИЯ АВНГ
              </h1>
              <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase leading-none mt-0.5">
                Учебный портал · v1.0
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-tactical-border bg-tactical-card px-3 py-1.5">
            <div className="w-5 h-5 bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Icon
                name={role === "instructor" ? "Shield" : "User"}
                size={10}
                className="text-primary"
              />
            </div>
            <div className="hidden md:block">
              <span className="rank-badge text-foreground">
                {authUser.name}
              </span>
              <span className="rank-badge text-muted-foreground ml-2">
                [{authUser.static_id}]
              </span>
            </div>
          </div>
          <NotificationBell />
          <button
            onClick={onLogout}
            title="Выйти"
            className="text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Icon name="LogOut" size={16} />
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

export function AppSidebar({
  section,
  role,
  sidebarOpen,
  onNavigate,
  onClose,
}: AppSidebarProps) {
  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(role));
  return (
    <>
      <aside
        className={`
        fixed md:relative inset-y-0 left-0 z-30 md:z-auto
        w-56 bg-tactical-panel border-r border-tactical-border flex-shrink-0
        transform transition-transform duration-300 md:translate-x-0
        top-14 md:top-auto bottom-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col items-center py-5 border-b border-tactical-border mb-2">
          <img
            src="https://cdn.poehali.dev/projects/84dc1cae-34e0-44b0-9785-f7d10f314ae9/files/41dd6dcd-ca3d-4d2c-a29f-b653ac515b0e.jpg"
            alt="Эмблема АВНГ"
            className="w-16 h-16 object-contain rounded-full border border-primary/40 bg-tactical-card shadow-lg"
            style={{ boxShadow: "0 0 16px rgba(160,30,45,0.25)" }}
          />
          <p className="font-oswald text-xs tracking-[0.2em] uppercase text-primary mt-2">
            РОСГВАРДИЯ АВНГ
          </p>
        </div>
        <nav className="p-2 space-y-0.5">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors group
                ${
                  section === item.id
                    ? "nav-item-active text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                }`}
            >
              <Icon
                name={item.icon}
                size={15}
                className={
                  section === item.id
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary transition-colors"
                }
              />
              <span className="font-ibm text-sm leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className="border border-tactical-border bg-tactical-card p-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="rank-badge text-green-400">Система активна</span>
            </div>
            <p className="rank-badge text-muted-foreground">
              11.06.2026 · База А-7
            </p>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden top-14"
          onClick={onClose}
        />
      )}
    </>
  );
}