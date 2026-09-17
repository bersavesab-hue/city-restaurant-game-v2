import {
  operatingCommandCenterSystem
} from "../../../systems/OperatingCommandCenterSystem.js";


class OperatingCommandCenterPageSystem {
  getPage(
    restaurantId
  ) {
    return {
      pageId:
        "operating-command-center",

      title:
        "经营总控",

      ...operatingCommandCenterSystem
        .getDashboard(
          restaurantId
        )
    };
  }
}


export const operatingCommandCenterPageSystem =
  new OperatingCommandCenterPageSystem();

export {
  OperatingCommandCenterPageSystem
};
