import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Check, Coffee, Moon, Sun, UtensilsCrossed, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type MealType = "breakfast" | "lunch" | "snacks" | "dinner";
type MealChoice = "yes" | "no" | "custom";

const mealTypes: { key: MealType; label: string; icon: typeof Coffee }[] = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Sun },
  { key: "snacks", label: "Snacks", icon: UtensilsCrossed },
  { key: "dinner", label: "Dinner", icon: Moon },
];

function getLocalDateString() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

interface MealMenuItem {
  type: MealType;
  name: string;
  description: string;
}

interface MealPreference {
  choice: MealChoice;
  customNote: string;
}

interface MealHistoryRow {
  date: string;
  breakfast?: MealPreference;
  lunch?: MealPreference;
  snacks?: MealPreference;
  dinner?: MealPreference;
}

export default function Dashboard() {
  const [historyRows, setHistoryRows] = useState<MealHistoryRow[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [todayMenu, setTodayMenu] = useState<MealMenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const today = getLocalDateString();
  const todayHistory = historyRows.find((row) => row.date === today);
  const todayPreferences = mealTypes
    .map(({ key }) => todayHistory?.[key])
    .filter((preference): preference is MealPreference => Boolean(preference));
  const todaySelectedCount = todayPreferences.filter((preference) => preference.choice !== "no").length;
  const todaySkippedCount = todayPreferences.filter((preference) => preference.choice === "no").length;

  useEffect(() => {
    const menuQuery = query(collection(db, "meals"), where("date", "==", today));
    return onSnapshot(
      menuQuery,
      (snapshot) => {
        const menu: MealMenuItem[] = [];
        snapshot.forEach((mealDoc) => {
          const data = mealDoc.data();
          const type = String(data.type || "").toLowerCase();
          if (type === "breakfast" || type === "lunch" || type === "snacks" || type === "dinner") {
            menu.push({
              type,
              name: String(data.name || ""),
              description: String(data.description || ""),
            });
          }
        });
        setTodayMenu(menu);
        setMenuError(null);
        setIsMenuLoading(false);
      },
      (error) => {
        console.error("Failed to load today's meal menu:", error);
        setMenuError("Failed to load today's menu.");
        setIsMenuLoading(false);
      },
    );
  }, [today]);

  useEffect(() => {
    let unsubscribeSelections: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSelections) {
        unsubscribeSelections();
        unsubscribeSelections = undefined;
      }

      if (!user) {
        setHistoryRows([]);
        setHistoryError("You must be logged in to view meal history.");
        setIsHistoryLoading(false);
        return;
      }

      setIsHistoryLoading(true);
      setHistoryError(null);
      setHistoryRows([]);

      const selectionsQuery = query(
        collection(db, "mealSelections"),
        where("uid", "==", user.uid),
      );

      unsubscribeSelections = onSnapshot(
        selectionsQuery,
        (snapshot) => {
          const byDate = new Map<string, MealHistoryRow>();

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const date = String(data.date || "");
            const mealType = String(data.mealType || "").toLowerCase();

            if (!date || (mealType !== "breakfast" && mealType !== "lunch" && mealType !== "snacks" && mealType !== "dinner")) {
              return;
            }

            if (!byDate.has(date)) byDate.set(date, { date });
            const existing = byDate.get(date);
            if (!existing) return;

            const choice: MealChoice = data.choice === "no" || data.choice === "custom" ? data.choice : "yes";
            existing[mealType as MealType] = {
              choice,
              customNote: String(data.customNote || ""),
            };
          });

          const rows = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
          setHistoryRows(rows);
          setHistoryError(null);
          setIsHistoryLoading(false);
        },
        (error) => {
          console.error("Failed to load meal history:", error);
          setHistoryError("Failed to load meal history.");
          setIsHistoryLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSelections) unsubscribeSelections();
    };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's today's overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Meal Choices" value={isHistoryLoading || historyError ? "—" : todayPreferences.length} subtitle="Saved to Firestore" icon={UtensilsCrossed} gradient="primary" />
        <StatCard title="Selected / Custom" value={isHistoryLoading || historyError ? "—" : todaySelectedCount} subtitle="Today's choices" icon={Check} gradient="warm" />
        <StatCard title="Skipped Today" value={isHistoryLoading || historyError ? "—" : todaySkippedCount} subtitle="Today's choices" icon={X} gradient="cool" />
        <StatCard title="Meal History Dates" value={isHistoryLoading || historyError ? "—" : historyRows.length} subtitle="Dates with saved choices" icon={CalendarDays} gradient="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="font-display font-semibold text-lg mb-4">Today's Menu</h2>
          {isMenuLoading ? (
            <p className="text-sm text-muted-foreground">Loading menu...</p>
          ) : menuError ? (
            <p className="text-sm text-destructive">{menuError}</p>
          ) : todayMenu.length === 0 ? (
            <p className="text-sm text-muted-foreground">No menu available for today.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealTypes.map(({ key, label, icon: Icon }) => {
                const meals = todayMenu.filter((meal) => meal.type === key);
                return (
                  <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm">{label}</span>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {meals.length
                          ? meals.map((meal) => meal.description ? `${meal.name} (${meal.description})` : meal.name).join(", ")
                          : "No menu available."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="font-display font-semibold text-lg mb-4">Today's Meal Status</h2>
          <div className="space-y-3">
            {mealTypes.map(({ key, label, icon: Icon }) => {
              const preference = todayHistory?.[key];
              const status = !preference
                ? "Not saved"
                : preference.choice === "no"
                  ? "Skipped"
                  : preference.choice === "custom"
                    ? `Custom: ${preference.customNote || "Request saved"}`
                    : "Selected";

              return (
                <div key={key} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <span className="font-medium text-sm">{label}</span>
                    <p className="break-words text-sm text-muted-foreground">{status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <h2 className="font-display font-semibold text-lg mb-4">Meal History</h2>

        {isHistoryLoading && <p className="text-sm text-muted-foreground">Loading meal history...</p>}
        {!isHistoryLoading && historyError && <p className="text-sm text-destructive">{historyError}</p>}
        {!isHistoryLoading && !historyError && historyRows.length === 0 && (
          <p className="text-sm text-muted-foreground">No meal history yet.</p>
        )}

        {!isHistoryLoading && !historyError && historyRows.length > 0 && (
          <div className="rounded-lg border overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Snacks</TableHead>
                  <TableHead>Dinner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{formatMealChoice(row.breakfast)}</TableCell>
                    <TableCell>{formatMealChoice(row.lunch)}</TableCell>
                    <TableCell>{formatMealChoice(row.snacks)}</TableCell>
                    <TableCell>{formatMealChoice(row.dinner)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function formatMealChoice(preference?: MealPreference) {
  if (!preference) return "—";
  if (preference.choice === "no") return "Skipped";
  if (preference.choice === "custom") {
    return preference.customNote ? `Custom: ${preference.customNote}` : "Custom";
  }
  return "Selected";
}
