import {
  Dumbbell, BookOpen, Bike, Mountain, Music, Palette,
  Volleyball, Footprints, Sprout, Rocket,
} from 'lucide-react'

// Purely decorative, non-interactive backdrop: faint "quest objects" drifting
// in the whitespace so the app feels alive without competing with the user's
// content. Kept very low-opacity and slow-moving so it stays background.
// Positions/sizes are hand-placed to spread evenly and avoid the centre column.
const OBJECTS = [
  { Icon: Dumbbell,   top: '12%', left: '7%',  size: 44, delay: '0s',   duration: '11s' },
  { Icon: BookOpen,   top: '22%', left: '84%', size: 50, delay: '1.5s', duration: '13s' },
  { Icon: Volleyball, top: '66%', left: '12%', size: 40, delay: '0.8s', duration: '12s' },
  { Icon: Bike,       top: '78%', left: '80%', size: 56, delay: '2.2s', duration: '15s' },
  { Icon: Mountain,   top: '46%', left: '90%', size: 38, delay: '1s',   duration: '16s' },
  { Icon: Music,      top: '54%', left: '4%',  size: 34, delay: '2.8s', duration: '12s' },
  { Icon: Palette,    top: '86%', left: '44%', size: 34, delay: '0.4s', duration: '14s' },
  { Icon: Footprints, top: '8%',  left: '50%', size: 32, delay: '1.9s', duration: '13s' },
  { Icon: Sprout,     top: '36%', left: '18%', size: 30, delay: '3s',   duration: '11s' },
  { Icon: Rocket,     top: '60%', left: '62%', size: 36, delay: '1.2s', duration: '17s' },
]

export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {OBJECTS.map(({ Icon, top, left, size, delay, duration }, i) => (
        <Icon
          key={i}
          className="alivon-float absolute text-alivon-pale opacity-50"
          style={{ top, left, width: size, height: size, animationDelay: delay, animationDuration: duration }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}
