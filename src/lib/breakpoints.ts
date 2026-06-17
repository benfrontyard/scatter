/** JS layout breakpoints — align with Tailwind md (768px) and lg (1024px). */
export const MOBILE_MAX_PX = 767;
export const TABLET_MAX_PX = 1023;

export const mediaQueries = {
  mobile: `(max-width: ${MOBILE_MAX_PX}px)`,
  tablet: `(max-width: ${TABLET_MAX_PX}px)`,
} as const;
