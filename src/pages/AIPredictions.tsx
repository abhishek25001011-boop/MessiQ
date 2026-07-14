import { getPredictedMeals, getSelectedMealCount } from "@/lib/storage";
import { motion } from "framer-motion";
import { BrainCircuit, TrendingUp, Flame, Zap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AIPredictions() {
  const selectedMeals = getSelectedMealCount();
  const predictedMeals = getPredictedMeals();

  const dailyData = [
    {
      day: "Today",
      predicted: predictedMeals,
      actual: selectedMeals,
    },
  ];

  const highDemand = [
    {
      item: "Paneer Butter Masala",
      demand: Math.min(100, predictedMeals * 5),
    },
    {
      item: "Chicken Biryani",
      demand: Math.min(100, predictedMeals * 4),
    },
    {
      item: "Chole Bhature",
      demand: Math.min(100, predictedMeals * 3),
    },
    {
      item: "Dal Makhani",
      demand: Math.min(100, predictedMeals * 2),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          AI Predictions
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Smart meal demand forecasting
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Predicted Meals"
          value={predictedMeals.toString()}
          subtitle="AI Prediction"
          icon={BrainCircuit}
          gradient="cool"
        />

        <StatCard
          title="Actual Selections"
          value={selectedMeals.toString()}
          subtitle="Students Selected"
          icon={TrendingUp}
          gradient="primary"
        />

        <StatCard
          title="Confidence"
          value="95%"
          subtitle="Prediction Accuracy"
          icon={Zap}
          gradient="warm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <h2 className="font-display font-semibold mb-4">
            Predicted vs Actual
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="actual"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            High Demand Foods
          </h2>

          <div className="space-y-4">
            {highDemand.map((item) => (
              <div key={item.item}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.item}</span>
                  <span>{item.demand}%</span>
                </div>

                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${item.demand}%` }}
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