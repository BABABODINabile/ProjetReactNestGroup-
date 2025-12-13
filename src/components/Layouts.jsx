// src/components/Layout/Layouts.jsx
import React from "react";

/**
 * LayoutVertical
 * - Centre les éléments verticalement et horizontalement.
 * - Responsive by default (garde la colonne).
 *
 * Props:
 * - className: classes Tailwind supplémentaires
 * - gap: spacing between children (Tailwind gap-x/gap-y values like "4", "6")
 * - padding: padding utility like "p-4", "px-6 py-8"
 * - fullHeight: boolean -> si true -> min-h-screen (centre sur toute la hauteur)
 * - align: items-{start|center|end|stretch} (défaut center)
 * - justify: justify-{start|center|end|between|around} (défaut center)
 */
export function LayoutVertical({
  children,
  className = "",
  gap = "4",
  padding = "p-4",
  fullHeight = false,
  align = "center",
  justify = "center",
}) {
  const minHClass = fullHeight ? "min-h-screen" : "";
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;

  return (
    <div
      className={`flex flex-col ${minHClass} ${padding} gap-${gap} ${alignClass} ${justifyClass} ${className}`}
      role="region"
      aria-label="layout-vertical"
    >
      {children}
    </div>
  );
}

/**
 * LayoutHorizontal
 * - Centre les éléments horizontalement, mais s'empile en colonne sur petits écrans (mobile-first).
 * - Par défaut : column on small screens, row on md+ (md:flex-row).
 *
 * Props:
 * - className, gap, padding, fullHeight, align, justify (mêmes que LayoutVertical)
 * - wrap: boolean -> si true ajoute flex-wrap (utile pour listes d'éléments)
 * - rowOn: Tailwind breakpoint to switch to row (default "md")
 *
 * Example rowOn="lg" => will be column until lg, then row on lg+
 */
export function LayoutHorizontal({
  children,
  className = "",
  gap = "4",
  padding = "p-4",
  fullHeight = false,
  align = "center",
  justify = "center",
  wrap = false,
  rowOn = "md",
}) {
  const minHClass = fullHeight ? "min-h-screen" : "";
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const wrapClass = wrap ? "flex-wrap" : "";
  // construct responsive row class like "md:flex-row"
  const rowClass = `${rowOn}:flex-row`;
  // On small screens remain flex-col
  return (
    <div
      className={`flex flex-col ${rowClass} ${minHClass} ${padding} gap-${gap} ${alignClass} ${justifyClass} ${wrapClass} ${className}`}
      role="region"
      aria-label="layout-horizontal"
    >
      {children}
    </div>
  );
}
