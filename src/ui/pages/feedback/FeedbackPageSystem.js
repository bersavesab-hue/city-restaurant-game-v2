import {
  feedbackSystem
} from "../../../systems/FeedbackSystem.js";

import {
  restaurantSystem
} from "../../../systems/RestaurantSystem.js";

import {
  RELEASE_INFO,
  getReleaseLabel
} from "../../../release/ReleaseInfo.js";


class FeedbackPageSystem {
  getPage(
    restaurantId
  ) {
    const restaurant =
      restaurantSystem.get(
        restaurantId
      );

    return {
      pageId:
        "feedback",

      title:
        "测试反馈",

      restaurantId,

      restaurant: {
        id:
          restaurant.id,
        name:
          restaurant.name
      },

      release:
        structuredClone(
          RELEASE_INFO
        ),

      releaseLabel:
        getReleaseLabel(),

      categories:
        feedbackSystem
          .getCategories(),

      summary:
        feedbackSystem
          .getSummary(),

      recent:
        feedbackSystem
          .list()
          .slice(
            0,
            8
          )
    };
  }


  submit(
    restaurantId,
    payload
  ) {
    return feedbackSystem
      .submit({
        restaurantId,
        ...payload
      });
  }


  exportReport() {
    return feedbackSystem
      .exportReport();
  }


  clear() {
    feedbackSystem.clear();
  }
}


export const feedbackPageSystem =
  new FeedbackPageSystem();


export {
  FeedbackPageSystem
};
