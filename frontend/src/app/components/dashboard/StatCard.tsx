import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  color?: string;
  formatValue?: (value: number) => string;
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  color = "#2563EB",
  formatValue,
}: StatCardProps) {
  return (
    <div
      className="dm-card bg-white rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: `${color}15`,
            color,
          }}
        >
          {icon}
        </div>
      </div>

      <h3
        className="text-3xl font-bold"
        style={{ color: "var(--navy)" }}
      >
        {formatValue ? formatValue(value) : value.toLocaleString("fr-FR")}
      </h3>

      <p
        className="mt-2 text-sm font-medium"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </p>

      {suffix && (
        <p
          className="text-xs mt-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          {suffix}
        </p>
      )}
    </div>
  );
}