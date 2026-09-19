import {
  gameState
} from "../core/GameState.js";

import {
  restaurantSystem
} from "./RestaurantSystem.js";

import {
  financeSystem
} from "./FinanceSystem.js";

import {
  entitySystem
} from "../core/EntitySystem.js";

import {
  RELEASE_INFO,
  getReleaseLabel
} from "../release/ReleaseInfo.js";


const FEEDBACK_CATEGORIES =
  Object.freeze([
    Object.freeze({
      id: "bug",
      name: "问题/崩溃"
    }),
    Object.freeze({
      id: "ui",
      name: "界面体验"
    }),
    Object.freeze({
      id: "balance",
      name: "数值平衡"
    }),
    Object.freeze({
      id: "performance",
      name: "卡顿/性能"
    }),
    Object.freeze({
      id: "suggestion",
      name: "玩法建议"
    })
  ]);


class FeedbackMemoryStorage {
  constructor() {
    this.data =
      new Map();
  }

  getItem(key) {
    return this.data.has(key)
      ? this.data.get(key)
      : null;
  }

  setItem(
    key,
    value
  ) {
    this.data.set(
      key,
      String(value)
    );
  }

  removeItem(key) {
    this.data.delete(key);
  }
}


function resolveStorage() {
  if (
    typeof globalThis !==
      "undefined" &&
    globalThis.localStorage &&
    typeof globalThis
      .localStorage
      .getItem ===
      "function"
  ) {
    return globalThis.localStorage;
  }

  return new FeedbackMemoryStorage();
}


class FeedbackSystem {
  constructor({
    storage =
      resolveStorage(),
    storageKey =
      "cityRestaurantGame:feedback:v1"
  } = {}) {
    this.storage =
      storage;

    this.storageKey =
      storageKey;
  }


  getCategories() {
    return FEEDBACK_CATEGORIES
      .map(
        item =>
          structuredClone(
            item
          )
      );
  }


  readAll() {
    const raw =
      this.storage
        .getItem(
          this.storageKey
        );

    if (!raw) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(raw);

      if (
        !Array.isArray(
          parsed
        )
      ) {
        return [];
      }

      return parsed
        .filter(
          item =>
            item &&
            typeof item ===
              "object"
        );
    } catch {
      return [];
    }
  }


  writeAll(items) {
    this.storage
      .setItem(
        this.storageKey,
        JSON.stringify(
          items
        )
      );

    return items;
  }


  getDiagnosticSnapshot(
    restaurantId
  ) {
    let restaurant =
      null;

    let balance =
      null;

    try {
      restaurant =
        restaurantSystem.get(
          restaurantId
        );

      balance =
        financeSystem.getBalance(
          restaurantId
        );
    } catch {
      restaurant =
        null;
    }

    const time =
      gameState.getSection(
        "time"
      );

    const runtime =
      gameState.getSection(
        "runtime"
      );

    const entityCounts =
      Object.fromEntries(
        entitySystem
          .listTypes()
          .map(
            type => [
              type,
              entitySystem.count(
                type
              )
            ]
          )
      );

    return {
      release:
        structuredClone(
          RELEASE_INFO
        ),

      time: {
        day:
          time.day,
        hour:
          time.hour,
        minute:
          time.minute
      },

      runtime: {
        paused:
          runtime.paused,
        speed:
          runtime.speed
      },

      restaurant:
        restaurant
          ? {
              id:
                restaurant.id,
              level:
                restaurant.level ??
                1,
              status:
                restaurant.status,
              balance
            }
          : null,

      entityCounts
    };
  }


  validateInput({
    category,
    rating,
    message
  }) {
    if (
      !FEEDBACK_CATEGORIES
        .some(
          item =>
            item.id ===
            category
        )
    ) {
      throw new Error(
        "请选择有效的反馈类型"
      );
    }

    const normalizedRating =
      Number(rating);

    if (
      !Number.isInteger(
        normalizedRating
      ) ||
      normalizedRating <
        1 ||
      normalizedRating >
        5
    ) {
      throw new Error(
        "评分必须为1到5"
      );
    }

    const normalizedMessage =
      String(
        message ??
        ""
      ).trim();

    if (
      normalizedMessage
        .length <
      4
    ) {
      throw new Error(
        "反馈内容至少需要4个字"
      );
    }

    if (
      normalizedMessage
        .length >
      1000
    ) {
      throw new Error(
        "反馈内容不能超过1000字"
      );
    }

    return {
      category,
      rating:
        normalizedRating,
      message:
        normalizedMessage
    };
  }


  submit({
    restaurantId,
    category,
    rating,
    message
  }) {
    const input =
      this.validateInput({
        category,
        rating,
        message
      });

    const items =
      this.readAll();

    const id =
      "feedback_" +
      Date.now() +
      "_" +
      String(
        items.length +
        1
      ).padStart(
        3,
        "0"
      );

    const record = {
      id,
      createdAt:
        new Date()
          .toISOString(),

      restaurantId:
        restaurantId ??
        null,

      ...input,

      diagnostics:
        this
          .getDiagnosticSnapshot(
            restaurantId
          )
    };

    items.push(
      record
    );

    while (
      items.length >
      50
    ) {
      items.shift();
    }

    this.writeAll(
      items
    );

    return structuredClone(
      record
    );
  }


  list() {
    return this
      .readAll()
      .map(
        item =>
          structuredClone(
            item
          )
      )
      .reverse();
  }


  getSummary() {
    const items =
      this.readAll();

    const categoryCounts =
      Object.fromEntries(
        FEEDBACK_CATEGORIES
          .map(
            item => [
              item.id,
              items.filter(
                feedback =>
                  feedback.category ===
                  item.id
              ).length
            ]
          )
      );

    const averageRating =
      items.length >
        0
        ? Number(
            (
              items.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  (
                    Number(
                      item.rating
                    ) ||
                    0
                  ),
                0
              ) /
              items.length
            ).toFixed(
              1
            )
          )
        : null;

    return {
      count:
        items.length,
      averageRating,
      categoryCounts
    };
  }


  exportReport() {
    const report = {
      app:
        getReleaseLabel(),
      exportedAt:
        new Date()
          .toISOString(),
      feedback:
        this.readAll()
    };

    return JSON.stringify(
      report,
      null,
      2
    );
  }


  clear() {
    this.storage
      .removeItem(
        this.storageKey
      );
  }
}


export const feedbackSystem =
  new FeedbackSystem();


export {
  FeedbackSystem,
  FeedbackMemoryStorage,
  FEEDBACK_CATEGORIES
};
