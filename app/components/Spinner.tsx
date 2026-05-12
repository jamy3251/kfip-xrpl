/**
 * Inline spinner for action buttons. Inherits color from `currentColor`.
 */
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="inline-block animate-spin"
      style={{ animationDuration: "0.9s" }}
      aria-hidden="true"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="80 200"
      />
    </svg>
  );
}
