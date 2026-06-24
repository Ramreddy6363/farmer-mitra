import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { getLevel } from '@/utils/audioBus';

/**
 * Simple, clean 2D SVG farmer avatar.
 *
 * Animated via direct DOM writes inside a requestAnimationFrame loop
 * (no React re-renders) for smooth 60fps:
 *  - mouth opening   ← live audio amplitude from audioBus (lip sync)
 *  - blinking        ← periodic eyelid close
 *  - idle head bob   ← gentle sine sway/bob
 *  - thinking glance  ← pupils drift up while the agent works
 *
 * Keep eye centers (112,146)/(168,146) and mouth center (140,208) fixed —
 * the animation loop writes to those coordinates.
 */
export default function FarmerAvatar() {
  const avatarState = useStore((s) => s.avatarState);
  const stateRef = useRef(avatarState);
  stateRef.current = avatarState;

  const headRef = useRef<SVGGElement>(null);
  const lidLRef = useRef<SVGEllipseElement>(null);
  const lidRRef = useRef<SVGEllipseElement>(null);
  const mouthRef = useRef<SVGEllipseElement>(null);
  const pupilLRef = useRef<SVGCircleElement>(null);
  const pupilRRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    let mouth = 2;

    const tick = () => {
      const t = performance.now() / 1000;
      const state = stateRef.current;

      const amp = state === 'speaking' ? 1.6 : 1;
      const bob = Math.sin(t * 1.5) * 2 * amp;
      const sway = Math.sin(t * 0.8) * 1.5 * amp;
      const tilt = state === 'thinking' ? -3 : 0;
      headRef.current?.setAttribute(
        'transform',
        `translate(${140 + sway} ${150 + bob}) rotate(${tilt}) translate(${-140} ${-150})`,
      );

      const phase = t % 3.6;
      const lidRy = phase < 0.13 ? 11 : 0.1;
      lidLRef.current?.setAttribute('ry', String(lidRy));
      lidRRef.current?.setAttribute('ry', String(lidRy));

      const pupY = state === 'thinking' ? 140 : 146;
      const pupX = state === 'thinking' ? Math.sin(t * 0.6) * 3 : 0;
      pupilLRef.current?.setAttribute('cy', String(pupY));
      pupilRRef.current?.setAttribute('cy', String(pupY));
      pupilLRef.current?.setAttribute('cx', String(112 + pupX));
      pupilRRef.current?.setAttribute('cx', String(168 + pupX));

      const target = state === 'speaking' ? 2 + getLevel() * 15 : 2;
      mouth += (target - mouth) * 0.6;
      mouthRef.current?.setAttribute('ry', String(mouth.toFixed(2)));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      viewBox="0 0 280 320"
      className="h-full w-full max-h-[60vh] drop-shadow-xl"
      role="img"
      aria-label="Farmer avatar"
    >
      {/* ground shadow */}
      <ellipse cx="140" cy="306" rx="70" ry="10" fill="#000" opacity="0.1" />

      {/* shoulders / kurta (static) */}
      <path d="M62 320 Q64 248 140 248 Q216 248 218 320 Z" fill="#f5f1e6" />
      <path d="M122 252 L140 272 L158 252" fill="#43a047" />
      <path d="M140 272 L140 320" stroke="#cfc8b4" strokeWidth="2" />
      {/* gamcha (towel) draped over the shoulder */}
      <path d="M84 250 Q104 246 122 256 L116 320 L80 320 Z" fill="#e8743b" />
      <g stroke="#a83a18" strokeWidth="2" opacity="0.65">
        <path d="M86 272 Q102 270 120 276" fill="none" />
        <path d="M84 292 Q101 290 118 296" fill="none" />
        <path d="M82 312 Q100 310 116 316" fill="none" />
        <line x1="98" y1="252" x2="98" y2="320" />
      </g>
      {/* neck */}
      <rect x="124" y="226" width="32" height="34" rx="12" fill="#cf9460" />

      <g ref={headRef}>
        {/* ears */}
        <circle cx="74" cy="156" r="12" fill="#dca069" />
        <circle cx="206" cy="156" r="12" fill="#dca069" />

        {/* face */}
        <ellipse cx="140" cy="152" rx="66" ry="78" fill="#e0a672" />

        {/* turban */}
        <path
          d="M66 118 Q64 50 140 48 Q216 50 214 118 Q170 84 140 84 Q110 84 66 118 Z"
          fill="#2e7d32"
        />
        <path d="M66 118 Q140 90 214 118 L214 126 Q140 100 66 126 Z" fill="#f4c430" />

        {/* eyebrows */}
        <path d="M97 133 Q112 126 128 132" stroke="#3b2417" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M152 132 Q168 126 183 133" stroke="#3b2417" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* eyes */}
        <ellipse cx="112" cy="146" rx="14" ry="10" fill="#fff" />
        <ellipse cx="168" cy="146" rx="14" ry="10" fill="#fff" />
        <circle ref={pupilLRef} cx="112" cy="146" r="5.5" fill="#2b1a0d" />
        <circle ref={pupilRRef} cx="168" cy="146" r="5.5" fill="#2b1a0d" />
        <circle cx="114" cy="143" r="1.6" fill="#fff" />
        <circle cx="170" cy="143" r="1.6" fill="#fff" />
        {/* eyelids for blink */}
        <ellipse ref={lidLRef} cx="112" cy="146" rx="14.5" ry="0.1" fill="#e0a672" />
        <ellipse ref={lidRRef} cx="168" cy="146" rx="14.5" ry="0.1" fill="#e0a672" />

        {/* nose */}
        <path
          d="M140 152 Q135 178 140 186 Q144 188 149 184"
          stroke="#b97a4e"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* mouth (opens with audio) */}
        <ellipse cx="140" cy="208" rx="18" ry="2" fill="#7a2e22" />
        <ellipse ref={mouthRef} cx="140" cy="208" rx="14" ry="2" fill="#9e3b2c" />

        {/* moustache */}
        <path
          d="M140 200 Q120 193 102 202 Q121 207 140 201 Q159 207 178 202 Q160 193 140 200 Z"
          fill="#3b2417"
        />
      </g>
    </svg>
  );
}
