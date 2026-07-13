import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, Flame, Zap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const dailyData = [
  { day: "Mon", predicted: 980, actual: 950 },
  { day: "Tue", predicted: 1020, actual: 1010 },
  { day: "Wed", predicted: 890, actual: 870 },
  { day: "Thu", predicted: 1100, actual: 1080 },
  { day: "Fri", predicted: 1200, actual: 1150 },
  { day: "Sat", predicted: 750, actual: 720 },
  { day: "Sun", predicted: 680, actual: 700 },
];

const highDemand = [
  { item: "Paneer Butter Masala", demand: 92 },
  { item: "Chicken Biryani", demand: 88 },
  { item: "Chole Bhature", demand: 85 },
  { item: "Gulab Jamun", demand: 80 },
  { item: "Dal Makhani", demand: 76 },
];

export default function AIPredictions() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">AI Predictions</h1>
        <p className="text-muted-foreground text-sm mt-1">Smart meal demand forecasting</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Predicted Today" value="1,085" subtitle="meals" icon={BrainCircuit} gradient="cool" />
        <StatCard title="Accuracy" value="96.2%" subtitle="Last 7 days" icon={TrendingUp} gradient="primary" />
        <StatCard title="Peak Demand" value="Thursday" subtitle="Lunch hour" icon={Zap} gradient="warm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6 lg:col-span-2">
          <h2 className="font-display font-semibold mb-4">Predicted vs Actual Meals</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-green))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" /> High Demand
          </h2>
          <div className="space-y-3">
            {highDemand.map((item, i) => (
              <div key={item.item} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.item}</span>
                  <span className="font-medium">{item.demand}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.demand}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full gradient-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
