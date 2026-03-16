import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

/**
 * AspectRatio - Maintains consistent aspect ratio for content
 * Used on: Video players, Image galleries, Profile avatars
 * Screens: Media galleries, Product pages, Profile screens
 */
function AspectRatio(props) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };