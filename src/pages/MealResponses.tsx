import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleHelp, Download, Settings2, XCircle } from "lucide-react";
import { auth, db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/StatCard";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  buildDailyResponseAnalytics,
  buildMealResponseRows,
  calculateMealResponseStats,
  exportMealResponsesToCSV,
  getDateRange,
  getPaymentStatus,
  mealTypes,
  type MealChoice,
  type MealResponseLabel,
  type MealResponseRecord,
  type MealResponseRow,
  type MealResponseStudent,
  type MealType,
} from "@/lib/mealResponses";

type DatedRecord = MealResponseRecord & { date: string };
type DatePreset = "today" | "yesterday" | "7days" | "30days" | "custom";
const choiceOptions: MealResponseLabel[] = ["Yes", "Custom", "Skipped", "No response"];
const mealLabels: Record<MealType, string> = { breakfast: "Breakfast", lunch: "Lunch", snacks: "Snacks", dinner: "Dinner" };

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getRowChoice(row: MealResponseRow, mealType: MealType) {
  return row[mealType];
}

export default function MealResponses() {
  const today = localDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [students, setStudents] = useState<MealResponseStudent[]>([]);
  const [records, setRecords] = useState<MealResponseRecord[]>([]);
  const [history, setHistory] = useState<DatedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealFilter, setMealFilter] = useState<"all" | MealType>("all");
  const [choiceFilter, setChoiceFilter] = useState<"all" | MealResponseLabel>("all");
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<DatePreset>("7days");
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);

  useEffect(() => {
    let active = true;
    const user = auth.currentUser;
    if (!user) {
      setError("Sign in with an administrator account to view meal responses.");
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const range = getDateRange(preset, today, customStart, customEnd);
        if (!range.start || !range.end || range.start > range.end) {
          throw new Error("Choose a valid date range.");
        }
        const usersQuery = query(collection(db, "users"), where("role", "==", "student"));
        const selectedQuery = query(collection(db, "mealSelections"), where("date", "==", selectedDate));
        const historyQuery = query(
          collection(db, "mealSelections"),
          where("date", ">=", range.start),
          where("date", "<=", range.end),
        );
        const [usersSnapshot, selectedSnapshot, historySnapshot] = await Promise.all([
          getDocs(usersQuery), getDocs(selectedQuery), getDocs(historyQuery),
        ]);
        if (!active || auth.currentUser?.uid !== user.uid) return;
        const loadedStudents = usersSnapshot.docs.map((userDoc) => {
          const data = userDoc.data();
          return {
            uid: userDoc.id,
            name: typeof data.name === "string" ? data.name : "",
            email: typeof data.email === "string" ? data.email : "",
            paymentStatus: getPaymentStatus(data.paymentStatus),
          };
        });
        const readRecord = (selection: (typeof selectedSnapshot.docs)[number], date: string): DatedRecord | null => {
          const data = selection.data();
          const mealType = data.mealType;
          const choice = data.choice;
          if (!loadedStudents.some(({ uid }) => uid === data.uid)) return null;
          if (!mealTypes.includes(mealType as MealType)) return null;
          if (choice !== "yes" && choice !== "custom" && choice !== "no") return null;
          return { uid: String(data.uid), date, mealType: mealType as MealType, choice: choice as MealChoice };
        };
        setStudents(loadedStudents);
        setRecords(selectedSnapshot.docs.map((item) => readRecord(item, selectedDate)).filter((item): item is DatedRecord => Boolean(item)));
        setHistory(historySnapshot.docs.map((item) => readRecord(item, String(item.data().date || ""))).filter((item): item is DatedRecord => Boolean(item)));
      } catch (loadError) {
        console.error("Failed to load meal responses:", loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : "Meal response data could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [selectedDate, preset, customStart, customEnd, today]);

  const rows = useMemo(() => buildMealResponseRows(students, records), [students, records]);
  const stats = useMemo(() => calculateMealResponseStats(rows), [rows]);
  const dailyCounts = useMemo(() => {
    const byType = Object.fromEntries(mealTypes.map((type) => [type, { yes: 0, custom: 0, skipped: 0, noResponse: 0 }])) as Record<MealType, { yes: number; custom: number; skipped: number; noResponse: number }>;
    for (const row of rows) {
      for (const type of mealTypes) {
        const value = row[type];
        if (value === "Yes") byType[type].yes++;
        else if (value === "Custom") byType[type].custom++;
        else if (value === "Skipped") byType[type].skipped++;
        else byType[type].noResponse++;
      }
    }
    return byType;
  }, [rows]);
  const dailyAnalytics = useMemo(() => {
    const range = getDateRange(preset, today, customStart, customEnd);
    return buildDailyResponseAnalytics(students, history.filter(({ date }) => date >= range.start && date <= range.end));
  }, [students, history, preset, today, customStart, customEnd]);
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !term || `${row.name} ${row.email}`.toLowerCase().includes(term);
      const types = mealFilter === "all" ? mealTypes : [mealFilter];
      const matchesChoice = choiceFilter === "all" || types.some((type) => getRowChoice(row, type) === choiceFilter);
      return matchesSearch && matchesChoice;
    });
  }, [rows, search, mealFilter, choiceFilter]);

  const summary = [
    ["Yes", stats.yes], ["Custom", stats.custom], ["Skipped", stats.skipped], ["No response", stats.noResponse],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Today's Meal Responses</h1>
        <p className="mt-1 text-sm text-muted-foreground">Student meal choices recorded in Firestore.</p>
      </header>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive" role="alert">{error}</div>}
      {loading && <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground" role="status">Loading meal responses...</div>}

      {!loading && !error && <>
        <section className="glass-card grid gap-4 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">Response date<Input className="mt-1" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></label>
          <label className="text-sm">Meal type<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={mealFilter} onChange={(event) => setMealFilter(event.target.value as "all" | MealType)}><option value="all">All</option>{mealTypes.map((type) => <option key={type} value={type}>{mealLabels[type]}</option>)}</select></label>
          <label className="text-sm">Choice<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={choiceFilter} onChange={(event) => setChoiceFilter(event.target.value as "all" | MealResponseLabel)}><option value="all">All</option>{choiceOptions.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
          <label className="text-sm">Student search<Input className="mt-1" placeholder="Name or email" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summary.map(([title, value]) => {
            const icons = { Yes: CheckCircle2, Custom: Settings2, Skipped: XCircle, "No response": CircleHelp };
            return <StatCard key={title} title={title} value={value} subtitle={`Selected date: ${selectedDate}`} icon={icons[title]} />;
          })}
        </div>

        <section className="glass-card space-y-4 rounded-xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-semibold">Student responses</h2><p className="text-sm text-muted-foreground">No response means no saved selection record for that meal.</p></div>
            <Button onClick={() => downloadCsv(`messiq-meal-responses-${selectedDate}.csv`, exportMealResponsesToCSV(selectedDate, filteredRows))} disabled={!filteredRows.length}>
              <Download className="mr-2 h-4 w-4" />Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/50"><tr>{["Student", "Breakfast", "Lunch", "Snacks", "Dinner"].map((heading) => <th key={heading} className="p-3 text-left font-medium">{heading}</th>)}</tr></thead>
              <tbody>{filteredRows.map((row) => <tr className="border-t" key={row.uid}>
                <td className="p-3"><div className="font-medium">{row.name || "Unnamed student"}</div><div className="text-xs text-muted-foreground">{row.email}</div></td>
                {mealTypes.map((type) => <td key={type} className="p-3">{row[type]}</td>)}
              </tr>)}
              {!filteredRows.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">{students.length ? "No students match these filters." : "No students are registered yet."}</td></tr>}</tbody>
            </table>
          </div>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-4 sm:p-6">
          <div><h2 className="font-display text-lg font-semibold">Daily Meal Summary</h2><p className="text-sm text-muted-foreground">Counts for {selectedDate}. Requested meals include Yes and Custom.</p></div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-muted/50"><tr>{["Meal", "Yes", "Custom", "Requested", "Skipped", "No response"].map((heading) => <th key={heading} className="p-3 text-left font-medium">{heading}</th>)}</tr></thead>
              <tbody>{mealTypes.map((type) => <tr className="border-t" key={type}><td className="p-3 font-medium">{mealLabels[type]}</td><td className="p-3">{dailyCounts[type].yes}</td><td className="p-3">{dailyCounts[type].custom}</td><td className="p-3 font-semibold">{dailyCounts[type].yes + dailyCounts[type].custom}</td><td className="p-3">{dailyCounts[type].skipped}</td><td className="p-3">{dailyCounts[type].noResponse}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[["Total students", students.length], ["Total responses", stats.totalResponses], ["Requested meals", stats.requestedMeals], ["Skipped", stats.skipped], ["Custom", stats.custom], ["No response", stats.noResponse]].map(([label, value]) => <div key={label} className="rounded-lg border bg-card/60 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>)}
          </div>
        </section>

        <section className="glass-card space-y-4 rounded-xl p-4 sm:p-6">
          <div><h2 className="font-display text-lg font-semibold">Date-wise Analytics</h2><p className="text-sm text-muted-foreground">Only dates with recorded Firestore meal selections are shown.</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Period<select className="mt-1 h-10 w-full rounded-md border bg-background px-3" value={preset} onChange={(event) => setPreset(event.target.value as DatePreset)}><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="7days">Last 7 Days</option><option value="30days">Last 30 Days</option><option value="custom">Custom date range</option></select></label>
            {preset === "custom" && <><label className="text-sm">Start date<Input className="mt-1" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} /></label><label className="text-sm">End date<Input className="mt-1" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /></label></>}
          </div>
          {dailyAnalytics.length ? <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-muted/50"><tr>{["Date", "Requested", "Skipped", "Custom", "No response"].map((heading) => <th key={heading} className="p-3 text-left font-medium">{heading}</th>)}</tr></thead><tbody>{dailyAnalytics.map((day) => <tr className="border-t" key={day.date}><td className="p-3">{day.date}</td><td className="p-3">{day.requested}</td><td className="p-3">{day.skipped}</td><td className="p-3">{day.custom}</td><td className="p-3">{day.noResponse}</td></tr>)}</tbody></table></div> : <p className="rounded-lg border p-4 text-sm text-muted-foreground">Not enough historical data available.</p>}
        </section>
      </>}
    </div>
  );
}
