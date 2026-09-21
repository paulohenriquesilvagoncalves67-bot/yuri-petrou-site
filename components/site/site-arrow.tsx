type SiteArrowDirection = 'right' | 'left' | 'down';

type SiteArrowProps = {
  direction?: SiteArrowDirection;
  className?: string;
};

/** A shared, brand-specific navigation mark for all site actions. */
export function SiteArrow({ direction = 'right', className }: SiteArrowProps) {
  const transform =
    direction === 'left'
      ? 'rotate(180 24 10)'
      : direction === 'down'
        ? 'rotate(90 24 10)'
        : undefined;

  return (
    <svg
      className={['site-arrow', className].filter(Boolean).join(' ')}
      viewBox="0 0 48 20"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={transform}>
        <circle cx="4" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <path d="M9 10H43" />
        <path d="M34 2L43 10L34 18" />
      </g>
    </svg>
  );
}
