import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Settings2, Coffee, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Choice = "yes" | "no" | "custom";

interface MealState {
  choice: Choice;
  customNote: string;
}

const mealSlots = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, time: "7:30 – 9:00 AM", menu: "Poha, Bread-Butter, Tea, Banana" },
  { key: "lunch", label: "Lunch", icon: Sun, time: "12:00 – 2:00 PM", menu: "Rice, Dal, Paneer Curry, Roti, Salad" },
  { key: "dinner", label: "Dinner", icon: Moon, time: "7:00 – 9:00 PM", menu: "Chapati, Mixed Veg, Rice, Curd" },
];

export default function MealSelection() {
  const [selections, setSelections] = useState<Record<string, MealState>>({
    breakfast: { choice: "yes", customNote: "" },
    lunch: { choice: "yes", customNote: "" },
    dinner: { choice: "yes", customNote: "" },
  });

  const updateChoice = (key: string, choice: Choice) => {
    setSelections((prev) => ({ ...prev, [key]: { ...prev[key], choice } }));
  };

  const updateNote = (key: string, note: string) => {
    setSelections((prev) => ({ ...prev, [key]: { ...prev[key], customNote: note } }));
  };

  const handleSave = () => {
    toast.success("Meal preferences saved successfully!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Meal Selection</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose your meals for today</p>
      </div>

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
                  <p className="text-xs text-muted-foreground">{slot.time} • {slot.menu}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  size="sm"
                  variant={state.choice === "yes" ? "default" : "outline"}
                  className={state.choice === "yes" ? "gradient-primary text-primary-foreground" : ""}
                  onClick={() => updateChoice(slot.key, "yes")}
                >
                  <Check className="h-4 w-4 mr-1" /> Yes, I'll eat
                </Button>
                <Button
                  size="sm"
                  variant={state.choice === "no" ? "destructive" : "outline"}
                  onClick={() => updateChoice(slot.key, "no")}
                >
                  <X className="h-4 w-4 mr-1" /> Skip
                </Button>
                <Button
                  size="sm"
                  variant={state.choice === "custom" ? "secondary" : "outline"}
                  onClick={() => updateChoice(slot.key, "custom")}
                >
                  <Settings2 className="h-4 w-4 mr-1" /> Custom
                </Button>
              </div>

              {state.choice === "custom" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                  <Textarea
                    placeholder="E.g., No spicy food, extra roti..."
                    value={state.customNote}
                    onChange={(e) => updateNote(slot.key, e.target.value)}
                    className="mt-2"
                    rows={2}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Button onClick={handleSave} className="gradient-primary text-primary-foreground hover:opacity-90 w-full sm:w-auto">
        Save Preferences
      </Button>
    </div>
  );
}
