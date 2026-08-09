import Leaderboard from "@/components/Leaderboard";
import { getSelectedMealCount } from "@/lib/storage";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UtensilsCrossed, TrendingDown, Leaf, Sun, Moon, Coffee } from "lucide-react";
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

interface MealHistoryRow {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
}

const todayMeals = [
  { time: "Breakfast", icon: Coffee, items: "Poha, Bread-Butter, Tea, Banana", timing: "7:30 – 9:00 AM" },
  { time: "Lunch", icon: Sun, items: "Rice, Dal, Paneer Curry, Roti, Salad", timing: "12:00 – 2:00 PM" },
  { time: "Dinner", icon: Moon, items: "Chapati, Mixed Veg, Rice, Curd", timing: "7:00 – 9:00 PM" },
];

const tomorrowMeals = [
  { time: "Breakfast", icon: Coffee, items: "Idli-Sambar, Chutney, Coffee", timing: "7:30 – 9:00 AM" },
  { time: "Lunch", icon: Sun, items: "Biryani, Raita, Gulab Jamun", timing: "12:00 – 2:00 PM" },
  { time: "Dinner", icon: Moon, items: "Chole-Bhature, Rice, Salad", timing: "7:00 – 9:00 PM" },
];
export default function Dashboard() {
  const selectedMeals = getSelectedMealCount();
  const [historyRows, setHistoryRows] = useState<MealHistoryRow[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

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

            if (!byDate.has(date)) {
              byDate.set(date, {
                date,
                breakfast: false,
                lunch: false,
                snacks: false,
                dinner: false,
              });
            }

            const existing = byDate.get(date);
            if (!existing) return;

            existing[mealType as MealType] = true;
          });

          const rows = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
          setHistoryRows(rows);
          setIsHistoryLoading(false);
        },
        () => {
          setHistoryError("Failed to load meal history.");
          setIsHistoryLoading(false);
        },
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSelections) {
        unsubscribeSelections();
      }
    };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's today's overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value="1,248" subtitle="Opted in" icon={Users} gradient="primary" />
        <StatCard
  title="Selected Meals"
  value={selectedMeals.toString()}
  subtitle="Today's selections"
  icon={UtensilsCrossed}
  gradient="warm"
/>
        <StatCard title="Waste Reduction" value="32%" subtitle="This week" icon={TrendingDown} gradient="cool" />
        <StatCard title="Food Saved" value="45 kg" subtitle="This week" icon={Leaf} gradient="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MealCard title="Today's Menu" meals={todayMeals} />
        <MealCard title="Tomorrow's Menu" meals={tomorrowMeals} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <h2 className="font-display font-semibold text-lg mb-4">Meal History</h2>

        {isHistoryLoading && (
          <p className="text-sm text-muted-foreground">Loading meal history...</p>
        )}

        {!isHistoryLoading && historyError && (
          <p className="text-sm text-destructive">{historyError}</p>
        )}

        {!isHistoryLoading && !historyError && historyRows.length === 0 && (
          <p className="text-sm text-muted-foreground">No meal history yet.</p>
        )}

        {!isHistoryLoading && !historyError && historyRows.length > 0 && (
          <div className="rounded-lg border overflow-hidden">
            <Table>
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
                    <TableCell>{row.breakfast ? "Selected" : "Not Selected"}</TableCell>
                    <TableCell>{row.lunch ? "Selected" : "Not Selected"}</TableCell>
                    <TableCell>{row.snacks ? "Selected" : "Not Selected"}</TableCell>
                    <TableCell>{row.dinner ? "Selected" : "Not Selected"}</TableCell>
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

function MealCard({ title, meals }: { title: string; meals: typeof todayMeals }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <h2 className="font-display font-semibold text-lg mb-4">{title}</h2>
      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.time} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <meal.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{meal.time}</span>
                <span className="text-xs text-muted-foreground">{meal.timing}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{meal.items}</p>
            </div>
          </div>
        ))}
        <Leaderboard />
      </div>
    </motion.div>
  );
}
