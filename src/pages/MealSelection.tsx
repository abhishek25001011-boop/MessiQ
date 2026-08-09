import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Settings2, Coffee, Sun, Moon, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { auth, db } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Choice = "yes" | "no" | "custom";
type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

interface MealState {
  choice: Choice;
  customNote: string;
}

interface MealDocument {
  id: string;
  date: string;
  type: MealType;
  name: string;
  description: string;
}

const mealSlots = [
  {
    key: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    time: "7:30 – 9:00 AM",
  },
  {
    key: "lunch",
    label: "Lunch",
    icon: Sun,
    time: "12:00 – 2:00 PM",
  },
  {
    key: "snacks",
    label: "Snacks",
    icon: UtensilsCrossed,
    time: "4:30 – 5:30 PM",
  },
  {
    key: "dinner",
    label: "Dinner",
    icon: Moon,
    time: "7:00 – 9:00 PM",
  },
] as const;

export default function MealSelection() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selections, setSelections] = useState<Record<string, MealState>>({
    breakfast: { choice: "yes", customNote: "" },
    lunch: { choice: "yes", customNote: "" },
    snacks: { choice: "yes", customNote: "" },
    dinner: { choice: "yes", customNote: "" },
  });
  const [menuByType, setMenuByType] = useState<Record<MealType, MealDocument[]>>({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isSelectionLoading, setIsSelectionLoading] = useState(true);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadMealMenu = async () => {
      try {
        setIsMenuLoading(true);
        setMenuError(null);

        const mealsRef = collection(db, "meals");
        const mealsQuery = query(mealsRef, where("date", "==", selectedDate));
        const snapshot = await getDocs(mealsQuery);

        const grouped: Record<MealType, MealDocument[]> = {
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: [],
        };

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const type = String(data.type || "").toLowerCase();

          if (type === "breakfast" || type === "lunch" || type === "snacks" || type === "dinner") {
            grouped[type].push({
              id: docSnap.id,
              date: String(data.date || selectedDate),
              type,
              name: String(data.name || ""),
              description: String(data.description || ""),
            });
          }
        });

        setMenuByType(grouped);
      } catch (error) {
        setMenuError("Failed to load menu. Please try again.");
      } finally {
        setIsMenuLoading(false);
      }
    };

    loadMealMenu();
  }, [selectedDate]);

  useEffect(() => {
    if (!uid) {
      setIsSelectionLoading(false);
      setSelectionError("You must be logged in to manage meal selections.");
      return;
    }

    setIsSelectionLoading(true);
    setSelectionError(null);

    const selectionsRef = collection(db, "mealSelections");
    const selectionsQuery = query(
      selectionsRef,
      where("uid", "==", uid),
      where("date", "==", selectedDate),
    );

    const unsubscribe = onSnapshot(
      selectionsQuery,
      (snapshot) => {
        const nextSelections: Record<string, MealState> = {
          breakfast: { choice: "no", customNote: "" },
          lunch: { choice: "no", customNote: "" },
          snacks: { choice: "no", customNote: "" },
          dinner: { choice: "no", customNote: "" },
        };

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const mealType = String(data.mealType || "").toLowerCase();

          if (mealType === "breakfast" || mealType === "lunch" || mealType === "snacks" || mealType === "dinner") {
            const choice = data.choice === "custom" ? "custom" : "yes";
            nextSelections[mealType] = {
              choice,
              customNote: choice === "custom" ? String(data.customNote || "") : "",
            };
          }
        });

        setSelections((prev) => ({
          ...prev,
          ...nextSelections,
        }));
        setIsSelectionLoading(false);
      },
      () => {
        setSelectionError("Failed to load your meal selections.");
        setIsSelectionLoading(false);
      },
    );

    return unsubscribe;
  }, [uid, selectedDate]);

  const formatSlotMenu = (type: MealType) => {
    const meals = menuByType[type];

    if (isMenuLoading) {
      return "Loading menu...";
    }

    if (menuError) {
      return "Unable to load menu.";
    }

    if (!meals.length) {
      return "No menu available.";
    }

    return meals
      .map((meal) =>
        meal.description
          ? `${meal.name} (${meal.description})`
          : meal.name,
      )
      .join(", ");
  };

  const hasAnyMenu = mealSlots.some((slot) => menuByType[slot.key].length > 0);

  const updateChoice = (key: string, choice: Choice) => {
    setSelections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        choice,
      },
    }));
  };

  const updateNote = (key: string, note: string) => {
    setSelections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        customNote: note,
      },
    }));
  };

  const getSelectedMealId = (mealType: MealType) => {
    const meals = menuByType[mealType];
    return meals.length ? meals[0].id : "";
  };

  const getSelectionDocId = (userId: string, date: string, mealType: MealType) => {
    return `${userId}_${date}_${mealType}`;
  };

  const handleSave = async () => {
    if (!uid) {
      toast.error("You must be logged in to save meal selections.");
      return;
    }

    try {
      setIsSaving(true);

      const tasks = mealSlots.map(async (slot) => {
        const mealType = slot.key;
        const state = selections[mealType];
        const mealId = getSelectedMealId(mealType);
        const selectionId = getSelectionDocId(uid, selectedDate, mealType);
        const selectionRef = doc(db, "mealSelections", selectionId);

        if (state.choice === "no") {
          await deleteDoc(selectionRef);
          return;
        }

        if (!mealId) {
          throw new Error(`No menu available for ${mealType}`);
        }

        if (state.choice === "custom" && !state.customNote.trim()) {
          throw new Error(`Please add a custom note for ${mealType}`);
        }

        await setDoc(selectionRef, {
          uid,
          date: selectedDate,
          mealType,
          mealId,
          choice: state.choice,
          customNote: state.choice === "custom" ? state.customNote.trim() : "",
          createdAt: serverTimestamp(),
        });
      });

      await Promise.all(tasks);
      toast.success("Meal preferences saved successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save meal preferences. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Meal Selection
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Choose your meals for the selected date
        </p>
      </div>

      <div className="glass-card rounded-xl p-4">
        <label className="text-sm text-muted-foreground">Select Date</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-2 max-w-xs"
        />
      </div>

      {menuError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {menuError}
        </div>
      )}

      {selectionError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {selectionError}
        </div>
      )}

      {isSelectionLoading && (
        <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          Loading your selections...
        </div>
      )}

      {!isMenuLoading && !menuError && !hasAnyMenu && (
        <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
          No meals found for {selectedDate}. Please check again later.
        </div>
      )}

      <div className="space-y-4">
        {mealSlots.map((slot, i) => {
          const state = selections[slot.key];

          return (
            <motion.div
              key={slot.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <slot.icon className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold">{slot.label}</h3>

                  <p className="text-xs text-muted-foreground">
                    {slot.time} • {formatSlotMenu(slot.key)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  size="sm"
                  variant={
                    state.choice === "yes"
                      ? "default"
                      : "outline"
                  }
                  className={
                    state.choice === "yes"
                      ? "gradient-primary text-primary-foreground"
                      : ""
                  }
                  onClick={() =>
                    updateChoice(slot.key, "yes")
                  }
                  disabled={isSelectionLoading || isSaving}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Yes, I'll eat
                </Button>

                <Button
                  size="sm"
                  variant={
                    state.choice === "no"
                      ? "destructive"
                      : "outline"
                  }
                  onClick={() =>
                    updateChoice(slot.key, "no")
                  }
                  disabled={isSelectionLoading || isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Skip
                </Button>

                <Button
                  size="sm"
                  variant={
                    state.choice === "custom"
                      ? "secondary"
                      : "outline"
                  }
                  onClick={() =>
                    updateChoice(slot.key, "custom")
                  }
                  disabled={isSelectionLoading || isSaving}
                >
                  <Settings2 className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </div>

              {state.choice === "custom" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                >
                  <Textarea
                    placeholder="E.g., No spicy food, extra roti..."
                    value={state.customNote}
                    onChange={(e) =>
                      updateNote(
                        slot.key,
                        e.target.value
                      )
                    }
                    className="mt-2"
                    rows={2}
                    disabled={isSelectionLoading || isSaving}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        disabled={isSelectionLoading || isSaving || isMenuLoading}
        className="gradient-primary text-primary-foreground hover:opacity-90 w-full sm:w-auto"
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}