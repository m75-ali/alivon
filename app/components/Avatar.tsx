// Initials avatar — a brand-coloured circle with the user's first letter.
// Placeholder until real photo upload lands; reused in the navbar + profile.
export default function Avatar({
  username,
  size = 28,
}: {
  username: string | null
  size?: number
}) {
  const letter = (username?.[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-alivon-primary font-semibold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
    >
      {letter}
    </span>
  )
}
