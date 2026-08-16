export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="7" width="6" height="19" rx="3" />
      <rect x="9" y="20" width="15" height="6" rx="3" />
    </svg>
  );
}
