import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "./utils";

/**
 * Avatar - User profile image component
 * Used on: User profile pictures, Comment sections, Team member lists
 * Screens: Profile pages, Dashboard headers, Comments, Team pages
 */
function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

/**
 * AvatarImage - The actual image of the avatar
 * Used on: Displaying user's profile picture
 */
function AvatarImage({ className, ...props }) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

/**
 * AvatarFallback - Placeholder when image fails to load
 * Used on: Shows user initials or icon when no image available
 */
function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };