import { useTheme } from "../context/ThemeContext";

export function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return {
    isDark,
    gridColor: isDark ? "#1e293b" : "#e2e8f0",
    textColor: isDark ? "#94a3b8" : "#64748b",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipBorder: isDark ? "#334155" : "#e2e8f0",
    tooltipText: isDark ? "#e2e8f0" : "#334155",
    tooltipLabel: isDark ? "#f1f5f9" : "#0f172a",
    labelColor: isDark ? "#cbd5e1" : "#475569",
    colors: {
      cyan: "#06b6d4",
      purple: "#8b5cf6",
      amber: "#f59e0b",
      green: "#10b981",
      red: "#ef4444",
      orange: "#f97316",
      blue: "#3b82f6",
      pink: "#ec4899",
    },
  };
}

export const EVENT_COLORS: Record<string, string> = {
  page_view: "#06b6d4",
  click: "#8b5cf6",
  search: "#f59e0b",
  add_to_cart: "#10b981",
  purchase: "#ef4444",
  remove_from_cart: "#f97316",
};

export const EVENT_COLORS_LIGHT: Record<string, string> = {
  page_view: "#0891b2",
  click: "#7c3aed",
  search: "#d97706",
  add_to_cart: "#059669",
  purchase: "#dc2626",
  remove_from_cart: "#ea580c",
};
