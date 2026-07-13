import { motion } from "framer-motion";
import { Recycle, TrendingDown, Leaf, Target } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const weeklyData = [
  { week: "W1", waste: 120, saved: 45 },
  { week: "W2", waste: 95, saved: 70 },
  { week: "W3", waste: 80, saved: 85 },
  { week: "W4", waste: 65, saved: 100 },
];

const dailyWaste = [
  { day: "Mon", kg: 18 },
  { day: "Tue", kg: 15 },
  { day: "Wed", kg: 22 },
  { day: "Thu", kg: 12 },
  { day: "Fri", kg: 10 },
  { day: "Sat", kg: 8 },
  { day: "Sun", kg: 14 },
];

export default function WasteDashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Waste Reduction</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and minimize food waste</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Food Saved" value="32%" subtitle="vs last month" icon={Leaf} gradient="primary" />
        <StatCard title="Weekly Reduction" value="45 kg" subtitle="This week" icon={TrendingDown} gradient="cool" />
        <StatCard title="Waste Today" value="12 kg" subtitle="Below target" icon={Recycle} gradient="warm" />
        <StatCard title="Target" value="< 15 kg" subtitle="Daily goal" icon={Target} gradient="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4">Daily Waste (kg)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyWaste}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="kg" fill="hsl(var(--chart-orange))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-6">
          <h2 className="font-display font-semibold mb-4">Weekly Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="waste" stroke="hsl(var(--chart-red))" fill="hsl(var(--chart-red) / 0.15)" />
              <Area type="monotone" dataKey="saved" stroke="hsl(var(--chart-green))" fill="hsl(var(--chart-green) / 0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
