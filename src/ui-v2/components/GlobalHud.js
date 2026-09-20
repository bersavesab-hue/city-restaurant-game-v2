import {
  escapeHtml
} from "../utils/escapeHtml.js";

const ALLOWED_SPEEDS =
  Object.freeze([
    1,
    2,
    4
  ]);

function normalizeGlobalHudModel(
  model = {}
) {
  const speed =
    ALLOWED_SPEEDS.includes(
      Number(
        model.speed
      )
    )
      ? Number(
          model.speed
        )
      : 1;

  return Object.freeze({
    scopeTitle:
      String(
        model.scopeTitle ??
        ""
      ),
    scopeSubtitle:
      String(
        model.scopeSubtitle ??
        ""
      ),
    dateLabel:
      String(
        model.dateLabel ??
        ""
      ),
    timeLabel:
      String(
        model.timeLabel ??
        ""
      ),
    moneyLabel:
      String(
        model.moneyLabel ??
        ""
      ),
    levelLabel:
      String(
        model.levelLabel ??
        ""
      ),
    ratingLabel:
      String(
        model.ratingLabel ??
        ""
      ),
    paused:
      Boolean(
        model.paused
      ),
    speed
  });
}

function renderGlobalHud(
  model = {}
) {
  const data =
    normalizeGlobalHudModel(
      model
    );

  const speedButtons =
    ALLOWED_SPEEDS
      .map(
        value =>
          (
            '<button ' +
              'class="ui-v2-hud__speed ui-v2-hit-target' +
              (
                data.speed ===
                value
                  ? ' is-active'
                  : ''
              ) +
              '" ' +
              'type="button" ' +
              'data-ui-action="set-speed" ' +
              'data-speed="' +
              value +
              '" ' +
              'aria-pressed="' +
              (
                data.speed ===
                value
                  ? 'true'
                  : 'false'
              ) +
            '">' +
              value +
              '×' +
            '</button>'
          )
      )
      .join(
        ""
      );

  return (
    '<header class="ui-v2-global-hud ui-v2-hud" data-ui="global-hud">' +
      '<div class="ui-v2-hud__identity">' +
        '<button class="ui-v2-hud__scope ui-v2-hit-target" type="button" data-ui-action="change-scope">' +
          '<span class="ui-v2-hud__avatar-slot" data-icon-slot="scope" aria-hidden="true"></span>' +
          '<span class="ui-v2-hud__scope-copy">' +
            '<strong>' +
              escapeHtml(
                data.scopeTitle
              ) +
            '</strong>' +
            '<small>' +
              escapeHtml(
                data.scopeSubtitle
              ) +
            '</small>' +
          '</span>' +
          '<span class="ui-v2-hud__scope-indicator" aria-hidden="true"></span>' +
        '</button>' +
      '</div>' +

      '<div class="ui-v2-hud__simulation">' +
        '<div class="ui-v2-hud__clock">' +
          '<small>' +
            escapeHtml(
              data.dateLabel
            ) +
          '</small>' +
          '<strong class="ui-v2-no-truncate-number">' +
            escapeHtml(
              data.timeLabel
            ) +
          '</strong>' +
        '</div>' +

        '<div class="ui-v2-hud__time-controls" role="group" aria-label="时间控制">' +
          '<button class="ui-v2-hud__pause ui-v2-hit-target' +
            (
              data.paused
                ? ' is-active'
                : ''
            ) +
            '" type="button" data-ui-action="toggle-pause" aria-pressed="' +
            (
              data.paused
                ? 'true'
                : 'false'
            ) +
          '">' +
            (
              data.paused
                ? '继续'
                : '暂停'
            ) +
          '</button>' +
          speedButtons +
        '</div>' +
      '</div>' +

      '<div class="ui-v2-hud__resources">' +
        '<div class="ui-v2-hud__resource ui-v2-hud__resource--money">' +
          '<span class="ui-v2-hud__resource-icon" data-icon-slot="money" aria-hidden="true"></span>' +
          '<strong class="ui-v2-no-truncate-number">' +
            escapeHtml(
              data.moneyLabel
            ) +
          '</strong>' +
        '</div>' +

        '<div class="ui-v2-hud__progress">' +
          '<strong class="ui-v2-no-truncate-number">' +
            escapeHtml(
              data.levelLabel
            ) +
          '</strong>' +
          '<small class="ui-v2-no-truncate-number">' +
            escapeHtml(
              data.ratingLabel
            ) +
          '</small>' +
        '</div>' +
      '</div>' +
    '</header>'
  );
}

export {
  ALLOWED_SPEEDS,
  normalizeGlobalHudModel,
  renderGlobalHud
};
