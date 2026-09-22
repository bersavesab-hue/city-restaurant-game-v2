import {
  app
} from "../../src/main.js";

import {
  RestaurantSceneSystem
} from "../../src/scene/RestaurantSceneSystem.js";

import {
  DISH_SCHEMA_VERSION,
  getDefaultRecipeId
} from "../../src/data/dishCatalogRules.js";

import {
  RECIPE_SCHEMA_VERSION
} from "../../src/data/recipeRules.js";

function bootSampleRestaurant() {
  const {
    gameState
  } = app.core;

  const {
    restaurantSystem,
    financeSystem,
    employeeSystem,
    ingredientCatalogSystem,
    inventorySystem,
    dishCatalogSystem,
    recipeSystem,
    menuSystem
  } = app.systems;

  gameState.reset();

  ingredientCatalogSystem.load(
    [
      {
        id: "scene_demo_rice",
        name: "香米",
        category: "grain",
        unit: "kg",
        storageType: "dry",
        basePurchasePrice: 6,
        shelfLifeDays: 120,
        edibleRate: 1,
        baseWasteRate: 0
      }
    ],
    {
      overwrite: true
    }
  );

  dishCatalogSystem.load(
    [
      {
        schemaVersion:
          DISH_SCHEMA_VERSION,
        id: "scene_demo_rice_bowl",
        name: "招牌盖饭",
        category: "rice",
        basePrice: 28,
        unlockLevel: 1,
        baseDifficulty: 8,
        defaultRecipeId:
          getDefaultRecipeId(
            "scene_demo_rice_bowl"
          )
      }
    ],
    {
      overwrite: true
    }
  );

  recipeSystem.load(
    [
      {
        schemaVersion:
          RECIPE_SCHEMA_VERSION,
        id:
          getDefaultRecipeId(
            "scene_demo_rice_bowl"
          ),
        dishId:
          "scene_demo_rice_bowl",
        variantId: "standard",
        name: "招牌盖饭标准做法",
        method: "steam",
        difficulty: 8,
        cookingMinutes: 5,
        ingredients: [
          {
            ingredientId:
              "scene_demo_rice",
            quantity: 0.12
          }
        ]
      }
    ],
    {
      overwrite: true
    }
  );

  const restaurant =
    restaurantSystem.create({
      name: "小馆场景测试店"
    });

  financeSystem.createAccount(
    restaurant.id,
    100000
  );

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name: "阿强",
    roleId: "chef"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name: "小周",
    roleId: "server"
  });

  employeeSystem.hire({
    restaurantId:
      restaurant.id,
    name: "阿敏",
    roleId: "cashier"
  });

  inventorySystem.addBatch({
    restaurantId:
      restaurant.id,
    ingredientId:
      "scene_demo_rice",
    quantity: 200,
    quality: 4
  });

  const menuItem =
    menuSystem.addItem({
      restaurantId:
        restaurant.id,
      dishId:
        "scene_demo_rice_bowl",
      recipeId:
        getDefaultRecipeId(
          "scene_demo_rice_bowl"
        ),
      price: 28
    });

  restaurantSystem.open(
    restaurant.id
  );

  return {
    restaurant,
    menuItem
  };
}

const canvas =
  document.querySelector("#scene");

const context =
  canvas.getContext("2d");

const statsNode =
  document.querySelector("#stats");

const stateNode =
  document.querySelector("#state");

const moneyNode =
  document.querySelector("#money");

const toggleButton =
  document.querySelector("#toggle");

const restaurantData =
  bootSampleRestaurant();

const scene =
  new RestaurantSceneSystem({
    app
  });

scene.start({
  restaurantId:
    restaurantData.restaurant.id,
  menuItemId:
    restaurantData.menuItem.id,
  spawnEverySeconds: 3.8,
  maxCustomers: 9
});

scene.spawnCustomer();

let lastTime =
  performance.now();

function resizeCanvas() {
  const rect =
    canvas.getBoundingClientRect();

  const ratio =
    Math.min(
      2,
      window.devicePixelRatio || 1
    );

  canvas.width =
    Math.max(
      1,
      Math.floor(
        rect.width * ratio
      )
    );

  canvas.height =
    Math.max(
      1,
      Math.floor(
        rect.height * ratio
      )
    );

  context.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );
}

window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();

function actorLabel(actor) {
  if (actor.kind === "staff") {
    if (actor.roleId === "chef") {
      return actor.state === "cooking"
        ? "厨师·制作"
        : "厨师";
    }

    if (actor.roleId === "server") {
      if (actor.state === "taking_order") {
        return "服务员·点餐";
      }

      if (actor.state === "delivering") {
        return "服务员·上菜";
      }

      if (actor.state === "clearing_table") {
        return "服务员·收桌";
      }

      return "服务员";
    }

    return "收银员";
  }

  const labels = {
    entering: "进店",
    waiting_table: "等位",
    walking_to_table: "入座",
    waiting_order: "等点餐",
    waiting_food: "等上菜",
    eating: "吃饭",
    walking_to_cashier: "去结账",
    paying: "结账",
    leaving: "离店"
  };

  return labels[actor.state] ?? actor.state;
}

function draw(snapshot) {
  const rect =
    canvas.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  context.clearRect(
    0,
    0,
    width,
    height
  );

  const margin = 12;

  const tile =
    Math.min(
      (width - margin * 2) /
        snapshot.layout.width,
      (height - margin * 2) /
        snapshot.layout.height
    );

  const worldWidth =
    tile *
    snapshot.layout.width;

  const worldHeight =
    tile *
    snapshot.layout.height;

  const offsetX =
    (width - worldWidth) / 2;

  const offsetY =
    (height - worldHeight) / 2;

  const px = x =>
    offsetX + x * tile;

  const py = y =>
    offsetY + y * tile;

  context.fillStyle = "#ede2cf";
  context.fillRect(
    offsetX,
    offsetY,
    worldWidth,
    worldHeight
  );

  context.fillStyle = "#d9c2a2";
  context.fillRect(
    offsetX + tile,
    offsetY + tile,
    worldWidth - tile * 2,
    tile * 4
  );

  context.strokeStyle =
    "rgba(70,55,40,.10)";
  context.lineWidth = 1;

  for (
    let x = 1;
    x < snapshot.layout.width;
    x += 1
  ) {
    context.beginPath();
    context.moveTo(
      px(x),
      offsetY
    );
    context.lineTo(
      px(x),
      offsetY + worldHeight
    );
    context.stroke();
  }

  for (
    let y = 1;
    y < snapshot.layout.height;
    y += 1
  ) {
    context.beginPath();
    context.moveTo(
      offsetX,
      py(y)
    );
    context.lineTo(
      offsetX + worldWidth,
      py(y)
    );
    context.stroke();
  }

  context.fillStyle = "#6c5140";
  context.fillRect(
    offsetX,
    offsetY,
    worldWidth,
    tile * 0.35
  );

  context.fillRect(
    offsetX,
    offsetY,
    tile * 0.35,
    worldHeight
  );

  context.fillRect(
    offsetX + worldWidth - tile * 0.35,
    offsetY,
    tile * 0.35,
    worldHeight
  );

  context.fillRect(
    offsetX,
    offsetY + worldHeight - tile * 0.35,
    tile * 6,
    tile * 0.35
  );

  context.fillRect(
    offsetX + tile * 7,
    offsetY + worldHeight - tile * 0.35,
    worldWidth - tile * 7,
    tile * 0.35
  );

  context.fillStyle = "#9d785f";
  context.fillRect(
    px(3),
    py(1.3),
    tile * 8,
    tile * 1.1
  );

  context.fillStyle = "#fff4d8";
  context.font =
    `600 ${Math.max(10, tile * 0.42)}px system-ui`;
  context.textAlign = "center";
  context.fillText(
    "厨房",
    px(7),
    py(2.02)
  );

  context.fillStyle = "#9c6d42";
  context.fillRect(
    px(snapshot.layout.cashier.x - 0.7),
    py(snapshot.layout.cashier.y - 0.5),
    tile * 1.4,
    tile * 0.8
  );

  context.fillStyle = "#ffffff";
  context.font =
    `700 ${Math.max(9, tile * 0.30)}px system-ui`;
  context.fillText(
    "收银",
    px(snapshot.layout.cashier.x),
    py(snapshot.layout.cashier.y - 0.03)
  );

  for (const table of snapshot.tables) {
    context.fillStyle =
      table.status === "dirty"
        ? "#8f8f8f"
        : table.status === "occupied"
          ? "#b87f50"
          : "#c99a64";

    context.beginPath();
    context.roundRect(
      px(table.x) - tile * 0.42,
      py(table.y) - tile * 0.34,
      tile * 0.84,
      tile * 0.68,
      tile * 0.12
    );
    context.fill();

    context.fillStyle =
      table.status === "dirty"
        ? "#676767"
        : "#765336";

    context.beginPath();
    context.arc(
      px(table.seatX),
      py(table.seatY),
      tile * 0.21,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  for (const actor of snapshot.actors) {
    const x = px(actor.x);
    const y = py(actor.y);

    if (actor.kind === "staff") {
      context.fillStyle =
        actor.roleId === "chef"
          ? "#d95c4f"
          : actor.roleId === "server"
            ? "#3f74b5"
            : "#d49d35";
    } else {
      context.fillStyle =
        actor.state === "eating"
          ? "#5f9d62"
          : "#8056a7";
    }

    context.beginPath();
    context.arc(
      x,
      y,
      tile * 0.30,
      0,
      Math.PI * 2
    );
    context.fill();

    context.fillStyle = "#fff";
    context.font =
      `800 ${Math.max(9, tile * 0.28)}px system-ui`;
    context.textAlign = "center";

    context.fillText(
      actor.kind === "staff"
        ? actor.roleId === "chef"
          ? "厨"
          : actor.roleId === "server"
            ? "服"
            : "收"
        : "客",
      x,
      y + tile * 0.10
    );

    const label =
      actorLabel(actor);

    context.font =
      `700 ${Math.max(9, tile * 0.25)}px system-ui`;

    const textWidth =
      context.measureText(label)
        .width;

    context.fillStyle =
      "rgba(30,26,22,.82)";

    context.beginPath();
    context.roundRect(
      x - textWidth / 2 - 5,
      y - tile * 0.72,
      textWidth + 10,
      Math.max(16, tile * 0.40),
      6
    );
    context.fill();

    context.fillStyle = "#fff";
    context.fillText(
      label,
      x,
      y - tile * 0.44
    );
  }

  context.fillStyle = "#5b4737";
  context.font =
    `700 ${Math.max(10, tile * 0.30)}px system-ui`;
  context.fillText(
    "入口",
    px(snapshot.layout.entrance.x),
    py(snapshot.layout.entrance.y - 0.35)
  );
}

function updateInfo(snapshot) {
  const s = snapshot.stats;

  statsNode.textContent =
    `进店 ${s.arrived}　入座 ${s.seated}　点单 ${s.ordersTaken}　上菜 ${s.served}　结账 ${s.paid}`;

  stateNode.textContent =
    `场内 ${snapshot.actors.filter(item => item.kind === "customer").length} 人　厨房待做 ${snapshot.queuedKitchenTickets}　服务任务 ${snapshot.queuedServerTasks}`;

  moneyNode.textContent =
    `营业收入 ¥${s.revenue}`;
}

function frame(now) {
  const delta =
    Math.min(
      0.05,
      (now - lastTime) / 1000
    );

  lastTime = now;

  const snapshot =
    scene.tick(delta);

  draw(snapshot);
  updateInfo(snapshot);

  requestAnimationFrame(frame);
}

document
  .querySelectorAll(
    "[data-speed]"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        const speed =
          Number(
            button.dataset.speed
          );

        scene.setSpeed(speed);

        document
          .querySelectorAll(
            "[data-speed]"
          )
          .forEach(item =>
            item.classList.toggle(
              "is-active",
              Number(
                item.dataset.speed
              ) === speed
            )
          );

        toggleButton.textContent =
          speed === 0
            ? "继续"
            : "暂停";
      }
    );
  });

toggleButton.addEventListener(
  "click",
  () => {
    if (scene.speed === 0) {
      scene.setSpeed(1);
      toggleButton.textContent =
        "暂停";
    } else {
      scene.setSpeed(0);
      toggleButton.textContent =
        "继续";
    }
  }
);

document
  .querySelector(
    "#spawn"
  )
  .addEventListener(
    "click",
    () => {
      scene.spawnCustomer();
    }
  );

requestAnimationFrame(frame);
