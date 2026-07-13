import { motion } from "framer-motion";
import { ChefHat, AlertTriangle, Package, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const ingredients = [
  { name: "Rice", qty: "120 kg", status: "ok" },
  { name: "Wheat Flour", qty: "80 kg", status: "ok" },
  { name: "Dal (Toor)", qty: "35 kg", status: "low" },
  { name: "Paneer", qty: "25 kg", status: "ok" },
  { name: "Vegetables", qty: "90 kg", status: "ok" },
  { name: "Cooking Oil", qty: "15 L", status: "low" },
  { name: "Spices Mix", qty: "5 kg", status: "ok" },
  { name: "Milk", qty: "60 L", status: "ok" },
];

const alerts = [
  { message: "Prepare 350 plates for Lunch", type: "info" },
  { message: "Dal stock running low – reorder needed", type: "warning" },
  { message: "Special menu requested for Friday", type: "info" },
  { message: "Cooking oil below threshold", type: "warning" },
];

export default function AdminPanel() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">Mess preparation & inventory overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Meals Today" value="1,085" subtitle="To prepare" icon={ChefHat} gradient="primary" />
        <StatCard title="Ingredients" value="8 items" subtitle="2 low stock" icon={Package} gradient="warm" />
        <StatCard title="Staff On Duty" value="12" subtitle="3 shifts" icon={Users} gradient="cool" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4">Ingredient Estimation</h2>
          <div className="space-y-2">
            {ingredients.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="text-sm font-medium">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{item.qty}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.status === "low" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}>
                    {item.status === "low" ? "Low" : "OK"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" /> Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border text-sm ${
                  alert.type === "warning"
                    ? "border-accent/30 bg-accent/5"
                    : "border-primary/30 bg-primary/5"
                }`}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
