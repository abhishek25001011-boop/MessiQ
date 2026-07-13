import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: "primary" | "warm" | "cool";
}

const gradientMap = {
  primary: "gradient-primary",
  warm: "gradient-warm",
  cool: "gradient-cool",
};

export function StatCard({ title, value, subtitle, icon: Icon, gradient = "primary" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-xl p-5 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${gradientMap[gradient]} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
