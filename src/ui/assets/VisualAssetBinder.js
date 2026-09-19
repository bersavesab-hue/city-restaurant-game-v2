import {
  getIngredientVisual
} from "../../data/ingredientVisuals.js";

import {
  getCustomDishVisualUrl
} from "./CustomDishVisualService.js";


const SUCCESS_CACHE =
  new Map();

const FAILURE_CACHE =
  new Set();


const SLOT_PREFIXES =
  Object.freeze({
    "command-dish-":
      [
        "assets/images/dishes/official",
        "assets/images/dishes/generated"
      ],

    "dish-":
      [
        "assets/images/dishes/official",
        "assets/images/dishes/generated"
      ],

    "command-employee-":
      [
        "assets/images/ui/employees/avatars"
      ],

    "employee-avatar-":
      [
        "assets/images/ui/employees/avatars"
      ]
  });


function safeAssetKey(
  value
) {
  return String(
    value ??
    ""
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9_.-]/g,
      "_"
    );
}


function withExtensions(
  base
) {
  return [
    base + ".webp",
    base + ".png",
    base + ".jpg",
    base + ".jpeg"
  ];
}


function unique(
  values
) {
  return [
    ...new Set(
      values.filter(
        Boolean
      )
    )
  ];
}


export function getSlotAssetCandidates(
  slot,
  explicitSource =
    null
) {
  const candidates =
    [];

  if (
    explicitSource
  ) {
    candidates.push(
      explicitSource
    );
  }

  if (
    slot ===
    "command-center-hero"
  ) {
    candidates.push(
      ...withExtensions(
        "assets/images/scenes/restaurants/command-center-hero"
      ),
      ...withExtensions(
        "assets/images/scenes/restaurants/default"
      )
    );

    return unique(
      candidates
    );
  }

  if (
    slot ===
    "restaurant-hero"
  ) {
    candidates.push(
      ...withExtensions(
        "assets/images/scenes/restaurants/restaurant-home-hero"
      ),
      ...withExtensions(
        "assets/images/scenes/restaurants/command-center-hero"
      ),
      ...withExtensions(
        "assets/images/scenes/restaurants/default"
      )
    );

    return unique(
      candidates
    );
  }

  if (
    slot ===
    "restaurant-live"
  ) {
    candidates.push(
      ...withExtensions(
        "assets/images/scenes/restaurants/restaurant-live"
      ),
      ...withExtensions(
        "assets/images/scenes/restaurants/command-center-hero"
      ),
      ...withExtensions(
        "assets/images/scenes/restaurants/default"
      )
    );

    return unique(
      candidates
    );
  }

  for (
    const [
      prefix,
      directories
    ]
    of Object.entries(
      SLOT_PREFIXES
    )
  ) {
    if (
      !slot.startsWith(
        prefix
      )
    ) {
      continue;
    }

    const key =
      safeAssetKey(
        slot.slice(
          prefix.length
        )
      );

    for (
      const directory
      of directories
    ) {
      candidates.push(
        ...withExtensions(
          directory +
          "/" +
          key
        )
      );
    }

    break;
  }

  return unique(
    candidates
  );
}


function probeImage(
  source
) {
  if (
    SUCCESS_CACHE.has(
      source
    )
  ) {
    return Promise.resolve(
      true
    );
  }

  if (
    FAILURE_CACHE.has(
      source
    )
  ) {
    return Promise.resolve(
      false
    );
  }

  if (
    typeof Image ===
    "undefined"
  ) {
    return Promise.resolve(
      false
    );
  }

  return new Promise(
    resolve => {
      const image =
        new Image();

      image.onload =
        () => {
          SUCCESS_CACHE.set(
            source,
            true
          );

          resolve(
            true
          );
        };

      image.onerror =
        () => {
          FAILURE_CACHE.add(
            source
          );

          resolve(
            false
          );
        };

      image.src =
        source;
    }
  );
}


async function firstAvailable(
  candidates
) {
  for (
    const source
    of candidates
  ) {
    if (
      await probeImage(
        source
      )
    ) {
      return source;
    }
  }

  return null;
}


function applyImage(
  element,
  source,
  {
    fit =
      "cover",

    position =
      "center"
  } = {}
) {
  element.style
    .backgroundImage =
    'url("' +
    source +
    '")';

  element.style
    .backgroundSize =
    fit;

  element.style
    .backgroundPosition =
    position;

  element.style
    .backgroundRepeat =
    "no-repeat";

  element.dataset
    .imageState =
    "loaded";

  element.dataset
    .imageResolved =
    source;
}


function applyIngredientAtlas(
  element,
  ingredientId
) {
  let visual;

  try {
    visual =
      getIngredientVisual(
        ingredientId
      );
  } catch {
    return false;
  }

  const columns =
    16;

  const rows =
    17;

  element.style
    .backgroundImage =
    'url("assets/images/ingredients/ingredient-atlas-v1.webp")';

  element.style
    .backgroundSize =
    (
      columns *
      100
    ) +
    "% " +
    (
      rows *
      100
    ) +
    "%";

  const x =
    columns <= 1
      ? 0
      : visual.spriteColumn /
        (
          columns -
          1
        ) *
        100;

  const y =
    rows <= 1
      ? 0
      : visual.spriteRow /
        (
          rows -
          1
        ) *
        100;

  element.style
    .backgroundPosition =
    x +
    "% " +
    y +
    "%";

  element.style
    .backgroundRepeat =
    "no-repeat";

  element.dataset
    .imageState =
    "atlas";

  element.dataset
    .imageResolved =
    "ingredient-atlas-v1";

  return true;
}


async function bindIngredient(
  element
) {
  const ingredientId =
    element.dataset
      .ingredientId;

  if (
    !ingredientId
  ) {
    return false;
  }

  let visual;

  try {
    visual =
      getIngredientVisual(
        ingredientId
      );
  } catch {
    return false;
  }

  const candidates =
    [
      visual.image,
      ...withExtensions(
        "assets/images/ingredients/" +
        visual.code +
        "_" +
        visual.id
      )
    ];

  const source =
    await firstAvailable(
      unique(
        candidates
      )
    );

  if (
    source
  ) {
    applyImage(
      element,
      source,
      {
        fit:
          "cover"
      }
    );

    return true;
  }

  return applyIngredientAtlas(
    element,
    ingredientId
  );
}


export async function bindVisualAsset(
  element
) {
  if (
    !element ||
    !element.dataset
  ) {
    return null;
  }

  if (
    element.dataset
      .imageBinding ===
    "pending"
  ) {
    return null;
  }

  const slot =
    element.dataset
      .imageSlot ??
    "";

  const explicitSource =
    element.dataset
      .imageSrc ??
    null;

  const explicitFallback =
    element.dataset
      .imageFallback ??
    null;

  element.dataset
    .imageBinding =
    "pending";

  try {
    if (
      element.dataset
        .customDishId
    ) {
      const generated =
        await getCustomDishVisualUrl(
          element.dataset
            .customDishId
        );

      if (
        generated?.url
      ) {
        applyImage(
          element,
          generated.url,
          {
            fit:
              element.dataset
                .imageFit ??
              "cover",

            position:
              element.dataset
                .imagePosition ??
              "center"
          }
        );

        element.dataset
          .dishVisualKey =
          generated.plan
            ?.cacheKey ??
          "";

        return generated.url;
      }
    }

    if (
      element.dataset
        .ingredientId
    ) {
      const loaded =
        await bindIngredient(
          element
        );

      if (
        loaded
      ) {
        return element.dataset
          .imageResolved ??
          "ingredient";
      }
    }

    const candidates =
      [
        ...getSlotAssetCandidates(
          slot,
          explicitSource
        ),

        ...(
          explicitFallback
            ? [
                explicitFallback
              ]
            : []
        )
      ];

    const source =
      await firstAvailable(
        candidates
      );

    if (
      source
    ) {
      applyImage(
        element,
        source,
        {
          fit:
            element.dataset
              .imageFit ??
            "cover",

          position:
            element.dataset
              .imagePosition ??
            "center"
        }
      );

      return source;
    }

    element.dataset
      .imageState =
      "fallback";

    return null;
  } finally {
    element.dataset
      .imageBinding =
      "done";
  }
}


export function bindVisualAssets(
  root =
    null
) {
  const scope =
    root ??
    (
      typeof document !==
      "undefined"
        ? document
        : null
    );

  if (
    !scope ||
    typeof scope
      .querySelectorAll !==
      "function"
  ) {
    return Promise.resolve(
      []
    );
  }

  const elements =
    [
      ...scope.querySelectorAll(
        "[data-image-slot], [data-ingredient-id]"
      )
    ];

  return Promise.all(
    elements.map(
      element =>
        bindVisualAsset(
          element
        )
    )
  );
}


export function resetVisualAssetCache() {
  SUCCESS_CACHE.clear();
  FAILURE_CACHE.clear();
}
