/**
 * Soft educational wallpaper motif layer (07 §6).
 * Independent small line motifs — pencil, book, graduation cap, racket, wave,
 * dumbbell, music note, atom, formula — tiled at very low contrast.
 */
export function MotifField({ intensity = "loud" }: { intensity?: "loud" | "quiet" }) {
  return (
    <div className="motif-field" data-motif={intensity} aria-hidden>
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="apoindar-motifs"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-4)"
          >
            <g
              fill="none"
              stroke="#7450A6"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            >
              {/* pencil */}
              <path d="M20 54 L44 30 l10 10 -24 24 -13 3 z" />
              <path d="M38 36 l10 10" />
              {/* open book */}
              <path d="M150 40 q16 -10 32 0 v26 q-16 -10 -32 0 z" />
              <path d="M182 40 q16 -10 32 0 v26 q-16 -10 -32 0 z" />
              {/* graduation cap */}
              <path d="M70 150 l34 -14 34 14 -34 14 z" />
              <path d="M138 150 v18" />
              <path d="M86 162 v14 q18 12 36 0 v-14" />
              {/* tennis racket */}
              <ellipse cx="196" cy="150" rx="15" ry="19" />
              <path d="M196 169 v22" />
              <path d="M186 145 h20 M186 152 h20 M191 136 v28 M201 136 v28" strokeWidth="0.9" />
              {/* swim wave */}
              <path d="M18 205 q12 -12 24 0 t24 0 t24 0" />
              {/* dumbbell */}
              <path d="M150 205 h30 M150 198 v14 M180 198 v14 M144 201 v8 M186 201 v8" />
              {/* music note */}
              <path d="M110 60 v34 M110 60 l18 -6 v10 l-18 6" />
              <circle cx="104" cy="94" r="6" />
              {/* atom */}
              <circle cx="60" cy="100" r="3" />
              <ellipse cx="60" cy="100" rx="16" ry="7" />
              <ellipse cx="60" cy="100" rx="16" ry="7" transform="rotate(60 60 100)" />
              <ellipse cx="60" cy="100" rx="16" ry="7" transform="rotate(-60 60 100)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#apoindar-motifs)" />
      </svg>
    </div>
  );
}
