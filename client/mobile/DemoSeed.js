function ensureUiPlaytestSeed(app) {
  const {
    restaurantSystem,
    financeSystem,
    employeeSystem,
    storeProgressSystem
  } = app.systems;

  const {
    entitySystem
  } = app.core;

  const existing =
    restaurantSystem.list()[0];

  if (existing) {
    return existing;
  }

  const restaurant =
    restaurantSystem.create({
      name: "寻味小馆"
    });

  financeSystem.createAccount(
    restaurant.id,
    68000
  );

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name: "周师傅",
    roleId: "chef"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name: "小林",
    roleId: "server"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name: "阿敏",
    roleId: "cashier"
  });

  storeProgressSystem.addExperience(
    restaurant.id,
    760
  );

  restaurantSystem.open(
    restaurant.id
  );

  entitySystem.update(
    "restaurant",
    restaurant.id,
    {
      reputation: 34,
      customerSatisfaction: 84,
      reviewScore: 4.4,
      totalReviews: 38,
      totalServedGuests: 186
    }
  );

  financeSystem.income(
    restaurant.id,
    4280,
    "sales",
    "今日营业收入"
  );

  financeSystem.expense(
    restaurant.id,
    920,
    "ingredient",
    "今日食材采购"
  );

  financeSystem.expense(
    restaurant.id,
    380,
    "marketing",
    "今日推广"
  );

  return restaurantSystem.get(
    restaurant.id
  );
}

export {
  ensureUiPlaytestSeed
};
