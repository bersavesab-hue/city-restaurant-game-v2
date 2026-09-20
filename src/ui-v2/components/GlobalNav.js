import {
  PRIMARY_NAV_ITEMS
} from "../contracts/UiFrameContract.js";

function renderGlobalNav() {
  return (
    '<nav class="ui-v2-nav" data-ui="global-nav" aria-label="主导航">' +
      PRIMARY_NAV_ITEMS
        .map(
          (
            item,
            index
          ) => (
            '<button class="ui-v2-nav__item' +
              (
                index ===
                0
                  ? ' is-active'
                  : ''
              ) +
              '" type="button" data-ui-destination="' +
              item.id +
            '">' +
              '<span class="ui-v2-box ui-v2-box--nav-icon" data-ui-box="nav-icon"></span>' +
              '<strong>' +
                item.label +
              '</strong>' +
            '</button>'
          )
        )
        .join(
          ""
        ) +
    '</nav>'
  );
}

export {
  renderGlobalNav
};
