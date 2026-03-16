import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "./utils";

/**
 * Separator - Visual divider between content sections
 * Used on: Separating different sections in layouts
 * Screens: All screens - between menu items, content sections, lists
 */
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };