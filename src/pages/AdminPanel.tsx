import { motion } from "framer-motion";
import {
  ChefHat,
  AlertTriangle,
  Package,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import {
  getPredictedMeals,
  getIngredientEstimate,
  getKitchenAlerts,
} from "@/lib/storage";
import { adminData } from "@/data/adminData";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

export default function AdminPanel() {
  const meals = getPredictedMeals();
  const ingredients = getIngredientEstimate();
  const alerts = getKitchenAlerts();

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kitchen preparation & inventory
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Meals To Prepare"
          value={meals.toString()}
          subtitle="Today's prediction"
          icon={ChefHat}
          gradient="primary"
        />

        <StatCard
          title="Ingredients"
          value="5 Items"
          subtitle="Auto Estimated"
          icon={Package}
          gradient="warm"
        />

        <StatCard
          title="Kitchen Staff"
          value="12"
          subtitle="Available Today"
          icon={Users}
          gradient="cool"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="font-display font-semibold mb-4">
            Ingredient Estimation
          </h2>

          <div className="space-y-3">

            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span>🍚 Rice</span>
              <span>{ingredients.rice}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span>🥣 Dal</span>
              <span>{ingredients.dal}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span>🥬 Vegetables</span>
              <span>{ingredients.vegetables}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span>🧀 Paneer</span>
              <span>{ingredients.paneer}</span>
            </div>

            <div className="flex justify-between p-3 rounded-lg bg-muted/50">
              <span>🛢 Oil</span>
              <span>{ingredients.oil}</span>
            </div>

          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Kitchen Alerts
          </h2>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-muted/40"
              >
                {alert}
              </div>
            ))}
          </div>

        </motion.div>

      </div>
      <div className="grid md:grid-cols-2 gap-6">

  <div className="glass-card rounded-xl p-6">
    <h2 className="font-display font-semibold mb-4">
      Revenue Trend
    </h2>

    <LineChart width={350} height={200} data={adminData}>
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="revenue" />
    </LineChart>
  </div>

  <div className="glass-card rounded-xl p-6">
    <h2 className="font-display font-semibold mb-4">
      Students Served
    </h2>

    <BarChart width={350} height={200} data={adminData}>
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="students" />
    </BarChart>
  </div>

  <div className="glass-card rounded-xl p-6">
    <h2 className="font-display font-semibold mb-4">
      Food Waste
    </h2>

    <BarChart width={350} height={200} data={adminData}>
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="waste" />
    </BarChart>
  </div>

</div>
    </div>
  );
}