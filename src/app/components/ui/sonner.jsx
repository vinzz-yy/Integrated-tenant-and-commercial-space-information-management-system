import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/**
 * Toaster - Toast notification system
 * Used on: Shows temporary feedback messages
 * Screens: All screens - success/error notifications, alerts
 */
const Toaster = (props) => {
  const { theme = "system" } = useTheme();
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      {...props}
    />
  );
};

export { Toaster };