import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "./utils";

/**
 * Popover - Floating card that appears on click
 * Used on: Contextual information, quick actions, forms in place
 * Screens: Help tooltips, Settings panels, Date pickers, Filters
 */
function Popover(props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/**
 * PopoverTrigger - Element that opens the popover
 * Used on: Buttons, icons that need to show additional content
 */
function PopoverTrigger(props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * PopoverContent - Main content of the popover
 * Used on: Contains the popover information or form
 */
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/**
 * PopoverAnchor - Positioning anchor for popover
 * Used on: Internal - helps with positioning
 */
function PopoverAnchor(props) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };