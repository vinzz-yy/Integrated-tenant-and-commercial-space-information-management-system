import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

/**
 * Pagination - Navigate through multiple pages of content
 * Used on: Lists with many items, search results, blog archives
 * Screens: Blog listings, Product catalogs, Search results, Data tables
 */
function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

/**
 * PaginationContent - Container for pagination items
 * Used on: List of page numbers and navigation buttons
 */
function PaginationContent({ className, ...props }) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

/**
 * PaginationItem - Individual pagination element
 * Used on: Each page number or navigation button
 */
function PaginationItem(props) {
  return <li data-slot="pagination-item" {...props} />;
}

/**
 * PaginationLink - Clickable page number link
 * Used on: Page number buttons
 */
function PaginationLink({ className, isActive, size = "icon", ...props }) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

/**
 * PaginationPrevious - Button to go to previous page
 * Used on: Previous page navigation
 */
function PaginationPrevious({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

/**
 * PaginationNext - Button to go to next page
 * Used on: Next page navigation
 */
function PaginationNext({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

/**
 * PaginationEllipsis - Indicates omitted page numbers
 * Used on: Shows there are more pages not displayed
 */
function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}