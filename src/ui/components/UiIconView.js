function cleanClassName(
  value
) {
  return String(
    value ??
    ""
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );
}


const ICONS =
  Object.freeze({
    city: `
      <path d="M3 20h18"/>
      <path d="M5 20V9h6v11"/>
      <path d="M13 20V4h6v16"/>
      <path d="M7 12h2M7 15h2M15 7h2M15 10h2M15 13h2"/>
    `,

    store: `
      <path d="M4 10h16"/>
      <path d="M5 10V6h14v4"/>
      <path d="M6 10v10h12V10"/>
      <path d="M8 20v-6h4v6"/>
      <path d="M4 10c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0"/>
    `,

    operations: `
      <path d="M4 19h16"/>
      <path d="M6 16v-4M11 16V8M16 16V5"/>
      <path d="m5 8 5-3 4 2 5-4"/>
    `,

    employees: `
      <circle cx="9" cy="8" r="3"/>
      <circle cx="17" cy="9" r="2.5"/>
      <path d="M3.5 20c.4-4 2.4-6 5.5-6s5.2 2 5.6 6"/>
      <path d="M14.5 15.2c1-.8 2-1.2 3.2-1.2 2.2 0 3.7 1.6 3.8 4.5"/>
    `,

    more: `
      <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none"/>
    `,

    dishes: `
      <circle cx="12" cy="13" r="6"/>
      <circle cx="12" cy="13" r="3"/>
      <path d="M4 4v6M2.5 4v3c0 2 3 2 3 0V4M20 4v16M17.5 8c2 0 2.5-1.7 2.5-4"/>
    `,

    supply: `
      <path d="M3 7h11v10H3z"/>
      <path d="M14 10h4l3 3v4h-7z"/>
      <circle cx="7" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
      <path d="M5 10h7"/>
    `,

    analytics: `
      <path d="M4 20V4M4 20h16"/>
      <path d="m7 15 4-5 3 2 5-7"/>
      <circle cx="7" cy="15" r="1"/>
      <circle cx="11" cy="10" r="1"/>
      <circle cx="14" cy="12" r="1"/>
      <circle cx="19" cy="5" r="1"/>
    `,

    renovation: `
      <path d="m4 19 7-7"/>
      <path d="m9 5 3-2 4 4-2 3"/>
      <path d="m10 6 8 8"/>
      <path d="m16 12 4 4-4 4-4-4"/>
    `,

    ranking: `
      <path d="M8 4h8v4c0 3-1.7 5-4 5s-4-2-4-5V4Z"/>
      <path d="M8 6H5c0 3 1 5 4 5M16 6h3c0 3-1 5-4 5"/>
      <path d="M12 13v4M8 20h8M9 17h6"/>
    `,

    equipment: `
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      <path d="m5 5 2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>
    `
  });


export function renderUiIcon(
  icon,
  className =
    ""
) {
  const key =
    ICONS[
      icon
    ]
      ? icon
      : "more";

  return `
    <svg
      class="rg-ui-icon ${cleanClassName(
        className
      )}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      data-ui-icon="${key}"
    >
      ${ICONS[key]}
    </svg>
  `;
}


export function hasUiIcon(
  icon
) {
  return Boolean(
    ICONS[
      icon
    ]
  );
}


export {
  ICONS as UI_ICON_PATHS
};
