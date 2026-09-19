import {
  gameState
} from "../../../core/GameState.js";

import {
  timeSystem
} from "../../../core/TimeSystem.js";

import {
  saveSystem
} from "../../../core/SaveSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  financeSystem
} from "../../../systems/FinanceSystem.js";


class SettingsPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    return {
      pageId: "settings",
      title: "设置",
      restaurantId,
      restaurant,
      balance:
        financeSystem.getBalance(
          restaurantId
        ),
      runtime:
        gameState.getSection(
          "runtime"
        ),
      time:
        gameState.getSection(
          "time"
        ),
      save: {
        slot: "auto",
        exists:
          saveSystem.has(
            "auto"
          )
      }
    };
  }


  setSpeed(
    speed
  ) {
    return timeSystem
      .setSpeed(
        Number(speed)
      );
  }


  togglePause() {
    const runtime =
      gameState.getSection(
        "runtime"
      );

    if (runtime.paused) {
      timeSystem.resume();
    } else {
      timeSystem.pause();
    }

    return gameState.getSection(
      "runtime"
    );
  }


  saveNow() {
    return saveSystem.save(
      "auto"
    );
  }


  loadNow() {
    if (
      !saveSystem.has(
        "auto"
      )
    ) {
      throw new Error(
        "当前没有可读取的自动存档"
      );
    }

    return saveSystem.load(
      "auto"
    );
  }
}


export const settingsPageSystem =
  new SettingsPageSystem();


export {
  SettingsPageSystem
};
