import { AlertCircle, Leaf, Recycle, UtensilsCrossed } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useMealSelectionRecords, type MealType } from "@/hooks/useMealSelectionRecords";

const mealTypes: { key: MealType; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
  { key: "dinner", label: "Dinner" },
];

function getLocalDateString() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function WasteDashboard() {
  const { records, role, isLoading, error } = useMealSelectionRecords();
  const today = getLocalDateString();
  const todayRecords = records.filter((record) => record.date === today);
  const requestedToday = todayRecords.filter((record) => record.choice !== "no");
  const skippedToday = todayRecords.filter((record) => record.choice === "no");

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Waste Reduction</h1>
        <p className="mt-1 text-sm text-muted-foreground">Meal choices can help plan demand; they do not measure food served, consumed, or wasted.</p>
      </header>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground" role="status">Loading meal selection data...</div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{error}</div>
      ) : records.length === 0 ? (
        <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground">
          No meal selections are recorded yet. Saved student choices will provide demand context here.
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{role === "admin" ? "Campus-wide" : "Your"} figures below are real Firestore meal selections, not waste measurements.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard title="Requested Meals Today" value={requestedToday.length} subtitle="Yes or custom choices" icon={UtensilsCrossed} />
            <StatCard title="Skipped Meal Choices" value={skippedToday.length} subtitle="Recorded no responses" icon={Leaf} gradient="cool" />
            <StatCard title="Selection History" value={records.length} subtitle="Firestore choice records" icon={Recycle} gradient="warm" />
          </div>
        </>
      )}

      <section className="glass-card rounded-2xl border-dashed p-6 sm:p-8" aria-labelledby="waste-data-heading">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 id="waste-data-heading" className="font-display text-lg font-semibold">Actual waste tracking is unavailable</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The current Firestore schema records meal preferences only. It does not record quantities prepared, served, consumed, or discarded, so waste totals and reduction trends cannot be calculated honestly.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            To enable waste analytics, the system would need verified meal-served and leftover/waste measurements for each service period.
          </p>
        </div>
      </section>

      {records.length > 0 && (
        <section className="glass-card rounded-xl p-4 sm:p-6" aria-labelledby="selection-context-heading">
          <h2 id="selection-context-heading" className="font-display text-lg font-semibold">Meal selection context</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Affirmative choices by meal type across the accessible recorded history.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {mealTypes.map(({ key, label }) => (
              <div key={key} className="rounded-lg border bg-card/70 p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{records.filter((record) => record.mealType === key && record.choice !== "no").length}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
