import { cn } from "./utils";

/**
 * Skeleton - Loading placeholder that pulses
 * Used on: Shows loading state while content fetches
 * Screens: All screens during data fetching - dashboards, profiles, lists
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };