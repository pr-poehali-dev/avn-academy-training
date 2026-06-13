import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { SectionHeader } from "./UIComponents";
import { fetchRatings, rateInstructor, InstructorRating } from "@/lib/api";
import { Spinner, Empty } from "./SectionsShared";

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR RATING VIEW (для вкладки инструктора)
// ═══════════════════════════════════════════════════════════════════════════════
export function InstructorRatingView({ instructorId }: { instructorId: number }) {
  const [data, setData] = useState<{ instructors: InstructorRating[]; my_ratings: Record<number, { rating: number; comment: string | null }> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const me = data?.instructors.find((i) => i.id === instructorId);

  const renderStars = (rating: number | null) => {
    const val = rating ?? 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Icon key={s} name="Star" size={14} className={s <= Math.round(val) ? "text-yellow-400" : "text-muted-foreground/30"} />
        ))}
      </div>
    );
  };

  if (loading) return <Spinner />;
  if (!me) return <Empty text="Данные рейтинга не найдены" />;

  return (
    <div className="animate-fade-in space-y-4">
      <div className="bg-tactical-card border border-primary/30 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-2">
            <Icon name="Shield" size={28} className="text-primary" />
          </div>
          <p className="font-oswald text-base text-foreground tracking-wide">{me.rank} {me.name}</p>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-tactical-panel border border-tactical-border p-3 text-center">
            <p className="font-oswald text-3xl text-yellow-400">{me.avg_rating?.toFixed(1) ?? "—"}</p>
            <p className="rank-badge text-muted-foreground mt-1">Средний балл</p>
            {me.avg_rating && <div className="flex justify-center mt-1">{renderStars(me.avg_rating)}</div>}
          </div>
          <div className="bg-tactical-panel border border-tactical-border p-3 text-center">
            <p className="font-oswald text-3xl text-primary">{me.rating_count}</p>
            <p className="rank-badge text-muted-foreground mt-1">Оценок получено</p>
          </div>
          <div className="bg-tactical-panel border border-tactical-border p-3 text-center">
            <p className="font-oswald text-3xl text-green-400">
              #{(data?.instructors.findIndex((i) => i.id === instructorId) ?? 0) + 1}
            </p>
            <p className="rank-badge text-muted-foreground mt-1">Место в рейтинге</p>
          </div>
        </div>
      </div>

      <h3 className="font-oswald text-sm tracking-widest uppercase text-muted-foreground">Рейтинг всех инструкторов</h3>
      <div className="bg-tactical-card border border-tactical-border overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-tactical-border bg-tactical-panel">
              <th className="text-center px-3 py-3 rank-badge text-muted-foreground w-10">#</th>
              <th className="text-left px-4 py-3 rank-badge text-muted-foreground">Инструктор</th>
              <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Рейтинг</th>
              <th className="text-center px-4 py-3 rank-badge text-muted-foreground">Оценок</th>
            </tr>
          </thead>
          <tbody>
            {data?.instructors.map((inst, idx) => (
              <tr key={inst.id} className={`border-b border-tactical-border last:border-0 transition-colors ${inst.id === instructorId ? "bg-primary/10" : "hover:bg-primary/5"}`}>
                <td className="px-3 py-3 text-center font-oswald text-sm text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-ibm text-foreground">{inst.rank} {inst.name}</p>
                  {inst.unit && <p className="text-xs text-muted-foreground font-mono">{inst.unit}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  {inst.avg_rating ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-oswald text-yellow-400">{inst.avg_rating.toFixed(1)}</span>
                      {renderStars(inst.avg_rating)}
                    </div>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-center text-sm font-mono text-muted-foreground">{inst.rating_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR RATINGS (для курсантов)
// ═══════════════════════════════════════════════════════════════════════════════
export function InstructorRatings() {
  const [data, setData] = useState<{ instructors: InstructorRating[]; my_ratings: Record<number, { rating: number; comment: string | null }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [success, setSuccess] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const d = await fetchRatings().catch(() => null);
    setData(d);
    if (d) {
      const init: Record<number, number> = {};
      Object.entries(d.my_ratings).forEach(([k, v]) => { init[Number(k)] = v.rating; });
      setSelected(init);
      const initC: Record<number, string> = {};
      Object.entries(d.my_ratings).forEach(([k, v]) => { initC[Number(k)] = v.comment ?? ""; });
      setComments(initC);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRate = async (instructorId: number) => {
    const rating = selected[instructorId];
    if (!rating) return;
    setSubmitting(instructorId);
    await rateInstructor(instructorId, rating, comments[instructorId] || undefined).catch(() => {});
    setSuccess(instructorId);
    setTimeout(() => setSuccess(null), 2000);
    setSubmitting(null);
    await load();
  };

  const renderStars = (instructorId: number, currentRating: number | null) => {
    const val = selected[instructorId] ?? 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setSelected((prev) => ({ ...prev, [instructorId]: s }))}
            className="transition-transform hover:scale-110"
          >
            <Icon name="Star" size={18} className={s <= val ? "text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400/50"} />
          </button>
        ))}
        {currentRating && (
          <span className="ml-2 text-xs text-muted-foreground font-mono">ср. {currentRating.toFixed(1)}</span>
        )}
      </div>
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <SectionHeader title="Оценка инструкторов" sub="Поставь оценку своим инструкторам" />
      {!data || data.instructors.length === 0 ? (
        <Empty text="Инструкторов не найдено" />
      ) : (
        <div className="space-y-3">
          {data.instructors.map((inst) => {
            const myRating = data.my_ratings[inst.id];
            return (
              <div key={inst.id} className="bg-tactical-card border border-tactical-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Shield" size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-ibm text-sm font-semibold text-foreground">{inst.rank} {inst.name}</p>
                      {inst.unit && <p className="text-xs text-muted-foreground font-mono">{inst.unit}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-oswald text-xl text-yellow-400">{inst.avg_rating?.toFixed(1) ?? "—"}</p>
                    <p className="rank-badge text-muted-foreground">{inst.rating_count} оценок</p>
                  </div>
                </div>
                <div className="border-t border-tactical-border pt-3 space-y-2">
                  <p className="rank-badge text-muted-foreground">{myRating ? "Ваша оценка:" : "Оценить:"}</p>
                  {renderStars(inst.id, inst.avg_rating)}
                  <input
                    className="w-full bg-tactical-panel border border-tactical-border px-3 py-1.5 text-xs text-foreground font-ibm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Комментарий (необязательно)..."
                    value={comments[inst.id] ?? ""}
                    onChange={(e) => setComments((prev) => ({ ...prev, [inst.id]: e.target.value }))}
                  />
                  <button
                    disabled={!selected[inst.id] || submitting === inst.id}
                    onClick={() => handleRate(inst.id)}
                    className="bg-primary text-primary-foreground font-oswald text-xs tracking-widest uppercase py-1.5 px-4 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {submitting === inst.id ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="Send" size={12} />}
                    {myRating ? "Обновить оценку" : "Отправить оценку"}
                  </button>
                  {success === inst.id && (
                    <p className="text-xs text-green-400 font-mono flex items-center gap-1">
                      <Icon name="Check" size={12} />Оценка сохранена
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
