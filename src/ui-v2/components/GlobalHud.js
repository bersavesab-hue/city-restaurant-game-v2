function renderGlobalHud() {
  return (
    '<header class="ui-v2-hud ui-v2-hud--revamp" data-ui="global-hud">' +
      '<section class="ui-v2-hud__identity" data-ui-box="hud-identity">' +
        '<div class="ui-v2-box ui-v2-box--hud-avatar" data-ui-box="hud-avatar"></div>' +
        '<div class="ui-v2-hud__identity-copy">' +
          '<strong data-live="hud-scope-title">单店视角</strong>' +
          '<small data-live="hud-scope-subtitle">尚未创建门店</small>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-hud__simulation" data-ui-box="hud-simulation">' +
        '<div class="ui-v2-box ui-v2-box--hud-weather" data-ui-box="hud-weather"></div>' +
        '<div class="ui-v2-hud__clock">' +
          '<small data-live="hud-date">第1年 1月1日 周一</small>' +
          '<strong class="ui-v2-tabular" data-live="hud-time">08:00</strong>' +
        '</div>' +
        '<div class="ui-v2-hud__speed-row" data-ui-box="hud-speed-row">' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button" data-hud-action="toggle-pause">▶</button>' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button" data-hud-speed="1">1x</button>' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button" data-hud-speed="2">2x</button>' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button" data-hud-speed="4">4x</button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-hud__resources" data-ui-box="hud-resources">' +
        '<div class="ui-v2-hud__resource-card">' +
          '<span class="ui-v2-box ui-v2-box--hud-icon" data-ui-box="hud-money-icon"></span>' +
          '<strong class="ui-v2-tabular ui-v2-hud__money" data-live="hud-money">¥0</strong>' +
          '<span class="ui-v2-box ui-v2-box--hud-resource-action" data-ui-box="hud-add"></span>' +
        '</div>' +
        '<div class="ui-v2-hud__resource-card ui-v2-hud__resource-card--level">' +
          '<span class="ui-v2-box ui-v2-box--hud-icon" data-ui-box="hud-level-icon"></span>' +
          '<strong data-live="hud-level">Lv.1</strong>' +
          '<span class="ui-v2-box ui-v2-box--hud-icon" data-ui-box="hud-rating-icon"></span>' +
          '<strong class="ui-v2-tabular" data-live="hud-rating">—</strong>' +
        '</div>' +
      '</section>' +
    '</header>'
  );
}

export {
  renderGlobalHud
};
