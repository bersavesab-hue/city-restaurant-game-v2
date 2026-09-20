function renderGlobalHud() {
  return (
    '<header class="ui-v2-hud" data-ui="global-hud">' +
      '<section class="ui-v2-hud__identity" data-ui-box="hud-identity">' +
        '<div class="ui-v2-box ui-v2-box--hud-avatar" data-ui-box="hud-avatar"></div>' +
        '<div class="ui-v2-hud__identity-copy">' +
          '<strong>集团视角</strong>' +
          '<small>管理旗下 3 家门店</small>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-hud__simulation" data-ui-box="hud-simulation">' +
        '<div class="ui-v2-box ui-v2-box--hud-weather" data-ui-box="hud-weather"></div>' +
        '<div class="ui-v2-hud__clock">' +
          '<small>第1年 4月10日 周三</small>' +
          '<strong class="ui-v2-tabular">11:30</strong>' +
        '</div>' +
        '<div class="ui-v2-hud__speed-row" data-ui-box="hud-speed-row">' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button">Ⅱ</button>' +
          '<button class="ui-v2-box ui-v2-box--hud-speed is-active" type="button">1x</button>' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button">2x</button>' +
          '<button class="ui-v2-box ui-v2-box--hud-speed" type="button">4x</button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-hud__resources" data-ui-box="hud-resources">' +
        '<div class="ui-v2-hud__resource-row ui-v2-hud__resource-row--money">' +
          '<span class="ui-v2-box ui-v2-box--hud-icon" data-ui-box="hud-money-icon"></span>' +
          '<strong class="ui-v2-tabular">¥52,800</strong>' +
          '<span class="ui-v2-box ui-v2-box--hud-resource-action" data-ui-box="hud-add"></span>' +
        '</div>' +
        '<div class="ui-v2-hud__resource-row ui-v2-hud__resource-row--level">' +
          '<span class="ui-v2-box ui-v2-box--hud-icon" data-ui-box="hud-level-icon"></span>' +
          '<strong>Lv.3</strong>' +
          '<span class="ui-v2-box ui-v2-box--hud-icon" data-ui-box="hud-rating-icon"></span>' +
          '<strong class="ui-v2-tabular">4.8</strong>' +
        '</div>' +
      '</section>' +
    '</header>'
  );
}

export {
  renderGlobalHud
};
