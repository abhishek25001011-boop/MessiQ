import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Handshake,
  TrendingUp,
} from "lucide-react";

import {
  getTodayRevenue,
  getSelectedMealCount,
} from "@/lib/storage";

export default function RevenuePage() {
  const revenue = getTodayRevenue();
  const meals = getSelectedMealCount();

  const revenueStreams = [
    {
      icon: Users,
      title: "Student Subscriptions",
      value: "₹1,24,800",
      subtitle: "₹50–100 per student/month",
      description:
        "1,248 active subscribers across Basic and Premium plans",
      gradient: "gradient-primary",
    },
    {
      icon: Building2,
      title: "College Tie-ups",
      value: "₹2,50,000",
      subtitle: "Per semester contract",
      description:
        "3 colleges currently partnered for mess management",
      gradient: "gradient-cool",
    },
    {
      icon: Handshake,
      title: "Vendor Commission",
      value: "₹35,600",
      subtitle: "5–8% per transaction",
      description:
        "12 vendors onboarded for ingredient supply",
      gradient: "gradient-warm",
    },
    {
      icon: TrendingUp,
      title: "Today's Revenue",
      value: `₹${revenue}`,
      subtitle: `${meals} meals selected today`,
      description:
        "Automatically calculated from today's meal selections",
      gradient: "gradient-primary",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Revenue Model
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Business overview & revenue streams
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {revenueStreams.map((stream, i) => (
          <motion.div
            key={stream.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className={`${stream.gradient} p-4`}>
              <stream.icon className="h-8 w-8 text-primary-foreground mb-2" />

              <h3 className="font-display font-bold text-xl text-primary-foreground">
                {stream.value}
              </h3>

              <p className="text-primary-foreground/80 text-sm">
                {stream.title}
              </p>
            </div>

            <div className="p-5">
              <p className="text-sm font-medium text-primary">
                {stream.subtitle}
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                {stream.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <h2 className="font-display font-semibold mb-4">
          Pricing Tiers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: "Basic",
              price: "₹50/mo",
              features: [
                "Meal selection",
                "Menu view",
                "Basic feedback",
              ],
            },
            {
              name: "Premium",
              price: "₹100/mo",
              features: [
                "All Basic features",
                "Custom meals",
                "Priority support",
                "AI insights",
              ],
            },
            {
              name: "College Plan",
              price: "Custom",
              features: [
                "Bulk management",
                "Admin dashboard",
                "Analytics",
                "API access",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold">{plan.name}</h3>

              <p className="text-2xl font-display font-bold text-primary mt-1">
                {plan.price}
              </p>

              <ul className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}