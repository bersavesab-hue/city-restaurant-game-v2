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
                index === 0
                  ? ' is-active'
                  : ''
              ) +
              '" type="button" data-ui-box="nav-cell" data-ui-key="' +
              item.id +
              '" data-ui-destination="' +
              item.id +
              (item.id === "city"
                ? '" aria-current="page">'
                : '" aria-haspopup="dialog">') +
              '<span class="ui-v2-nav__icon-slot" data-ui-box="nav-icon"></span>' +
              '<strong class="ui-v2-nav__label" data-ui-text="nav-label">' +
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
