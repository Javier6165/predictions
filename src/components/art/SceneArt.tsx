import { useId, type ReactNode } from 'react';
import type { CategoryArt } from '@/data/categories';
import { photoFor } from '@/data/photos';
import { cn } from '@/lib/cn';

interface SceneProps {
  art: CategoryArt;
  seed?: string;
  className?: string;
  /** Larger composition with a rocket for the Home hero. */
  hero?: boolean;
  /** Subtle ambient motion (twinkle/flicker, or a slow drift on photos) for large hero scenes. */
  animated?: boolean;
  /** Accessible label; decorative (aria-hidden) when omitted. */
  label?: string;
  /** `sizes` hint for photos, so thumbnails load the small file. */
  sizes?: string;
}

/**
 * Scene for a market, category or page: placeholder photo when one is registered
 * for the seed (see data/photos.ts), otherwise the code-generated illustration.
 */
export function SceneArt({ sizes = '(min-width: 1024px) 60vw, 100vw', ...props }: SceneProps) {
  const { art, seed = 'nova', className, hero = false, animated = false, label } = props;
  const photo = photoFor(seed, art);
  if (!photo) return <IllustratedScene {...props} />;
  return (
    <img
      src={photo.src}
      srcSet={`${photo.srcSm} 480w, ${photo.src} 1400w`}
      sizes={sizes}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      loading={hero ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={cn('block h-full w-full select-none object-cover', animated && 'photo-drift', className)}
      style={{ objectPosition: photo.position }}
    />
  );
}

/**
 * Original, code-generated placeholder art (no photos, logos or real people).
 * Deterministic per `seed`, so the same market always gets the same picture.
 */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

interface Palette {
  sky: [string, string, string];
  glow: string;
  a: string;
  b: string;
  c: string;
}

const PALETTES: Record<CategoryArt, Palette> = {
  science: { sky: ['#03050d', '#0b0f24', '#1a1030'], glow: '#ff7a3d', a: '#d9572b', b: '#7a2414', c: '#ffb27a' },
  politics: { sky: ['#0a0a1f', '#2a1b4a', '#7a3b5c'], glow: '#ffb070', a: '#e9ddd0', b: '#8b7fa8', c: '#ffd29e' },
  sports: { sky: ['#020812', '#06213a', '#0d3b4a'], glow: '#9ff0ff', a: '#1f8a4c', b: '#0e4d2b', c: '#e6fbff' },
  crypto: { sky: ['#0a0603', '#24140a', '#3a1d08'], glow: '#ffb13b', a: '#f5a524', b: '#9a5a0b', c: '#ffe2a3' },
  tech: { sky: ['#040616', '#0b1240', '#1d1660'], glow: '#7aa2ff', a: '#4f6bff', b: '#8f5bff', c: '#bfe0ff' },
  economy: { sky: ['#07060f', '#1f1530', '#5a2e3d'], glow: '#ff9a6b', a: '#2b6fb3', b: '#c2463a', c: '#ffd1a1' },
  entertainment: { sky: ['#0a0312', '#2a0a33', '#4a0f3f'], glow: '#ff5fd2', a: '#ff4fa3', b: '#7a2cff', c: '#ffd6f2' },
  global: { sky: ['#01040c', '#041531', '#0a2a55'], glow: '#5ec8ff', a: '#1d6fd1', b: '#0b3a7a', c: '#bff0ff' },
};

function Stars({ r, count, maxY = 300, twinkle = false }: { r: () => number; count: number; maxY?: number; twinkle?: boolean }) {
  const stars: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const size = r() < 0.92 ? 0.5 + r() * 0.7 : 1.2 + r();
    const opacity = 0.25 + r() * 0.6;
    const cx = r() * 400;
    const cy = r() * maxY;
    // Only some stars twinkle, each on its own slow rhythm, so the sky feels alive but calm.
    const lively = twinkle && i % 3 === 0;
    stars.push(
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={size}
        fill="#fff"
        opacity={opacity}
        className={lively ? 'twinkle' : undefined}
        style={lively ? ({ '--o': opacity, '--d': `${3 + (i % 5)}s`, '--delay': `${(i % 7) * 0.6}s` } as React.CSSProperties) : undefined}
      />,
    );
  }
  return <g>{stars}</g>;
}

function Planet({ id, p, cx, cy, rad }: { id: string; p: Palette; cx: number; cy: number; rad: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={rad * 1.18} fill={`url(#${id}-halo)`} />
      <circle cx={cx} cy={cy} r={rad} fill={`url(#${id}-planet)`} />
      <circle cx={cx} cy={cy} r={rad} fill={`url(#${id}-shade)`} />
      <ellipse cx={cx - rad * 0.3} cy={cy - rad * 0.15} rx={rad * 0.22} ry={rad * 0.08} fill={p.b} opacity={0.35} />
      <ellipse cx={cx + rad * 0.15} cy={cy + rad * 0.3} rx={rad * 0.3} ry={rad * 0.07} fill={p.b} opacity={0.3} />
      <ellipse cx={cx + rad * 0.35} cy={cy - rad * 0.4} rx={rad * 0.12} ry={rad * 0.05} fill={p.c} opacity={0.2} />
    </g>
  );
}

function IllustratedScene({ art, seed = 'nova', className, hero = false, animated = false, label }: SceneProps) {
  const uid = useId().replace(/:/g, '');
  const h = hash(`${art}:${seed}`);
  const r = rng(h);
  const p = PALETTES[art];
  const hueShift = (h % 50) - 25;
  const id = `art${uid}`;

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio={hero ? "xMaxYMid slice" : "xMidYMid slice"}
      className={cn('block h-full w-full', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ filter: `hue-rotate(${hueShift}deg)` }}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.6" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.7" cy="0.65" r="0.6">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-planet`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor={p.c} />
          <stop offset="0.45" stopColor={p.a} />
          <stop offset="1" stopColor={p.b} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="0.25" cy="0.25" r="1">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.75" stopColor={p.glow} stopOpacity="0.35" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d96a8" />
          <stop offset="0.45" stopColor="#f3f5fa" />
          <stop offset="1" stopColor="#5d6577" />
        </linearGradient>
        <radialGradient id={`${id}-flame`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.25" stopColor="#ffc46b" />
          <stop offset="0.6" stopColor="#ff6a2b" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ff3d1f" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      <rect width="400" height="300" fill={`url(#${id}-glow)`} />

      {art === 'science' && (
        <g>
          <Stars r={r} count={hero ? 140 : 60} twinkle={animated} />
          {hero ? (
            <>
              <Planet id={id} p={p} cx={330} cy={250} rad={190} />
              <g transform="translate(196 60) scale(0.82)" className="hidden lg:inline">
                <ellipse cx="12" cy="250" rx="70" ry="30" fill={p.glow} opacity="0.5" filter={`url(#${id}-blur)`} />
                <ellipse cx="12" cy="214" rx="13" ry="52" fill={`url(#${id}-flame)`} className={animated ? 'flame' : undefined} />
                <path d="M0 60 Q12 0 24 60 L24 170 L0 170 Z" fill={`url(#${id}-metal)`} />
                <path d="M0 140 L-14 178 L0 172 Z M24 140 L38 178 L24 172 Z" fill="#9aa3b5" />
                <rect x="0" y="96" width="24" height="3" fill="#1d2433" opacity="0.6" />
                <rect x="0" y="128" width="24" height="2" fill="#1d2433" opacity="0.5" />
                <circle cx="12" cy="78" r="4" fill="#1d2433" opacity="0.7" />
              </g>
              <g opacity="0.55" filter={`url(#${id}-soft)`}>
                <ellipse cx="150" cy="268" rx="140" ry="28" fill="#ffe1c2" opacity="0.35" />
                <ellipse cx="260" cy="282" rx="160" ry="30" fill="#c9b6c9" opacity="0.35" />
              </g>
            </>
          ) : (
            <>
              <Planet id={id} p={p} cx={250 + r() * 60} cy={150 + r() * 40} rad={95 + r() * 30} />
              <circle cx={80 + r() * 40} cy={70 + r() * 30} r={10 + r() * 6} fill="#cfd6e6" opacity="0.65" />
            </>
          )}
        </g>
      )}

      {art === 'global' && (
        <g>
          <Stars r={r} count={70} maxY={170} twinkle={animated} />
          <circle cx="200" cy="380" r="250" fill={p.glow} opacity="0.18" filter={`url(#${id}-blur)`} />
          <circle cx="200" cy="370" r="230" fill={`url(#${id}-planet)`} />
          <circle cx="200" cy="370" r="230" fill={`url(#${id}-shade)`} />
          <g fill="none" stroke={p.c} strokeOpacity="0.22" strokeWidth="1">
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse key={`lat${i}`} cx="200" cy="370" rx={230} ry={40 + i * 45} />
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse key={`lon${i}`} cx="200" cy="370" rx={30 + i * 40} ry={230} />
            ))}
          </g>
          <g fill="#3fd18b" opacity="0.35">
            <path d="M120 190 q30 -20 60 -5 q20 10 10 30 q-30 15 -55 5 z" />
            <path d="M230 170 q40 -10 70 15 q-10 25 -45 25 q-30 -5 -25 -40 z" />
          </g>
          <path d="M-30 370 A230 230 0 0 1 430 370" fill="none" stroke={p.c} strokeWidth="2.5" opacity="0.7" filter={`url(#${id}-soft)`} transform="translate(0 0)" />
        </g>
      )}

      {art === 'politics' && (
        <g>
          <Stars r={r} count={30} maxY={120} twinkle={animated} />
          <circle cx="300" cy="120" r="70" fill={p.glow} opacity="0.35" filter={`url(#${id}-blur)`} />
          <g fill={p.a} opacity="0.92">
            <ellipse cx="200" cy="128" rx="44" ry="40" />
            <rect x="152" y="126" width="96" height="16" rx="2" />
            <rect x="196" y="72" width="8" height="18" />
            <circle cx="200" cy="70" r="5" />
            <rect x="80" y="160" width="240" height="14" />
            <path d="M80 160 L200 140 L320 160 Z" />
          </g>
          <g fill={p.b}>
            {Array.from({ length: 11 }).map((_, i) => (
              <rect key={i} x={88 + i * 21.5} y="176" width="9" height="62" rx="2" opacity="0.9" />
            ))}
          </g>
          <g fill={p.c} opacity="0.85">
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} x={99 + i * 21.5} y="186" width="7" height="44" rx="1" opacity={r() > 0.4 ? 0.85 : 0.25} />
            ))}
          </g>
          <rect x="60" y="238" width="280" height="10" fill={p.a} opacity="0.9" />
          <rect x="40" y="248" width="320" height="10" fill={p.a} opacity="0.7" />
          <rect x="0" y="258" width="400" height="42" fill="#0c0b1d" />
          <g fill="#05040d">
            {Array.from({ length: 14 }).map((_, i) => (
              <ellipse key={i} cx={i * 30 + r() * 10} cy={262} rx={18 + r() * 12} ry={22 + r() * 18} />
            ))}
          </g>
        </g>
      )}

      {art === 'sports' && (
        <g>
          {[60, 340].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 30 L${x - 120 + i * 60} 300 L${x + 60 - i * 60} 300 Z`} fill={p.c} opacity="0.07" />
              <circle cx={x} cy="30" r="16" fill={p.c} opacity="0.9" filter={`url(#${id}-soft)`} />
              <circle cx={x} cy="30" r="40" fill={p.glow} opacity="0.35" filter={`url(#${id}-blur)`} />
            </g>
          ))}
          <path d="M-40 300 L120 170 L280 170 L440 300 Z" fill={p.a} />
          <path d="M-40 300 L120 170 L280 170 L440 300 Z" fill="#000" opacity="0.25" />
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M${120 - i * 26} ${170 + i * 22} L${280 + i * 26} ${170 + i * 22}`} stroke="#000" strokeOpacity="0.12" strokeWidth={8 + i * 3} />
          ))}
          <g fill="none" stroke="#eafff2" strokeOpacity="0.55" strokeWidth="1.5">
            <path d="M200 170 L200 300" />
            <ellipse cx="200" cy="232" rx="58" ry="20" />
            <path d="M120 170 L280 170 L440 300 L-40 300 Z" />
          </g>
          <g transform="translate(232 236)">
            <circle r="15" fill="#f4f7fb" />
            <path d="M0 -6 L6 -2 L4 5 L-4 5 L-6 -2 Z" fill="#1d2433" />
            <circle r="15" fill="none" stroke="#1d2433" strokeOpacity="0.3" />
          </g>
          <rect x="0" y="120" width="400" height="50" fill="#06101e" />
          <g>
            {Array.from({ length: 80 }).map((_, i) => (
              <circle key={i} cx={(i % 40) * 10 + 5} cy={130 + Math.floor(i / 40) * 14 + r() * 4} r="2.2" fill={p.c} opacity={0.15 + r() * 0.35} />
            ))}
          </g>
        </g>
      )}

      {art === 'crypto' && (
        <g>
          <circle cx="200" cy="150" r="130" fill={p.glow} opacity="0.3" filter={`url(#${id}-blur)`} />
          <g transform="translate(200 150)">
            <circle r="92" fill={`url(#${id}-planet)`} />
            <circle r="92" fill="none" stroke={p.c} strokeWidth="3" opacity="0.8" />
            <circle r="76" fill="none" stroke={p.b} strokeWidth="6" opacity="0.6" />
            {Array.from({ length: 48 }).map((_, i) => (
              <rect key={i} x="-1" y="-91" width="2" height="7" fill={p.b} opacity="0.6" transform={`rotate(${i * 7.5})`} />
            ))}
            <g fill="none" stroke={p.b} strokeWidth="5" strokeLinejoin="round" opacity="0.85">
              <path d="M0 -42 L36 -21 L36 21 L0 42 L-36 21 L-36 -21 Z" />
              <path d="M0 -42 L0 0 L36 21 M0 0 L-36 21" />
            </g>
            <ellipse cx="-30" cy="-45" rx="40" ry="16" fill="#fff" opacity="0.18" transform="rotate(-25)" />
          </g>
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={r() * 400} cy={r() * 300} r={1 + r() * 2.5} fill={p.c} opacity={0.2 + r() * 0.5} />
          ))}
        </g>
      )}

      {art === 'tech' && (
        <g>
          <g opacity="0.25" stroke={p.c} strokeWidth="0.5">
            {Array.from({ length: 21 }).map((_, i) => (
              <path key={`v${i}`} d={`M${i * 20} 0 V300`} />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <path key={`h${i}`} d={`M0 ${i * 20} H400`} />
            ))}
          </g>
          <g filter={`url(#${id}-blur)`}>
            <circle cx={170 + r() * 30} cy="150" r="80" fill={p.a} opacity="0.85" />
            <circle cx={250 + r() * 20} cy="120" r="70" fill={p.b} opacity="0.75" />
            <circle cx="220" cy="200" r="60" fill="#3fc6ff" opacity="0.5" />
          </g>
          {(() => {
            const nodes = Array.from({ length: 14 }, () => [80 + r() * 240, 50 + r() * 200] as const);
            return (
              <g>
                {nodes.map(([x, y], i) =>
                  nodes.slice(i + 1, i + 3).map(([x2, y2], j) => (
                    <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke={p.c} strokeOpacity="0.35" />
                  )),
                )}
                {nodes.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={2.5 + (i % 3)} fill={p.c} opacity="0.9" />
                ))}
              </g>
            );
          })()}
        </g>
      )}

      {art === 'economy' && (
        <g>
          <circle cx="290" cy="170" r="60" fill={p.glow} opacity="0.55" filter={`url(#${id}-blur)`} />
          <circle cx="290" cy="175" r="28" fill="#ffd9b0" opacity="0.8" />
          {Array.from({ length: 16 }).map((_, i) => {
            const hgt = 40 + r() * 120;
            const x = i * 26 - 6;
            return (
              <g key={i}>
                <rect x={x} y={300 - hgt} width="22" height={hgt} fill={i % 3 === 0 ? p.b : '#0f1428'} opacity="0.95" />
                {Array.from({ length: Math.floor(hgt / 14) }).map((__, k) => (
                  <rect key={k} x={x + 4} y={300 - hgt + 6 + k * 14} width="14" height="4" fill={p.c} opacity={r() > 0.55 ? 0.6 : 0.08} />
                ))}
              </g>
            );
          })}
          <g>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={i * 34} y={268 - (i % 2) * 12} width="32" height="12" fill={[p.a, p.b, '#d9a03a', '#3a8f7a'][i % 4]} opacity="0.95" />
            ))}
          </g>
          <polyline
            points={Array.from({ length: 9 }, (_, i) => `${20 + i * 45},${150 - i * 9 - r() * 25}`).join(' ')}
            fill="none"
            stroke={p.c}
            strokeWidth="2.5"
            opacity="0.8"
          />
        </g>
      )}

      {art === 'entertainment' && (
        <g>
          {[[90, -10, 30], [200, -20, 0], [310, -10, -30]].map(([x, y, rot], i) => (
            <path key={i} d={`M${x} ${y} L${x - 70} 300 L${x + 70} 300 Z`} fill={i === 1 ? p.c : p.a} opacity="0.13" transform={`rotate(${rot} ${x} ${y})`} />
          ))}
          {Array.from({ length: 26 }).map((_, i) => (
            <circle key={i} cx={r() * 400} cy={r() * 220} r={4 + r() * 16} fill={[p.a, p.b, p.c][i % 3]} opacity={0.12 + r() * 0.3} filter={`url(#${id}-soft)`} />
          ))}
          <ellipse cx="200" cy="290" rx="220" ry="40" fill={p.b} opacity="0.5" filter={`url(#${id}-blur)`} />
          <g fill="none" stroke={p.c} strokeWidth="3" opacity="0.85">
            <path d="M170 150 v60 a14 10 0 1 1 -10 -9 V150 l60 -14 v62 a14 10 0 1 1 -10 -9 V148 Z" fill={p.c} fillOpacity="0.15" />
          </g>
          <rect x="0" y="262" width="400" height="38" fill="#0b0412" />
          <g fill="#05020a">
            {Array.from({ length: 22 }).map((_, i) => (
              <circle key={i} cx={i * 19 + r() * 8} cy={268 + r() * 6} r={9 + r() * 5} />
            ))}
          </g>
        </g>
      )}

    </svg>
  );
}
