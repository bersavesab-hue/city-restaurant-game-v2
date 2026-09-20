import {
  escapeHtml
} from "../utils/escapeHtml.js";

const PRIMARY_NAV_ITEMS =
  Object.freeze([
    Object.freeze({
      id: "city",
      label: "城市",
      iconKey: "city"
    }),
    Object.freeze({
      id: "store",
      label: "门店",
      iconKey: "store"
    }),
    Object.freeze({
      id: "operations",
      label: "经营",
      iconKey: "operations"
    }),
    Object.freeze({
      id: "employees",
      label: "员工",
      iconKey: "employees"
    }),
    Object.freeze({
      id: "more",
      label: "更多",
      iconKey: "more"
    })
  ]);

function renderGlobalNav({
  activeId = "city",
  badges = {}
} = {}) {
  const items =
    PRIMARY_NAV_ITEMS
      .map(
        item => {
          const active =
            item.id ===
            activeId;

          const badgeValue =
            badges[
              item.id
            ];

          const badge =
            (
              Number.isFinite(
                Number(
                  badgeValue
                )
              ) &&
              Number(
                badgeValue
              ) > 0
            )
              ? (
                  '<span class="ui-v2-nav__badge ui-v2-no-truncate-number">' +
                    escapeHtml(
                      Math.min(
                        99,
                        Number(
                          badgeValue
                        )
                      )
                    ) +
                  '</span>'
                )
              : "";

          return (
            '<button ' +
              'class="ui-v2-nav__item ui-v2-hit-target' +
              (
                active
                  ? ' is-active'
                  : ''
              ) +
              '" ' +
              'type="button" ' +
              'data-ui-destination="' +
              escapeHtml(
                item.id
              ) +
              '" ' +
              'aria-current="' +
              (
                active
                  ? 'page'
                  : 'false'
              ) +
            '">' +
              '<span class="ui-v2-nav__indicator" aria-hidden="true">' +
                '<span class="ui-v2-nav__icon-slot" data-icon-key="' +
                  escapeHtml(
                    item.iconKey
                  ) +
                '"></span>' +
                badge +
              '</span>' +
              '<span class="ui-v2-nav__label">' +
                escapeHtml(
                  item.label
                ) +
              '</span>' +
            '</button>'
          );
        }
      )
      .join(
        ""
      );

  return (
    '<nav class="ui-v2-global-nav ui-v2-nav" data-ui="global-nav" aria-label="主导航">' +
      items +
    '</nav>'
  );
}

export {
  PRIMARY_NAV_ITEMS,
  renderGlobalNav
};
