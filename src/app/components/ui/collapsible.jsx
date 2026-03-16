import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

/**
 * Collapsible - Expandable/collapsible content section
 * Used on: FAQ sections, Sidebar menus, Filter panels
 * Screens: Documentation, Settings, Sidebars, Mobile menus
 */
function Collapsible(props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

/**
 * CollapsibleTrigger - Button that toggles collapsible content
 * Used on: Header/button that expands/collapses content
 */
function CollapsibleTrigger(props) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

/**
 * CollapsibleContent - Content that can be collapsed/expanded
 * Used on: The collapsible content area
 */
function CollapsibleContent(props) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };