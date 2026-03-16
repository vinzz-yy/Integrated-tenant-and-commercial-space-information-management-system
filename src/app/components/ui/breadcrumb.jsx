import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "./utils";

/**
 * Breadcrumb - Navigation trail showing current location hierarchy
 * Used on: Shows page hierarchy for easy navigation back
 * Screens: Documentation pages, E-commerce product pages, Admin panels
 */
function Breadcrumb(props) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * BreadcrumbList - Container for breadcrumb items
 * Used on: Wrapper for all breadcrumb items
 */
function BreadcrumbList({ className, ...props }) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * BreadcrumbItem - Individual breadcrumb element
 * Used on: Each level in the navigation hierarchy
 */
function BreadcrumbItem({ className, ...props }) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

/**
 * BreadcrumbLink - Clickable breadcrumb item
 * Used on: Navigational links in the breadcrumb trail
 */
function BreadcrumbLink({ asChild, className, ...props }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

/**
 * BreadcrumbPage - Current page indicator (non-clickable)
 * Used on: Last item in breadcrumb showing current page
 */
function BreadcrumbPage({ className, ...props }) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

/**
 * BreadcrumbSeparator - Visual separator between breadcrumb items
 * Used on: Between each breadcrumb item (usually / or >)
 */
function BreadcrumbSeparator({ children, className, ...props }) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * BreadcrumbEllipsis - Indicates truncated breadcrumb items
 * Used on: When there are too many levels to display
 */
function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}