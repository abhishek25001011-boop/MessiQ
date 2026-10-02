import { CalendarDays, ChartNoAxesCombined, UtensilsCrossed } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useMealSelectionRecords, type MealType } from "@/hooks/useMealSelectionRecords";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AIPredictions() {
  const { records, role, isLoading, error } = useMealSelectionRecords();
  const today = getLocalDateString();
  const history = records.filter((record) => record.date <= today);
  const demandSelections = history.filter((record) => record.choice !== "no");
  const counts = mealTypes.map(({ key, label }) => ({
    key,
    label,
    selections: demandSelections.filter((record) => record.mealType === key).length,
  }));
  const recordedDates = [...new Set(history.map((record) => record.date))].sort();
  const recentDates = recordedDates.slice(-7);
  const trend = recentDates.map((date) => ({
    date: formatDate(date),
    selections: demandSelections.filter((record) => record.date === date).length,
  }));
  const totalDemand = demandSelections.length;
  const mostSelected = counts.reduce((best, current) => current.selections > best.selections ? current : best, counts[0]);
  const leastSelected = counts.reduce((least, current) => current.selections < least.selections ? current : least, counts[0]);
  const hasEnoughHistory = recentDates.length >= 3;
  const estimatedDailyDemand = hasEnoughHistory
    ? Math.round(trend.reduce((sum, day) => sum + day.selections, 0) / trend.length)
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ChartNoAxesCombined className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Meal demand insights</p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">AI Predictions</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {role === "admin" ? "Campus-wide" : "Your"} meal selection history. Trends below are calculated from recorded Firestore choices, not an ML model.
        </p>
      </header>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground" role="status">Loading meal selection history...</div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{error}</div>
      ) : history.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-semibold">Not enough historical data for predictions.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Meal selection history will appear here after choices are saved in Firestore. A simple demand trend needs selections recorded on at least three different dates.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Requested Meals" value={totalDemand} subtitle="Yes or custom meal choices" icon={UtensilsCrossed} />
            <StatCard title="Most Requested" value={totalDemand ? mostSelected.label : "—"} subtitle={totalDemand ? `${mostSelected.selections} recorded choices` : "No affirmative choices"} icon={ChartNoAxesCombined} gradient="warm" />
            <StatCard title="Least Requested" value={totalDemand ? leastSelected.label : "—"} subtitle={totalDemand ? `${leastSelected.selections} recorded choices` : "No affirmative choices"} icon={ChartNoAxesCombined} gradient="cool" />
            <StatCard title="Recorded Dates" value={recordedDates.length} subtitle="Dates with saved choices" icon={CalendarDays} />
          </div>

          <section className="glass-card rounded-xl p-4 sm:p-6" aria-labelledby="meal-breakdown-heading">
            <h2 id="meal-breakdown-heading" className="font-display text-lg font-semibold">Meal type participation</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Affirmative selections (yes or custom) in the available history.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {counts.map(({ key, label, selections }) => (
                <div key={key} className="rounded-lg border bg-card/70 p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{selections}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-xl p-4 sm:p-6" aria-labelledby="demand-trend-heading">
            <h2 id="demand-trend-heading" className="font-display text-lg font-semibold">Recent selection trend</h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Real Firestore selections grouped by the latest recorded dates.</p>
            <div className="h-64 w-full" role="img" aria-label="Bar chart of meal selections by recorded date">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="selections" name="Requested meals" fill="hsl(var(--chart-green))" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {hasEnoughHistory ? (
            <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5" aria-labelledby="trend-estimate-heading">
              <h2 id="trend-estimate-heading" className="font-semibold">Statistical trend — not an ML prediction</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on the latest {recentDates.length} dates with recorded choices, the average was {estimatedDailyDemand} requested meals per recorded date. This simple historical average is a reference only; it does not predict certainty or account for dates with no saved records.
              </p>
            </section>
          ) : (
            <section className="rounded-xl border bg-card/60 p-4 text-sm text-muted-foreground" aria-live="polite">
              Not enough historical data for a demand estimate. At least three different dates with saved meal choices are needed.
            </section>
          )}
        </>
      )}
    </div>
  );
}
