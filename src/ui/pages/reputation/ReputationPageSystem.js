import {
  wordOfMouthSystem
} from "../../../systems/WordOfMouthSystem.js";

class ReputationPageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      wordOfMouthSystem
        .getDashboard(
          restaurantId
        );

    return {
      pageId:
        "reputation",

      title:
        "评价与口碑",

      ...dashboard
    };
  }
}

export const reputationPageSystem =
  new ReputationPageSystem();

export {
  ReputationPageSystem
};
