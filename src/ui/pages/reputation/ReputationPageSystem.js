import {
  wordOfMouthSystem
} from "../../../systems/WordOfMouthSystem.js";

import {
  buildFormalPageChrome
} from "../../components/FormalPageChromeModel.js";

class ReputationPageSystem {
  getPage(
    restaurantId
  ) {
    const dashboard =
      wordOfMouthSystem
        .getDashboard(
          restaurantId
        );

    const notices =
      [];

    if (
      dashboard.negatives >
      dashboard.positives
    ) {
      notices.push({
        id:
          "reputation_negative",

        type:
          "warning",

        title:
          "口碑预警",

        message:
          "近期负面反馈高于正面反馈，建议检查顾客体验",

        priority:
          90
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices
        }
      );

    const notices =
      [];

    if (
      dashboard.negatives >
      dashboard.positives
    ) {
      notices.push({
        id:
          "reputation_negative",
        type:
          "warning",
        title:
          "口碑预警",
        message:
          "近期负面反馈高于正面反馈，建议检查顾客体验",
        priority:
          90
      });
    }

    const chrome =
      buildFormalPageChrome(
        restaurantId,
        {
          notices
        }
      );

    return {
      pageId:
        "reputation",

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

      topBar:
        chrome.topBar,

      noticeTicker:
        chrome.noticeTicker,

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
