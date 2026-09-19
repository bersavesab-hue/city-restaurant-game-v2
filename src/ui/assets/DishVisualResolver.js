function safeId(
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


export function getDishVisualSource(
  dish
) {
  if (
    !dish ||
    !dish.id
  ) {
    return null;
  }

  const id =
    safeId(
      dish.id
    );

  return dish.custom
    ? (
        "assets/images/dishes/generated/" +
        id +
        ".webp"
      )
    : (
        "assets/images/dishes/official/" +
        id +
        ".webp"
      );
}


export function getDishVisualSlot(
  dish
) {
  if (
    !dish ||
    !dish.id
  ) {
    return null;
  }

  return (
    "dish-" +
    safeId(
      dish.id
    )
  );
}


export function getDishVisualFallbacks(
  dish
) {
  if (
    !dish ||
    !dish.id
  ) {
    return [];
  }

  const id =
    safeId(
      dish.id
    );

  if (
    dish.custom
  ) {
    return [
      "assets/images/dishes/generated/" +
        id +
        ".png"
    ];
  }

  return [
    "assets/images/dishes/official/" +
      id +
      ".png"
  ];
}
