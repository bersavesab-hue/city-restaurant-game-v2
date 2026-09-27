function money(value) {
  return (
    "¥" +
    Math.round(
      Number(value) || 0
    ).toLocaleString("zh-CN")
  );
}

function signedPercent(value) {
  const number =
    Math.round(
      Number(value) || 0
    );

  return (
    number > 0
      ? `+${number}%`
      : number < 0
        ? `${number}%`
        : "0%"
  );
}

function trendTone(value) {
  const number =
    Number(value) || 0;

  return number > 0
    ? "positive"
    : number < 0
      ? "negative"
      : "neutral";
}

function satisfactionLabel(value) {
  const number =
    Number(value) || 0;

  if (number >= 85) {
    return "口碑很好";
  }

  if (number >= 70) {
    return "状态稳定";
  }

  return "有待提升";
}

function staffStatusLabel(value) {
  const number =
    Number(value) || 0;

  if (number >= 4) {
    return "工作正常";
  }

  if (number >= 2) {
    return "人手偏紧";
  }

  return "急需补员";
}

function districtLevel(value, type = "normal") {
  const number =
    Number(value) || 0;

  if (type === "competition") {
    return number >= 75
      ? "较高"
      : number >= 55
        ? "中等"
        : "较低";
  }

  return number >= 75
    ? "较高 ↑"
    : number >= 55
      ? "中等"
      : "偏低";
}

function renderHud(model) {
  return `
    <header
      class="home-component-hud"
      data-ui-component="home-hud"
      data-layout-key="home-hud"
    >
      <div class="home-hud-chip day">
        <span class="home-hud-icon">☀</span>
        <div>
          <strong>第${model.time.day}天</strong>
          <small>经营日</small>
        </div>
      </div>

      <div class="home-hud-chip">
        <span class="home-hud-icon">◷</span>
        <div>
          <strong data-bind="clock">${model.time.clock}</strong>
          <small>营业中</small>
        </div>
      </div>

      <div class="home-hud-chip money">
        <span class="home-hud-icon">¥</span>
        <div>
          <small>资金</small>
          <strong>${money(model.money.balance)}</strong>
        </div>
      </div>

      <div class="home-hud-chip rating">
        <span class="home-hud-icon">★</span>
        <div>
          <small>星级评价</small>
          <strong>${model.restaurant.reviewScore.toFixed(1)}分</strong>
        </div>
      </div>

      <div class="home-hud-chip level">
        <span class="home-hud-icon">♛</span>
        <div>
          <strong>Lv.${model.restaurant.level}</strong>
          <small>${model.restaurant.title}</small>
        </div>
      </div>

      <button
        class="home-hud-settings"
        type="button"
        data-nav="more"
        aria-label="设置"
      >⚙</button>
    </header>
  `;
}

function renderKpis(model) {
  const items = [
    {
      icon: "¥",
      label: "今日营业额",
      value: money(model.money.todayRevenue),
      foot: `${model.money.revenueTrend >= 0 ? "↑" : "↓"} ${signedPercent(model.money.revenueTrend)}`,
      tone: trendTone(model.money.revenueTrend),
      kind: "revenue"
    },
    {
      icon: "▮",
      label: "今日利润",
      value: money(model.money.todayProfit),
      foot: `${model.money.profitTrend >= 0 ? "↑" : "↓"} ${signedPercent(model.money.profitTrend)}`,
      tone: trendTone(model.money.profitTrend),
      kind: "profit"
    },
    {
      icon: "☺",
      label: "满意度",
      value: `${Math.round(model.restaurant.satisfaction)}%`,
      foot: satisfactionLabel(model.restaurant.satisfaction),
      tone: "positive",
      kind: "satisfaction"
    },
    {
      icon: "人",
      label: "在岗员工",
      value: String(model.operations.employees),
      foot: staffStatusLabel(model.operations.employees),
      tone:
        model.operations.employees >= 4
          ? "positive"
          : model.operations.employees >= 2
            ? "neutral"
            : "negative",
      kind: "staff"
    }
  ];

  return `
    <div
      class="home-component-kpis"
      data-ui-component="home-kpis"
      data-layout-key="home-kpis"
    >
      ${items.map(item => `
        <article class="home-kpi-card ${item.kind}">
          <div class="home-kpi-head">
            <span class="home-kpi-icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>
          <strong>${item.value}</strong>
          <small class="${item.tone}">${item.foot}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function renderOpportunity(model) {
  const tags =
    (model.opportunity.tags ?? [])
      .slice(0, 4);

  return `
    <section
      class="home-component-card home-opportunity-card"
      data-ui-component="home-opportunity"
      data-layout-key="home-opportunity"
    >
      <header class="home-card-band opportunity-band">
        <h2>今日机会</h2>
        <span>把握商圈动态，让小店更进一步！</span>
        <button
          type="button"
          data-nav="business"
        >查看完整商圈情报 ›</button>
      </header>

      <div class="home-opportunity-body">
        <div class="home-opportunity-copy">
          <strong>${model.opportunity.title}</strong>
          <p>${model.opportunity.detail}</p>
          <div class="home-opportunity-tags">
            ${tags.map(tag => `
              <span>${tag}</span>
            `).join("")}
          </div>
        </div>

        <div class="home-opportunity-aside">
          <div class="home-opportunity-thumb">
            <strong>${model.district?.name ?? "当前商圈"}</strong>
            <span>
              机会指数
              ${Math.round(model.district?.opportunityScore ?? 0)}
            </span>
          </div>
          <button
            class="home-primary-action"
            type="button"
            data-nav="business"
          >去经营 ›</button>
        </div>
      </div>
    </section>
  `;
}

function renderGrowth(model) {
  const percent =
    model.progress.maxLevel
      ? 100
      : Math.round(
          model.progress.progress * 100
        );

  return `
    <section
      class="home-component-card home-growth-card"
      data-ui-component="home-growth"
      data-layout-key="home-growth"
    >
      <header class="home-card-band blue">
        <h3>▣ 门店成长</h3>
        <span>从一家小店，做出一座城市的味道！</span>
      </header>

      <div class="home-card-body growth-body">
        <div class="growth-copy">
          <small>下一阶段</small>
          <strong>
            ${model.progress.maxLevel
              ? model.progress.title
              : model.progress.nextTitle}
          </strong>
          <b>${model.progress.maxLevel ? "MAX" : percent + "%"}</b>
        </div>

        <div class="home-progress-track">
          <i style="width:${percent}%"></i>
        </div>

        <div class="growth-actions">
          <button type="button" data-open-sheet="renovation">
            <span>◆</span>
            <strong>装修</strong>
          </button>
          <button type="button" data-nav="staff">
            <span>●</span>
            <strong>员工</strong>
          </button>
          <button type="button" data-nav="research">
            <span>♨</span>
            <strong>研发</strong>
          </button>
          <button type="button" data-nav="business">
            <span>▮</span>
            <strong>经营</strong>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderDialogue(model) {
  return `
    <section
      class="home-component-card home-dialogue-card"
      data-ui-component="home-dialogue"
      data-layout-key="home-dialogue"
    >
      <header class="home-card-band blue">
        <h3>● 店内动态</h3>
        <button type="button" data-nav="staff">更多 ›</button>
      </header>

      <div class="home-card-body dialogue-body">
        ${model.dialogue.slice(0, 3).map((item, index) => `
          <article class="dialogue-row">
            <span class="dialogue-avatar avatar-${index}">
              ${item.speaker.slice(0, 1)}
            </span>
            <div>
              <header>
                <strong>${item.speaker}</strong>
                <em>${item.role}</em>
                <time>${item.time}</time>
              </header>
              <p>${item.text}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDistrict(model) {
  const district =
    model.district;

  const items = district
    ? [
        {
          icon: "♨",
          label: "本区热度",
          value: districtLevel(district.trafficIndex)
        },
        {
          icon: "●●",
          label: "主力客群",
          value: district.mainCustomer
        },
        {
          icon: "↗",
          label: "外卖热度",
          value:
            district.deliveryDemand >= 75
              ? "上升 ↑"
              : districtLevel(district.deliveryDemand)
        },
        {
          icon: "▮",
          label: "竞争强度",
          value: districtLevel(
            district.competition,
            "competition"
          )
        }
      ]
    : [
        { icon: "♨", label: "本区热度", value: "--" },
        { icon: "●●", label: "主力客群", value: "--" },
        { icon: "↗", label: "外卖热度", value: "--" },
        { icon: "▮", label: "竞争强度", value: "--" }
      ];

  return `
    <section
      class="home-component-card home-district-card"
      data-ui-component="home-district"
      data-layout-key="home-district"
    >
      <header class="home-card-band teal">
        <h3>⌖ 商圈情报</h3>
        <span>关注周边，抓住更多客流机会</span>
        <button type="button" data-nav="business">更多 ›</button>
      </header>

      <div class="home-card-body district-body">
        ${items.map(item => `
          <article class="district-tile">
            <span class="district-icon">${item.icon}</span>
            <strong>${item.label}</strong>
            <small>${item.value}</small>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSchedule(model) {
  return `
    <section
      class="home-component-card home-schedule-card"
      data-ui-component="home-schedule"
      data-layout-key="home-schedule"
    >
      <header class="home-card-band blue">
        <h3>▦ 今日日程</h3>
        <button type="button" data-advance="30">推进 ›</button>
      </header>

      <div class="home-card-body schedule-body">
        ${model.schedule.slice(0, 4).map(item => `
          <article class="schedule-row ${item.status}">
            <i></i>
            <time>${item.time}</time>
            <span>${item.title}</span>
            <strong>
              ${item.status === "done"
                ? "已完成"
                : item.status === "active"
                  ? "进行中"
                  : "未开始"}
            </strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderHomeNav() {
  const items = [
    ["store", "门店", "⌂"],
    ["business", "经营", "▦"],
    ["research", "研发", "✦"],
    ["staff", "员工", "♟"],
    ["more", "更多", "•••"]
  ];

  return `
    <nav
      class="home-component-nav"
      data-ui-component="home-bottom-nav"
      data-layout-key="home-bottom-nav"
    >
      ${items.map(([id, label, icon]) => `
        <button
          class="${id === "store" ? "is-active" : ""}"
          type="button"
          data-nav="${id}"
        >
          <span>${icon}</span>
          <strong>${label}</strong>
        </button>
      `).join("")}
    </nav>
  `;
}

function renderHomePage(model) {
  if (model.empty) {
    return `
      <section class="home-components-page">
        <div class="home-empty-card">
          当前没有可经营门店。
        </div>
      </section>
    `;
  }

  return `
    <section
      class="home-components-page"
      data-ui-component="home-page"
      data-layout-key="home-page"
      data-home-layout-version="component-v1"
    >
      <section
        class="home-scene"
        data-ui-component="home-scene"
        data-layout-key="home-scene"
      >
        <img
          class="home-scene-artwork"
          src="assets/home/restaurant-hero.jpg"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        ${renderHud(model)}
        ${renderKpis(model)}
      </section>

      ${renderOpportunity(model)}

      <div
        class="home-component-grid upper"
        data-layout-key="home-upper-grid"
      >
        ${renderGrowth(model)}
        ${renderDialogue(model)}
      </div>

      <div
        class="home-component-grid lower"
        data-layout-key="home-lower-grid"
      >
        ${renderDistrict(model)}
        ${renderSchedule(model)}
      </div>

      ${renderHomeNav()}
    </section>
  `;
}

export {
  renderHomePage
};
