/** Decorative, local SVG: the privacy message remains readable without motion. */
export function PrivacyMascot() {
  return (
    <svg className="privacy-mascot" viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <ellipse className="mascot-backdrop" cx="123" cy="77" rx="86" ry="64" />
      <path d="M35 133h175" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" opacity=".3" />
      <ellipse cx="109" cy="134" rx="35" ry="5" fill="#0f172a" opacity=".1" />
      <g className="mascot-person">
        <g className="mascot-leg mascot-leg-back">
          <path d="M113 99l8 29" stroke="#24364d" strokeWidth="12" strokeLinecap="round" />
          <path d="M117 128h12a4 4 0 0 1 4 5h-18z" fill="#142238" />
        </g>
        <g className="mascot-leg mascot-leg-front">
          <path d="M101 99l-5 29" stroke="#334b68" strokeWidth="12" strokeLinecap="round" />
          <path d="M90 128h13v5H86a4 4 0 0 1 4-5" fill="#142238" />
        </g>
        <g className="mascot-body">
          <path d="M94 65q13-7 26 0l6 39H89z" fill="#29415e" />
          <path d="M101 64h13l-6 24z" fill="#f8fafc" />
          <path d="M107 69h4l1 11-4 5-3-5z" fill="#60a5fa" />
          <path d="M98 65l-3 13 8 9m14-22 3 13-8 9" fill="none" stroke="#45617f" strokeWidth="2" />
          <path d="M96 70Q82 80 87 94" fill="none" stroke="#29415e" strokeWidth="11" strokeLinecap="round" />
          <circle cx="88" cy="95" r="5" fill="#edb58d" />
          <path d="M104 56v9q4 5 9 0v-9" fill="#dea17a" />
          <circle cx="91" cy="43" r="5" fill="#edb58d" />
          <rect x="92" y="23" width="32" height="37" rx="14" fill="#f3c6a4" />
          <path d="M92 42q-9-21 8-23 19-9 26 8l-2 9-7-9q-10 8-21 6v9z" fill="#26364b" />
          <path d="M99 40h6m9 0h6" stroke="#26364b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="102" cy="43" r="1.6" fill="#26364b" />
          <circle cx="117" cy="43" r="1.6" fill="#26364b" />
          <path d="M107 51q5 4 9-1" fill="none" stroke="#a9664d" strokeWidth="1.8" strokeLinecap="round" />
          <g className="mascot-handoff">
            <path d="M120 72q10 14 23 6" fill="none" stroke="#334b68" strokeWidth="11" strokeLinecap="round" />
            <g transform="rotate(7 156 69)">
              <rect x="136" y="43" width="43" height="55" rx="5" fill="#cbd5e1" opacity=".35" transform="translate(0 3)" />
              <rect x="136" y="43" width="43" height="55" rx="5" fill="#fff" stroke="#bfdbfe" strokeWidth="1.5" />
              <rect x="143" y="51" width="15" height="4" rx="2" fill="#2563eb" />
              <path d="M143 61h27m-27 6h18" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
              <g className="mascot-check">
                <circle cx="164" cy="83" r="13" fill="#2563eb" />
                <path d="m158 83 4 4 8-9" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
            <path d="M138 79l5-1" stroke="#f3c6a4" strokeWidth="8" strokeLinecap="round" />
          </g>
        </g>
      </g>
      <g className="mascot-sparkles" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
        <path d="M190 57v8m-4-4h8M178 29v6m-3-3h6" />
        <circle cx="59" cy="72" r="3" />
      </g>
    </svg>
  )
}
