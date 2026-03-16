import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "./utils";

/**
 * Progress - Visual indicator of completion
 * Used on: Loading states, File uploads, Multi-step processes
 * Screens: Upload screens, Setup wizards, Dashboard stats
 */
function Progress({ className, value, ...props }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };