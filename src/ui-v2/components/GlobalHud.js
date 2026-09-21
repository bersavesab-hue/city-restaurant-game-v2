function renderGlobalHud() {
  return (
    '<header class="ui-v2-hud" data-ui="global-hud">' +
      '<section class="ui-v2-hud__identity" data-ui-box="hud-identity">' +
        '<div class="ui-v2-hud__avatar" data-ui-box="hud-avatar" aria-hidden="true"></div>' +
        '<button class="ui-v2-hud__scope" type="button" aria-label="切换管理视角">' +
          '<span class="ui-v2-hud__scope-icon" aria-hidden="true"></span>' +
          '<span class="ui-v2-hud__identity-copy">' +
            '<strong data-live="hud-scope-title">集团视角</strong>' +
            '<small data-live="hud-scope-subtitle">管理旗下 3 家门店</small>' +
          '</span>' +
          '<span class="ui-v2-hud__scope-chevron" aria-hidden="true"></span>' +
        '</button>' +
      '</section>' +

      '<section class="ui-v2-hud__simulation" data-ui-box="hud-simulation">' +
        '<div class="ui-v2-hud__weather" data-ui-box="hud-weather" aria-hidden="true"></div>' +
        '<div class="ui-v2-hud__clock">' +
          '<small data-live="hud-date">第1年 4月10日 周三</small>' +
          '<strong class="ui-v2-tabular" data-live="hud-time">11:30</strong>' +
        '</div>' +
        '<div class="ui-v2-hud__speed-row" data-ui-box="hud-speed-row" role="group" aria-label="时间速度">' +
          '<button class="ui-v2-hud__pause" type="button" data-hud-action="toggle-pause" aria-label="暂停">Ⅱ</button>' +
          '<button class="ui-v2-hud__speed" type="button" data-hud-speed="1">1x</button>' +
          '<button class="ui-v2-hud__speed" type="button" data-hud-speed="2">2x</button>' +
          '<button class="ui-v2-hud__speed" type="button" data-hud-speed="4">4x</button>' +
        '</div>' +
      '</section>' +

      '<section class="ui-v2-hud__resources" data-ui-box="hud-resources">' +
        '<div class="ui-v2-hud__resource-row ui-v2-hud__resource-row--money">' +
          '<span class="ui-v2-hud__resource-icon is-money" data-ui-box="hud-money-icon"></span>' +
          '<strong class="ui-v2-tabular ui-v2-hud__money" data-live="hud-money" title="¥52,800">¥52,800</strong>' +
          '<button class="ui-v2-hud__resource-action" type="button" data-ui-box="hud-add" aria-label="资金"></button>' +
        '</div>' +
        '<div class="ui-v2-hud__resource-row ui-v2-hud__resource-row--level">' +
          '<span class="ui-v2-hud__resource-icon is-crown" data-ui-box="hud-level-icon"></span>' +
          '<strong class="ui-v2-hud__level" data-live="hud-level">Lv.3</strong>' +
          '<span class="ui-v2-hud__resource-icon is-star" data-ui-box="hud-rating-icon"></span>' +
          '<strong class="ui-v2-tabular ui-v2-hud__rating" data-live="hud-rating">4.8</strong>' +
        '</div>' +
      '</section>' +
    '</header>'
  );
}

export {
  renderGlobalHud
};
