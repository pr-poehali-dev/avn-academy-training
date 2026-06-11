import Icon from "@/components/ui/icon";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: "Одобрено", cls: "text-green-400 bg-green-900/30 border-green-800" },
    pending: { label: "На рассмотрении", cls: "text-yellow-400 bg-yellow-900/30 border-yellow-800" },
    rejected: { label: "Отклонено", cls: "text-red-400 bg-red-900/30 border-red-800" },
  };
  const s = map[status] ?? { label: status, cls: "text-gray-400 bg-gray-900/30 border-gray-700" };
  return (
    <span className={`rank-badge px-2 py-0.5 border rounded ${s.cls}`}>{s.label}</span>
  );
}

export function GradeCircle({ grade }: { grade: number }) {
  const color = grade >= 5 ? "text-green-400" : grade >= 4 ? "text-yellow-400" : grade >= 3 ? "text-orange-400" : "text-red-400";
  return (
    <div className={`w-10 h-10 border flex items-center justify-center font-oswald text-xl font-bold border-current ${color}`}>
      {grade}
    </div>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 pb-3 border-b border-tactical-border">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-primary" />
        <div>
          <h2 className="font-oswald text-2xl font-semibold tracking-widest text-foreground uppercase">{title}</h2>
          {sub && <p className="text-muted-foreground text-sm font-ibm mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: string; accent?: string }) {
  return (
    <div className="corner-mark bg-tactical-card border border-tactical-border p-4 card-glow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-ibm uppercase tracking-widest mb-1">{label}</p>
          <p className={`font-oswald text-3xl font-bold ${accent ?? "text-foreground"}`}>{value}</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
      </div>
    </div>
  );
}
