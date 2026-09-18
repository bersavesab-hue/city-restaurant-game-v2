export const RENOVATION_TEMPLATE_SCHEMA_VERSION = 1;

export const RENOVATION_TEMPLATE_BUDGET_CLASS =
  Object.freeze({
    ECONOMY: "economy",
    STANDARD: "standard",
    PREMIUM: "premium",
    LUXURY: "luxury"
  });

export const RENOVATION_TEMPLATE_POSITIONINGS =
  Object.freeze([
    "quick_service",
    "family_dining",
    "student_value",
    "specialty_dining"
  ]);

export function validateRenovationTemplate(
  template
) {
  if (
    !template ||
    typeof template !== "object"
  ) {
    throw new TypeError(
      "Renovation template must be an object"
    );
  }

  if (
    template.schemaVersion !==
      RENOVATION_TEMPLATE_SCHEMA_VERSION
  ) {
    throw new Error(
      "Renovation template has invalid schemaVersion"
    );
  }

  if (
    typeof template.id !== "string" ||
    !/^[a-z][a-z0-9_]*$/.test(
      template.id
    )
  ) {
    throw new Error(
      "Renovation template id must use stable snake_case lowercase format"
    );
  }

  if (
    typeof template.name !== "string" ||
    !template.name.trim()
  ) {
    throw new Error(
      `Renovation template "${template.id}" requires a name`
    );
  }

  if (
    !Number.isInteger(
      template.minLevel
    ) ||
    template.minLevel < 1 ||
    template.minLevel > 10
  ) {
    throw new Error(
      `Renovation template "${template.id}" has invalid minLevel`
    );
  }

  for (
    const field
    of [
      "minArea",
      "idealArea",
      "maxArea"
    ]
  ) {
    if (
      !Number.isInteger(
        template[field]
      ) ||
      template[field] <= 0
    ) {
      throw new Error(
        `Renovation template "${template.id}" has invalid ${field}`
      );
    }
  }

  if (
    template.minArea >
      template.idealArea ||
    template.idealArea >
      template.maxArea
  ) {
    throw new Error(
      `Renovation template "${template.id}" has invalid area range`
    );
  }

  if (
    !Object.values(
      RENOVATION_TEMPLATE_BUDGET_CLASS
    ).includes(
      template.budgetClass
    )
  ) {
    throw new Error(
      `Renovation template "${template.id}" has invalid budgetClass`
    );
  }

  if (
    !Array.isArray(
      template.positioningIds
    ) ||
    new Set(
      template.positioningIds
    ).size !==
      template.positioningIds.length ||
    template.positioningIds.some(
      id =>
        !RENOVATION_TEMPLATE_POSITIONINGS.includes(
          id
        )
    )
  ) {
    throw new Error(
      `Renovation template "${template.id}" has invalid positioningIds`
    );
  }

  if (
    !Array.isArray(
      template.tags
    ) ||
    template.tags.length === 0 ||
    template.tags.some(
      tag =>
        typeof tag !== "string" ||
        !tag.trim()
    )
  ) {
    throw new Error(
      `Renovation template "${template.id}" has invalid tags`
    );
  }

  if (
    !Array.isArray(
      template.items
    ) ||
    template.items.length < 5 ||
    template.items.some(
      id =>
        typeof id !== "string" ||
        !id.trim()
    )
  ) {
    throw new Error(
      `Renovation template "${template.id}" has invalid items`
    );
  }

  return true;
}
